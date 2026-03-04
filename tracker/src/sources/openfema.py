"""OpenFEMA API client for NAFSMA Legislative Tracker."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

import requests

logger = logging.getLogger(__name__)


@dataclass
class DisasterDeclaration:
    """A FEMA disaster declaration."""

    disaster_number: int
    declaration_title: str
    state: str
    incident_type: str
    declaration_date: str
    designated_area: str
    incident_begin_date: str
    incident_end_date: str | None
    url: str

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "disaster_number": self.disaster_number,
            "declaration_title": self.declaration_title,
            "state": self.state,
            "incident_type": self.incident_type,
            "declaration_date": self.declaration_date,
            "designated_area": self.designated_area,
            "incident_begin_date": self.incident_begin_date,
            "incident_end_date": self.incident_end_date,
            "url": self.url,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "DisasterDeclaration":
        """Create from dictionary."""
        return cls(
            disaster_number=data["disaster_number"],
            declaration_title=data["declaration_title"],
            state=data["state"],
            incident_type=data["incident_type"],
            declaration_date=data["declaration_date"],
            designated_area=data["designated_area"],
            incident_begin_date=data["incident_begin_date"],
            incident_end_date=data.get("incident_end_date"),
            url=data["url"],
        )


# Incident types relevant to NAFSMA
RELEVANT_INCIDENT_TYPES = {
    "Flood",
    "Severe Storm",
    "Hurricane",
    "Coastal Storm",
    "Severe Storm(s)",
    "Typhoon",
    "Dam/Levee Break",
    "Tornado",
    "Mud/Landslide",
}


class OpenFEMAClient:
    """Client for OpenFEMA API - no API key required."""

    BASE_URL = "https://www.fema.gov/api/open/v2"

    def __init__(self, timeout: int = 30):
        """Initialize the OpenFEMA client.

        Args:
            timeout: Request timeout in seconds.
        """
        self.timeout = timeout
        self.session = requests.Session()

    def _make_request(
        self,
        endpoint: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Make a request to the OpenFEMA API.

        Args:
            endpoint: API endpoint path.
            params: Query parameters.

        Returns:
            JSON response data.

        Raises:
            requests.RequestException: If the request fails.
        """
        url = f"{self.BASE_URL}/{endpoint}"

        response = self.session.get(url, params=params, timeout=self.timeout)
        response.raise_for_status()

        return response.json()

    def get_recent_disasters(
        self,
        days_back: int = 30,
        limit: int = 100,
    ) -> list[DisasterDeclaration]:
        """Get recent disaster declarations.

        Args:
            days_back: Number of days to look back.
            limit: Maximum number of records to return.

        Returns:
            List of DisasterDeclaration objects.
        """
        cutoff_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")

        params = {
            "$filter": f"declarationDate ge '{cutoff_date}'",
            "$orderby": "declarationDate desc",
            "$top": limit,
        }

        logger.info(f"Fetching FEMA disasters from last {days_back} days...")

        try:
            data = self._make_request("DisasterDeclarationsSummaries", params)
            records = data.get("DisasterDeclarationsSummaries", [])

            declarations = []
            seen_keys = set()

            for record in records:
                declaration = self._build_declaration(record)
                if declaration:
                    # Deduplicate by disaster_number + state + designated_area
                    key = f"{declaration.disaster_number}-{declaration.state}-{declaration.designated_area}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        declarations.append(declaration)

            logger.info(f"Found {len(declarations)} unique disaster declarations")
            return declarations

        except requests.RequestException as e:
            logger.error(f"Error fetching FEMA disasters: {e}")
            return []

    def get_flood_related_disasters(
        self,
        days_back: int = 30,
        limit: int = 100,
    ) -> list[DisasterDeclaration]:
        """Get flood-related disaster declarations.

        Filters for incident types relevant to NAFSMA:
        Flood, Severe Storm, Hurricane, Coastal Storm, etc.

        Args:
            days_back: Number of days to look back.
            limit: Maximum number of records to return.

        Returns:
            List of DisasterDeclaration objects filtered by incident type.
        """
        all_disasters = self.get_recent_disasters(days_back=days_back, limit=limit)

        flood_related = [
            d for d in all_disasters
            if d.incident_type in RELEVANT_INCIDENT_TYPES
        ]

        logger.info(f"Filtered to {len(flood_related)} flood-related disasters")
        return flood_related

    def _build_declaration(self, record: dict[str, Any]) -> DisasterDeclaration | None:
        """Build a DisasterDeclaration from API response data.

        Args:
            record: Single record from API response.

        Returns:
            DisasterDeclaration object or None if parsing fails.
        """
        try:
            disaster_number = record.get("disasterNumber")
            if not disaster_number:
                return None

            # Parse dates
            declaration_date = record.get("declarationDate", "")[:10]
            incident_begin = record.get("incidentBeginDate", "")[:10] if record.get("incidentBeginDate") else ""
            incident_end = record.get("incidentEndDate", "")[:10] if record.get("incidentEndDate") else None

            # Build FEMA disaster URL
            url = f"https://www.fema.gov/disaster/{disaster_number}"

            return DisasterDeclaration(
                disaster_number=disaster_number,
                declaration_title=record.get("declarationTitle", "Unknown"),
                state=record.get("state", ""),
                incident_type=record.get("incidentType", "Unknown"),
                declaration_date=declaration_date,
                designated_area=record.get("designatedArea", "Statewide"),
                incident_begin_date=incident_begin,
                incident_end_date=incident_end,
                url=url,
            )

        except Exception as e:
            logger.warning(f"Error parsing disaster record: {e}")
            return None


def fetch_flood_disasters(
    client: OpenFEMAClient,
    days_back: int = 7,
) -> list[DisasterDeclaration]:
    """Fetch flood-related disasters from OpenFEMA.

    Args:
        client: OpenFEMAClient instance.
        days_back: Number of days to look back.

    Returns:
        List of flood-related DisasterDeclaration objects.
    """
    return client.get_flood_related_disasters(days_back=days_back)
