"""NAFSMA Priority Bill Watchlist client."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import yaml

from src.sources.congress import CongressApiClient
from src.utils.config import get_project_root

logger = logging.getLogger(__name__)


@dataclass
class WatchlistBill:
    """A bill from the NAFSMA priority watchlist."""

    bill_id: str  # e.g., "119-hr-2093"
    bill_type: str  # e.g., "hr"
    bill_number: int
    congress: int
    title: str
    category: str  # high_priority, funding_appropriations, other_notable
    nafsma_notes: str
    # Fetched from API:
    official_title: str | None = None
    latest_action: str | None = None
    latest_action_date: str | None = None
    sponsors: list[str] = field(default_factory=list)
    committees: list[str] = field(default_factory=list)
    url: str = ""

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "bill_id": self.bill_id,
            "bill_type": self.bill_type,
            "bill_number": self.bill_number,
            "congress": self.congress,
            "title": self.title,
            "category": self.category,
            "nafsma_notes": self.nafsma_notes,
            "official_title": self.official_title,
            "latest_action": self.latest_action,
            "latest_action_date": self.latest_action_date,
            "sponsors": self.sponsors,
            "committees": self.committees,
            "url": self.url,
        }


@dataclass
class RegulatoryItem:
    """A regulatory comment/rule item from the watchlist."""

    name: str
    url: str
    federal_register_date: str
    nafsma_status: str
    notes: str
    comment_deadline: str | None = None
    effective_date: str | None = None
    days_until: int | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "name": self.name,
            "url": self.url,
            "federal_register_date": self.federal_register_date,
            "nafsma_status": self.nafsma_status,
            "notes": self.notes,
            "comment_deadline": self.comment_deadline,
            "effective_date": self.effective_date,
            "days_until": self.days_until,
        }


class WatchlistClient:
    """Client for loading and fetching NAFSMA priority watchlist bills."""

    def __init__(
        self,
        watchlist_path: str | Path | None = None,
        congress_client: CongressApiClient | None = None,
    ):
        """Initialize the watchlist client.

        Args:
            watchlist_path: Path to watchlist.yaml. Defaults to data/watchlist.yaml.
            congress_client: Congress API client for fetching bill status.
        """
        if watchlist_path is None:
            self.watchlist_path = get_project_root() / "data" / "watchlist.yaml"
        else:
            self.watchlist_path = Path(watchlist_path)

        self.congress_client = congress_client or CongressApiClient()
        self._watchlist_data: dict[str, Any] | None = None

    def _load_watchlist(self) -> dict[str, Any]:
        """Load watchlist from YAML file."""
        if self._watchlist_data is not None:
            return self._watchlist_data

        if not self.watchlist_path.exists():
            logger.warning(f"Watchlist file not found: {self.watchlist_path}")
            return {}

        with open(self.watchlist_path) as f:
            self._watchlist_data = yaml.safe_load(f) or {}

        return self._watchlist_data

    def _parse_bill_id(self, bill_id: str) -> tuple[int, str, int]:
        """Parse bill_id into (congress, bill_type, bill_number).

        Args:
            bill_id: Bill ID in format "119-hr-2093" or "119-s-1760".

        Returns:
            Tuple of (congress, bill_type, bill_number).
        """
        match = re.match(r"(\d+)-([a-z]+)-(\d+)", bill_id.lower())
        if not match:
            raise ValueError(f"Invalid bill_id format: {bill_id}")

        return int(match.group(1)), match.group(2), int(match.group(3))

    def _build_bill_url(self, congress: int, bill_type: str, bill_number: int) -> str:
        """Build Congress.gov URL for a bill."""
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
        return f"https://www.congress.gov/bill/{congress}th-congress/{url_type}/{bill_number}"

    def get_watchlist_bills(self) -> list[WatchlistBill]:
        """Load all bills from the watchlist (without fetching API status).

        Returns:
            List of WatchlistBill objects.
        """
        data = self._load_watchlist()
        bills = []

        categories = [
            ("high_priority", "high_priority"),
            ("funding_appropriations", "funding"),
            ("other_notable", "notable"),
        ]

        for yaml_key, category in categories:
            for item in data.get(yaml_key, []):
                bill_id = item.get("bill_id", "")
                try:
                    congress, bill_type, bill_number = self._parse_bill_id(bill_id)
                    url = self._build_bill_url(congress, bill_type, bill_number)

                    bills.append(WatchlistBill(
                        bill_id=bill_id,
                        bill_type=bill_type,
                        bill_number=bill_number,
                        congress=congress,
                        title=item.get("title", ""),
                        category=category,
                        nafsma_notes=item.get("nafsma_notes", ""),
                        url=url,
                    ))
                except ValueError as e:
                    logger.warning(f"Skipping invalid bill: {e}")

        return bills

    def fetch_bill_status(self, bill: WatchlistBill) -> WatchlistBill:
        """Fetch current status for a watchlist bill from Congress.gov API.

        Args:
            bill: WatchlistBill to update.

        Returns:
            Updated WatchlistBill with API data.
        """
        try:
            details = self.congress_client.get_bill_details(
                bill.congress,
                bill.bill_type,
                bill.bill_number,
            )

            if details:
                bill.official_title = details.get("title")

                # Latest action
                if "latestAction" in details:
                    action = details["latestAction"]
                    bill.latest_action = action.get("text")
                    bill.latest_action_date = action.get("actionDate")

                # Sponsors
                sponsors = details.get("sponsors", [])
                bill.sponsors = [
                    s.get("fullName") or s.get("name", "")
                    for s in sponsors
                    if s.get("fullName") or s.get("name")
                ]

                # Committees (may need separate API call)
                committees = details.get("committees", {})
                if isinstance(committees, list):
                    bill.committees = [c.get("name", "") for c in committees if c.get("name")]

        except Exception as e:
            logger.warning(f"Failed to fetch status for {bill.bill_id}: {e}")

        return bill

    def get_all_watchlist_bills_with_status(self) -> list[WatchlistBill]:
        """Load all watchlist bills and fetch their current status.

        Returns:
            List of WatchlistBill objects with API data.
        """
        bills = self.get_watchlist_bills()
        logger.info(f"Fetching status for {len(bills)} watchlist bills...")

        for bill in bills:
            self.fetch_bill_status(bill)

        return bills

    def get_regulatory_items(self) -> list[RegulatoryItem]:
        """Load regulatory comment items from the watchlist.

        Returns:
            List of RegulatoryItem objects with days_until calculated.
        """
        data = self._load_watchlist()
        items = []
        today = datetime.now().date()

        for item in data.get("regulatory_comments", []):
            # Calculate days until deadline
            days_until = None
            deadline = item.get("comment_deadline")
            effective = item.get("effective_date")

            target_date = deadline or effective
            if target_date:
                try:
                    target = datetime.strptime(target_date, "%Y-%m-%d").date()
                    days_until = (target - today).days
                except ValueError:
                    pass

            items.append(RegulatoryItem(
                name=item.get("name", ""),
                url=item.get("url", ""),
                federal_register_date=item.get("federal_register_date", ""),
                nafsma_status=item.get("nafsma_status", ""),
                notes=item.get("notes", ""),
                comment_deadline=deadline,
                effective_date=effective,
                days_until=days_until,
            ))

        # Sort by days_until (closest deadline first), with None at the end
        items.sort(key=lambda x: (x.days_until is None, x.days_until or 999))

        return items


def fetch_watchlist_bills(
    client: WatchlistClient,
    config: dict[str, Any] | None = None,
) -> list[WatchlistBill]:
    """Fetch all watchlist bills with current status.

    Args:
        client: WatchlistClient instance.
        config: Configuration dictionary (unused, for consistency).

    Returns:
        List of WatchlistBill objects.
    """
    return client.get_all_watchlist_bills_with_status()


def get_regulatory_items(
    client: WatchlistClient,
) -> list[RegulatoryItem]:
    """Get regulatory items with deadline calculations.

    Args:
        client: WatchlistClient instance.

    Returns:
        List of RegulatoryItem objects.
    """
    return client.get_regulatory_items()
