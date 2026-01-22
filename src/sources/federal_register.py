"""Federal Register API client for NAFSMA Legislative Tracker."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

import requests

logger = logging.getLogger(__name__)

# Federal Register API base URL (no authentication required)
API_BASE = "https://www.federalregister.gov/api/v1"

# Document type mapping: human-readable name -> API code
DOC_TYPE_CODES = {
    "Rule": "RULE",
    "Proposed Rule": "PRORULE",
    "Notice": "NOTICE",
    "Presidential Document": "PRESDOCU",
}


@dataclass
class FederalRegisterDocument:
    """Structured Federal Register document information."""

    document_number: str
    title: str
    doc_type: str  # "Notice", "Proposed Rule", "Rule"
    abstract: str | None
    agencies: list[str]
    publication_date: str
    html_url: str
    pdf_url: str | None
    comments_close_on: str | None  # Date string or None
    docket_ids: list[str]

    @property
    def days_until_comment_close(self) -> int | None:
        """Calculate days until comment period closes."""
        if not self.comments_close_on:
            return None
        try:
            close_date = datetime.strptime(self.comments_close_on, "%Y-%m-%d")
            delta = close_date - datetime.now()
            return delta.days
        except ValueError:
            return None

    @property
    def is_comment_period_closing_soon(self) -> bool:
        """Check if comment period closes within 7 days."""
        days = self.days_until_comment_close
        return days is not None and 0 <= days <= 7

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "document_number": self.document_number,
            "title": self.title,
            "doc_type": self.doc_type,
            "abstract": self.abstract,
            "agencies": self.agencies,
            "publication_date": self.publication_date,
            "html_url": self.html_url,
            "pdf_url": self.pdf_url,
            "comments_close_on": self.comments_close_on,
            "docket_ids": self.docket_ids,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "FederalRegisterDocument":
        """Create from dictionary."""
        return cls(
            document_number=data["document_number"],
            title=data["title"],
            doc_type=data["doc_type"],
            abstract=data.get("abstract"),
            agencies=data.get("agencies", []),
            publication_date=data["publication_date"],
            html_url=data["html_url"],
            pdf_url=data.get("pdf_url"),
            comments_close_on=data.get("comments_close_on"),
            docket_ids=data.get("docket_ids", []),
        )


class FederalRegisterClient:
    """Client for the Federal Register API."""

    def __init__(self, api_base: str = API_BASE):
        """Initialize the Federal Register API client.

        Args:
            api_base: Base URL for the API (no auth required).
        """
        self.api_base = api_base.rstrip("/")
        self.session = requests.Session()

    def _make_request(
        self,
        endpoint: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Make a request to the Federal Register API.

        Args:
            endpoint: API endpoint path.
            params: Query parameters.

        Returns:
            JSON response data.

        Raises:
            requests.HTTPError: If the request fails.
        """
        url = f"{self.api_base}/{endpoint.lstrip('/')}"
        params = params or {}

        logger.debug(f"Requesting: {url}")
        response = self.session.get(url, params=params, timeout=30)
        response.raise_for_status()

        return response.json()

    def search_documents(
        self,
        agencies: list[str] | None = None,
        doc_types: list[str] | None = None,
        publication_date_gte: str | None = None,
        publication_date_lte: str | None = None,
        per_page: int = 50,
        page: int = 1,
    ) -> dict[str, Any]:
        """Search Federal Register documents.

        Args:
            agencies: List of agency slugs (e.g., "federal-emergency-management-agency").
            doc_types: List of document types ("Notice", "Proposed Rule", "Rule").
            publication_date_gte: Filter by publication date >= (YYYY-MM-DD).
            publication_date_lte: Filter by publication date <= (YYYY-MM-DD).
            per_page: Results per page (max 1000).
            page: Page number.

        Returns:
            API response with results and pagination info.
        """
        # Build params list for proper array handling
        params_list: list[tuple[str, str]] = [
            ("per_page", str(per_page)),
            ("page", str(page)),
            ("order", "newest"),
        ]

        # Add agency filters (multiple values with same key)
        if agencies:
            for agency in agencies:
                params_list.append(("conditions[agencies][]", agency))

        # Add document type filters (convert to API codes)
        if doc_types:
            for doc_type in doc_types:
                code = DOC_TYPE_CODES.get(doc_type, doc_type)
                params_list.append(("conditions[type][]", code))

        # Add date filters
        if publication_date_gte:
            params_list.append(("conditions[publication_date][gte]", publication_date_gte))
        if publication_date_lte:
            params_list.append(("conditions[publication_date][lte]", publication_date_lte))

        # Make request with params as list of tuples
        url = f"{self.api_base}/documents.json"
        logger.debug(f"Requesting: {url}")
        response = self.session.get(url, params=params_list, timeout=30)
        response.raise_for_status()
        return response.json()

    def get_documents_with_open_comments(
        self,
        agencies: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Get documents with currently open comment periods.

        Args:
            agencies: List of agency slugs to filter by.

        Returns:
            List of documents with open comment periods.
        """
        today = datetime.now().strftime("%Y-%m-%d")

        params: dict[str, Any] = {
            "per_page": 100,
            "order": "newest",
            "conditions[commenting_on][gte]": today,
        }

        if agencies:
            for agency in agencies:
                params[f"conditions[agencies][]"] = agency

        # Filter for types that typically have comment periods
        params["conditions[type][]"] = "Proposed Rule"

        data = self._make_request("documents.json", params)
        return data.get("results", [])

    def build_document(self, raw_data: dict[str, Any]) -> FederalRegisterDocument:
        """Build a FederalRegisterDocument from raw API data.

        Args:
            raw_data: Raw document data from the API.

        Returns:
            Structured FederalRegisterDocument object.
        """
        # Extract agency names
        agencies = []
        for agency in raw_data.get("agencies", []):
            name = agency.get("name") or agency.get("raw_name", "Unknown Agency")
            agencies.append(name)

        return FederalRegisterDocument(
            document_number=raw_data.get("document_number", ""),
            title=raw_data.get("title", "Untitled"),
            doc_type=raw_data.get("type", "Unknown"),
            abstract=raw_data.get("abstract"),
            agencies=agencies,
            publication_date=raw_data.get("publication_date", ""),
            html_url=raw_data.get("html_url", ""),
            pdf_url=raw_data.get("pdf_url"),
            comments_close_on=raw_data.get("comments_close_on"),
            docket_ids=raw_data.get("docket_ids", []),
        )


def fetch_agency_documents(
    client: FederalRegisterClient,
    config: dict[str, Any],
    days_back: int = 7,
) -> list[FederalRegisterDocument]:
    """Fetch recent documents from configured agencies.

    Args:
        client: Federal Register API client.
        config: Configuration with federal_register settings.
        days_back: Number of days to look back for documents.

    Returns:
        List of FederalRegisterDocument objects.
    """
    fr_config = config.get("federal_register", {})
    agencies = fr_config.get("agencies", [])
    doc_types = fr_config.get("document_types", ["Proposed Rule", "Rule", "Notice"])

    if not agencies:
        logger.warning("No agencies configured for Federal Register monitoring")
        return []

    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)

    agency_slugs = [a.get("slug") for a in agencies if a.get("slug")]

    all_documents: list[FederalRegisterDocument] = []

    # Fetch documents for each agency
    for agency in agencies:
        slug = agency.get("slug")
        name = agency.get("name", slug)

        if not slug:
            continue

        logger.info(f"Fetching Federal Register documents for {name}...")

        try:
            data = client.search_documents(
                agencies=[slug],
                doc_types=doc_types,
                publication_date_gte=start_date.strftime("%Y-%m-%d"),
                publication_date_lte=end_date.strftime("%Y-%m-%d"),
                per_page=50,
            )

            results = data.get("results", [])
            logger.info(f"Found {len(results)} documents for {name}")

            for raw_doc in results:
                doc = client.build_document(raw_doc)
                all_documents.append(doc)

        except requests.RequestException as e:
            logger.error(f"Error fetching documents for {name}: {e}")

    # Deduplicate by document number
    seen = set()
    unique_docs = []
    for doc in all_documents:
        if doc.document_number not in seen:
            seen.add(doc.document_number)
            unique_docs.append(doc)

    logger.info(f"Total unique Federal Register documents: {len(unique_docs)}")
    return unique_docs


def get_closing_comment_periods(
    documents: list[FederalRegisterDocument],
    warning_days: int = 7,
) -> list[FederalRegisterDocument]:
    """Get documents with comment periods closing soon.

    Args:
        documents: List of Federal Register documents.
        warning_days: Number of days threshold for "closing soon".

    Returns:
        List of documents with comment periods closing within warning_days.
    """
    closing_soon = []

    for doc in documents:
        days = doc.days_until_comment_close
        if days is not None and 0 <= days <= warning_days:
            closing_soon.append(doc)

    # Sort by days remaining (most urgent first)
    closing_soon.sort(key=lambda d: d.days_until_comment_close or 999)

    return closing_soon
