"""Congress.gov API client for NAFSMA Legislative Tracker."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Any

import requests

from src.utils.config import get_congress_api_key

logger = logging.getLogger(__name__)

# Retry configuration for intermittent API failures
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds


@dataclass
class BillInfo:
    """Structured bill information."""

    bill_id: str  # e.g., "119-hr-1234"
    bill_type: str  # e.g., "hr", "s"
    bill_number: int
    congress: int
    title: str
    introduced_date: str
    latest_action: str | None
    latest_action_date: str | None
    sponsor: str | None
    sponsor_party: str | None
    sponsor_state: str | None
    committees: list[str]
    policy_area: str | None
    url: str
    priority: str  # "critical", "high", or "normal"

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "bill_id": self.bill_id,
            "bill_type": self.bill_type,
            "bill_number": self.bill_number,
            "congress": self.congress,
            "title": self.title,
            "introduced_date": self.introduced_date,
            "latest_action": self.latest_action,
            "latest_action_date": self.latest_action_date,
            "sponsor": self.sponsor,
            "sponsor_party": self.sponsor_party,
            "sponsor_state": self.sponsor_state,
            "committees": self.committees,
            "policy_area": self.policy_area,
            "url": self.url,
            "priority": self.priority,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "BillInfo":
        """Create from dictionary."""
        return cls(
            bill_id=data["bill_id"],
            bill_type=data["bill_type"],
            bill_number=data["bill_number"],
            congress=data["congress"],
            title=data["title"],
            introduced_date=data["introduced_date"],
            latest_action=data.get("latest_action"),
            latest_action_date=data.get("latest_action_date"),
            sponsor=data.get("sponsor"),
            sponsor_party=data.get("sponsor_party"),
            sponsor_state=data.get("sponsor_state"),
            committees=data.get("committees", []),
            policy_area=data.get("policy_area"),
            url=data["url"],
            priority=data.get("priority", "normal"),
        )


class CongressApiClient:
    """Client for the Congress.gov API."""

    def __init__(
        self,
        api_key: str | None = None,
        api_base: str = "https://api.congress.gov/v3",
    ):
        """Initialize the Congress.gov API client.

        Args:
            api_key: Congress.gov API key. Defaults to CONGRESS_API_KEY env var.
            api_base: Base URL for the API.
        """
        self.api_key = api_key or get_congress_api_key()
        self.api_base = api_base.rstrip("/")
        self.session = requests.Session()
        self.session.params = {"api_key": self.api_key}  # type: ignore

    def _make_request(
        self,
        endpoint: str,
        params: dict[str, Any] | None = None,
        retries: int = MAX_RETRIES,
    ) -> dict[str, Any]:
        """Make a request to the Congress.gov API with retry logic.

        Args:
            endpoint: API endpoint path.
            params: Query parameters.
            retries: Number of retries for 503 errors.

        Returns:
            JSON response data.

        Raises:
            requests.HTTPError: If the request fails after retries.
        """
        url = f"{self.api_base}/{endpoint.lstrip('/')}"
        params = params or {}
        params["format"] = "json"

        last_error = None
        for attempt in range(retries + 1):
            try:
                logger.debug(f"Requesting: {url} (attempt {attempt + 1})")
                response = self.session.get(url, params=params, timeout=30)
                response.raise_for_status()
                return response.json()
            except requests.HTTPError as e:
                last_error = e
                if response.status_code == 503 and attempt < retries:
                    logger.warning(
                        f"API returned 503, retrying in {RETRY_DELAY}s "
                        f"(attempt {attempt + 1}/{retries + 1})"
                    )
                    time.sleep(RETRY_DELAY)
                else:
                    raise

        raise last_error  # Should not reach here, but for type safety

    def search_bills(
        self,
        query: str,
        congress: int | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        """Search for bills matching a query.

        Uses API text search first, falls back to local filtering if unavailable.

        Args:
            query: Search query string.
            congress: Congress number (e.g., 119). If None, searches all.
            limit: Maximum number of results.
            offset: Offset for pagination.

        Returns:
            List of bill data dictionaries.
        """
        # Try API text search first
        try:
            params = {
                "query": query,
                "limit": limit * 2 if congress else limit,
                "offset": offset,
                "sort": "updateDate+desc",
            }
            data = self._make_request("bill", params, retries=1)
            bills = data.get("bills", [])

            if congress:
                bills = [b for b in bills if b.get("congress") == congress][:limit]

            if bills:
                return bills
        except requests.HTTPError as e:
            if e.response.status_code == 503:
                logger.warning(
                    "Congress.gov text search unavailable, using local filtering"
                )
            else:
                raise

        # Fallback: fetch recent bills and filter locally by keywords
        return self._search_bills_local(query, congress, limit)

    def _search_bills_local(
        self,
        query: str,
        congress: int | None = None,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        """Search bills by fetching recent bills and filtering locally.

        Uses phrase matching when possible, falls back to multi-keyword AND.

        Args:
            query: Search query (treated as phrase if multi-word).
            congress: Congress number to filter by.
            limit: Maximum number of results.

        Returns:
            List of matching bill data dictionaries.
        """
        # Fetch recent bills from the specified congress (or all)
        endpoint = f"bill/{congress}" if congress else "bill"
        # Fetch more bills to have a good chance of finding matches
        data = self._make_request(endpoint, {"limit": 250, "sort": "updateDate+desc"})
        all_bills = data.get("bills", [])

        query_lower = query.lower().strip()
        keywords = [kw.lower() for kw in query.split() if len(kw) > 2]

        # Filter bills
        matching = []
        for bill in all_bills:
            title = bill.get("title", "").lower()

            # First try: exact phrase match
            if query_lower in title:
                matching.append(bill)
            # Second try: all significant keywords must be present
            elif len(keywords) >= 2 and all(kw in title for kw in keywords):
                matching.append(bill)
            # Third try: for single keyword queries, just match the keyword
            elif len(keywords) == 1 and keywords[0] in title:
                matching.append(bill)

            if len(matching) >= limit:
                break

        logger.info(f"Local search found {len(matching)} bills matching '{query}'")
        return matching

    def get_bill_details(
        self,
        congress: int,
        bill_type: str,
        bill_number: int,
    ) -> dict[str, Any]:
        """Get detailed information about a specific bill.

        Args:
            congress: Congress number (e.g., 119).
            bill_type: Bill type (e.g., "hr", "s", "hjres").
            bill_number: Bill number.

        Returns:
            Bill details dictionary.
        """
        endpoint = f"bill/{congress}/{bill_type.lower()}/{bill_number}"
        data = self._make_request(endpoint)
        return data.get("bill", {})

    def get_bill_actions(
        self,
        congress: int,
        bill_type: str,
        bill_number: int,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """Get actions/history for a specific bill.

        Args:
            congress: Congress number.
            bill_type: Bill type.
            bill_number: Bill number.
            limit: Maximum number of actions to return.

        Returns:
            List of action dictionaries.
        """
        endpoint = f"bill/{congress}/{bill_type.lower()}/{bill_number}/actions"
        data = self._make_request(endpoint, {"limit": limit})
        return data.get("actions", [])

    def get_bill_committees(
        self,
        congress: int,
        bill_type: str,
        bill_number: int,
    ) -> list[dict[str, Any]]:
        """Get committees associated with a bill.

        Args:
            congress: Congress number.
            bill_type: Bill type.
            bill_number: Bill number.

        Returns:
            List of committee dictionaries.
        """
        endpoint = f"bill/{congress}/{bill_type.lower()}/{bill_number}/committees"
        data = self._make_request(endpoint)
        return data.get("committees", [])

    def get_bill_subjects(
        self,
        congress: int,
        bill_type: str,
        bill_number: int,
    ) -> dict[str, Any]:
        """Get subjects and policy area for a bill.

        Args:
            congress: Congress number.
            bill_type: Bill type.
            bill_number: Bill number.

        Returns:
            Dict with 'policyArea' and 'legislativeSubjects' keys.
        """
        endpoint = f"bill/{congress}/{bill_type.lower()}/{bill_number}/subjects"
        try:
            data = self._make_request(endpoint)
            return data.get("subjects", {})
        except requests.HTTPError:
            logger.warning(f"Could not fetch subjects for {bill_type}{bill_number}")
            return {}

    def get_recent_bills(
        self,
        congress: int,
        limit: int = 250,
    ) -> list[dict[str, Any]]:
        """Fetch recent bills from a congress (reliable endpoint).

        Args:
            congress: Congress number.
            limit: Maximum number of bills to fetch.

        Returns:
            List of bill data dictionaries, sorted by update date.
        """
        endpoint = f"bill/{congress}"
        data = self._make_request(
            endpoint,
            {"limit": limit, "sort": "updateDate+desc"},
        )
        return data.get("bills", [])

    def filter_bills_by_title_keywords(
        self,
        bills: list[dict[str, Any]],
        keywords: list[str],
    ) -> list[dict[str, Any]]:
        """Filter bills by checking if title contains any keyword.

        Args:
            bills: List of bill data dictionaries.
            keywords: List of keywords to match (case-insensitive).

        Returns:
            Filtered list of bills.
        """
        keywords_lower = [kw.lower() for kw in keywords]
        matching = []

        for bill in bills:
            title = bill.get("title", "").lower()
            if any(kw in title for kw in keywords_lower):
                matching.append(bill)

        return matching

    def filter_bills_by_subjects(
        self,
        bills: list[dict[str, Any]],
        relevant_policy_areas: list[str],
        relevant_subjects: list[str],
    ) -> list[dict[str, Any]]:
        """Filter bills by fetching and checking their subjects.

        Args:
            bills: List of bill data dictionaries.
            relevant_policy_areas: List of relevant policy area names.
            relevant_subjects: List of relevant subject term names.

        Returns:
            Filtered list of bills that match policy areas or subjects.
        """
        policy_areas_lower = [pa.lower() for pa in relevant_policy_areas]
        subjects_lower = [s.lower() for s in relevant_subjects]

        matching = []
        for bill in bills:
            congress = bill.get("congress", 119)
            bill_type = bill.get("type", "").lower()
            bill_number = bill.get("number", 0)

            # Fetch subjects for this bill
            subjects_data = self.get_bill_subjects(congress, bill_type, bill_number)

            # Check policy area
            policy_area = subjects_data.get("policyArea", {})
            if policy_area:
                pa_name = policy_area.get("name", "").lower()
                if any(rpa in pa_name for rpa in policy_areas_lower):
                    matching.append(bill)
                    continue

            # Check legislative subjects
            leg_subjects = subjects_data.get("legislativeSubjects", [])
            for subj in leg_subjects:
                subj_name = subj.get("name", "").lower()
                if any(rs in subj_name for rs in subjects_lower):
                    matching.append(bill)
                    break

        return matching

    def build_bill_info(
        self,
        bill_data: dict[str, Any],
        priority_keywords: dict[str, list[str]] | None = None,
    ) -> BillInfo:
        """Build a BillInfo object from raw API data.

        Args:
            bill_data: Raw bill data from the API.
            priority_keywords: Dict with 'critical' and 'high' keyword lists.

        Returns:
            Structured BillInfo object.
        """
        # Extract basic info
        congress = bill_data.get("congress", 119)
        bill_type = bill_data.get("type", "").lower()
        bill_number = bill_data.get("number", 0)
        bill_id = f"{congress}-{bill_type}-{bill_number}"

        title = bill_data.get("title", "Untitled")

        # Extract latest action
        latest_action = None
        latest_action_date = None
        if "latestAction" in bill_data:
            action = bill_data["latestAction"]
            latest_action = action.get("text")
            latest_action_date = action.get("actionDate")

        # Extract sponsor info
        sponsor = None
        sponsor_party = None
        sponsor_state = None
        if "sponsors" in bill_data and bill_data["sponsors"]:
            first_sponsor = bill_data["sponsors"][0]
            sponsor = first_sponsor.get("fullName") or first_sponsor.get("name")
            sponsor_party = first_sponsor.get("party")
            sponsor_state = first_sponsor.get("state")

        # Extract committees
        committees = []
        if "committees" in bill_data:
            if isinstance(bill_data["committees"], list):
                committees = [
                    c.get("name", "") for c in bill_data["committees"] if c.get("name")
                ]
            elif isinstance(bill_data["committees"], dict):
                # Sometimes returned as a dict with 'count' and 'url'
                pass  # Will need separate API call

        # Extract policy area
        policy_area = None
        if "policyArea" in bill_data:
            policy_area = bill_data["policyArea"].get("name")

        # Build URL
        type_map = {
            "hr": "house-bill",
            "s": "senate-bill",
            "hjres": "house-joint-resolution",
            "sjres": "senate-joint-resolution",
            "hconres": "house-concurrent-resolution",
            "sconres": "senate-concurrent-resolution",
            "hres": "house-resolution",
            "sres": "senate-resolution",
        }
        url_type = type_map.get(bill_type, bill_type)
        url = f"https://congress.gov/bill/{congress}th-congress/{url_type}/{bill_number}"

        # Determine priority based on keywords
        priority = self._determine_priority(title, priority_keywords)

        introduced_date = bill_data.get("introducedDate", "")

        return BillInfo(
            bill_id=bill_id,
            bill_type=bill_type,
            bill_number=bill_number,
            congress=congress,
            title=title,
            introduced_date=introduced_date,
            latest_action=latest_action,
            latest_action_date=latest_action_date,
            sponsor=sponsor,
            sponsor_party=sponsor_party,
            sponsor_state=sponsor_state,
            committees=committees,
            policy_area=policy_area,
            url=url,
            priority=priority,
        )

    def _determine_priority(
        self,
        title: str,
        priority_keywords: dict[str, list[str]] | None,
    ) -> str:
        """Determine bill priority based on keywords in title.

        Args:
            title: Bill title.
            priority_keywords: Dict with 'critical' and 'high' keyword lists.

        Returns:
            Priority level: "critical", "high", or "normal".
        """
        if not priority_keywords:
            return "normal"

        title_lower = title.lower()

        # Check critical keywords first
        for keyword in priority_keywords.get("critical", []):
            if keyword.lower() in title_lower:
                return "critical"

        # Check high priority keywords
        for keyword in priority_keywords.get("high", []):
            if keyword.lower() in title_lower:
                return "high"

        return "normal"

    def search_and_build_bills(
        self,
        query: str,
        congress: int | None = None,
        limit: int = 50,
        priority_keywords: dict[str, list[str]] | None = None,
    ) -> list[BillInfo]:
        """Search for bills and return structured BillInfo objects.

        Args:
            query: Search query string.
            congress: Congress number (optional).
            limit: Maximum number of results.
            priority_keywords: Dict with 'critical' and 'high' keyword lists.

        Returns:
            List of BillInfo objects.
        """
        bills_data = self.search_bills(query, congress=congress, limit=limit)
        return [
            self.build_bill_info(bill, priority_keywords) for bill in bills_data
        ]


def run_all_searches(
    client: CongressApiClient,
    config: dict[str, Any],
) -> dict[str, list[BillInfo]]:
    """Run all configured bill searches (legacy text-search approach).

    Args:
        client: Congress API client instance.
        config: Configuration dictionary with congress settings.

    Returns:
        Dictionary mapping search names to lists of BillInfo objects.
    """
    congress_config = config.get("congress", {})
    searches = congress_config.get("searches", [])
    current_congress = congress_config.get("current_congress", 119)
    priority_keywords = congress_config.get("priority_keywords", {})

    results: dict[str, list[BillInfo]] = {}

    for search in searches:
        name = search.get("name", "Unknown")
        query = search.get("query", "")

        if not query:
            logger.warning(f"Skipping search '{name}' with empty query")
            continue

        logger.info(f"Running search: {name} (query: '{query}')")

        try:
            bills = client.search_and_build_bills(
                query=query,
                congress=current_congress,
                priority_keywords=priority_keywords,
            )
            results[name] = bills
            logger.info(f"Found {len(bills)} bills for search '{name}'")
        except requests.RequestException as e:
            logger.error(f"Error running search '{name}': {e}")
            results[name] = []

    return results


def find_relevant_bills(
    client: CongressApiClient,
    config: dict[str, Any],
) -> list[BillInfo]:
    """Find NAFSMA-relevant bills using subject-based filtering.

    This is the recommended approach - more reliable than text search.

    Strategy:
    1. Fetch recent bills from Congress (reliable endpoint)
    2. First-pass filter by title keywords
    3. Second-pass filter by CRS-assigned subjects
    4. Apply priority scoring

    Args:
        client: Congress API client instance.
        config: Configuration dictionary with congress settings.

    Returns:
        List of relevant BillInfo objects.
    """
    congress_config = config.get("congress", {})
    current_congress = congress_config.get("current_congress", 119)
    priority_keywords = congress_config.get("priority_keywords", {})
    title_keywords = congress_config.get("title_keywords", [])
    relevant_policy_areas = congress_config.get("relevant_policy_areas", [])
    relevant_subjects = congress_config.get("relevant_subjects", [])

    logger.info(f"Fetching recent bills from Congress {current_congress}...")

    # Step 1: Fetch recent bills (reliable endpoint)
    all_bills = client.get_recent_bills(current_congress, limit=250)
    logger.info(f"Fetched {len(all_bills)} recent bills")

    # Step 2: First-pass filter by title keywords
    if title_keywords:
        candidates = client.filter_bills_by_title_keywords(all_bills, title_keywords)
        logger.info(f"First-pass filter: {len(candidates)} bills match title keywords")
    else:
        candidates = all_bills

    # Step 3: Second-pass filter by subjects (fetch subjects for each candidate)
    if relevant_policy_areas or relevant_subjects:
        logger.info("Fetching subjects for candidate bills...")
        filtered = client.filter_bills_by_subjects(
            candidates,
            relevant_policy_areas,
            relevant_subjects,
        )
        logger.info(f"Second-pass filter: {len(filtered)} bills match relevant subjects")
    else:
        filtered = candidates

    # Step 4: Build BillInfo objects with priority scoring
    bills = [
        client.build_bill_info(bill, priority_keywords)
        for bill in filtered
    ]

    # Sort by priority (critical first, then high, then normal)
    priority_order = {"critical": 0, "high": 1, "normal": 2}
    bills.sort(key=lambda b: priority_order.get(b.priority, 3))

    logger.info(f"Found {len(bills)} relevant bills for NAFSMA")
    return bills
