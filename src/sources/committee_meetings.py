"""Congress.gov Committee Meeting API client for NAFSMA Legislative Tracker."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any

import requests

from src.utils.config import get_congress_api_key

logger = logging.getLogger(__name__)

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY = 2


@dataclass
class CommitteeMeeting:
    """Structured committee meeting information."""

    event_id: str
    committee_code: str
    committee_name: str
    meeting_type: str  # Hearing, Markup, Meeting
    title: str
    date: str
    time: str | None
    location: str | None
    url: str
    witnesses: list[str] = field(default_factory=list)
    related_bills: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "event_id": self.event_id,
            "committee_code": self.committee_code,
            "committee_name": self.committee_name,
            "meeting_type": self.meeting_type,
            "title": self.title,
            "date": self.date,
            "time": self.time,
            "location": self.location,
            "url": self.url,
            "witnesses": self.witnesses,
            "related_bills": self.related_bills,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "CommitteeMeeting":
        """Create from dictionary."""
        return cls(
            event_id=data["event_id"],
            committee_code=data["committee_code"],
            committee_name=data["committee_name"],
            meeting_type=data["meeting_type"],
            title=data["title"],
            date=data["date"],
            time=data.get("time"),
            location=data.get("location"),
            url=data["url"],
            witnesses=data.get("witnesses", []),
            related_bills=data.get("related_bills", []),
        )


class CommitteeMeetingClient:
    """Client for Congress.gov Committee Meeting API."""

    # Key committees for NAFSMA tracking (using Congress.gov system codes)
    # Codes are lowercase with numeric suffix (00 = full committee)
    TRACKED_COMMITTEES = {
        # House committees
        "hspw00": "House Transportation & Infrastructure",
        "hspw02": "House T&I - Water Resources",
        "hspw13": "House T&I - Emergency Management",
        "hsap00": "House Appropriations",
        "hsap10": "House Appropriations - Energy & Water",
        # Senate committees
        "ssev00": "Senate Environment & Public Works",
        "ssev15": "Senate EPW - Fisheries, Wildlife, and Water",
        "ssap00": "Senate Appropriations",
        "ssap22": "Senate Appropriations - Energy & Water",
        "ssbk00": "Senate Banking, Housing, and Urban Affairs",
    }

    def __init__(
        self,
        api_key: str | None = None,
        api_base: str = "https://api.congress.gov/v3",
    ):
        """Initialize the Committee Meeting API client.

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
    ) -> dict[str, Any]:
        """Make a request to the Congress.gov API.

        Args:
            endpoint: API endpoint path.
            params: Query parameters.

        Returns:
            JSON response data.
        """
        import time

        url = f"{self.api_base}/{endpoint.lstrip('/')}"
        params = params or {}
        params["format"] = "json"

        for attempt in range(MAX_RETRIES + 1):
            try:
                logger.debug(f"Requesting: {url} (attempt {attempt + 1})")
                response = self.session.get(url, params=params, timeout=30)
                response.raise_for_status()
                return response.json()
            except requests.HTTPError as e:
                if response.status_code == 503 and attempt < MAX_RETRIES:
                    logger.warning(
                        f"API returned 503, retrying in {RETRY_DELAY}s "
                        f"(attempt {attempt + 1}/{MAX_RETRIES + 1})"
                    )
                    time.sleep(RETRY_DELAY)
                else:
                    raise

        return {}  # Should not reach here

    def get_meeting_list(
        self,
        congress: int,
        chamber: str,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        """Fetch list of committee meetings (basic info only).

        Args:
            congress: Congress number (e.g., 119).
            chamber: Chamber ("house" or "senate").
            limit: Maximum number of meetings to fetch.

        Returns:
            List of meeting list items (eventId, url only).
        """
        endpoint = f"committee-meeting/{congress}/{chamber}"
        try:
            data = self._make_request(endpoint, {"limit": limit})
            return data.get("committeeMeetings", [])
        except requests.HTTPError as e:
            logger.error(f"Failed to fetch {chamber} committee meetings: {e}")
            return []

    def get_meeting_details(
        self,
        congress: int,
        chamber: str,
        event_id: str,
    ) -> dict[str, Any] | None:
        """Fetch full details for a single meeting.

        Args:
            congress: Congress number.
            chamber: Chamber ("house" or "senate").
            event_id: Meeting event ID.

        Returns:
            Full meeting data or None if fetch fails.
        """
        endpoint = f"committee-meeting/{congress}/{chamber}/{event_id}"
        try:
            data = self._make_request(endpoint)
            return data.get("committeeMeeting")
        except requests.HTTPError as e:
            logger.debug(f"Failed to fetch meeting {event_id}: {e}")
            return None

    def get_all_tracked_meetings(
        self,
        congress: int = 119,
        days_back: int = 30,
    ) -> list[CommitteeMeeting]:
        """Fetch meetings from all tracked committees.

        Args:
            congress: Congress number.
            days_back: Only include meetings from this many days ago.

        Returns:
            List of CommitteeMeeting objects from tracked committees.
        """
        cutoff_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
        all_meetings = []
        seen_ids = set()

        # Fetch from both chambers
        for chamber in ["house", "senate"]:
            meeting_list = self.get_meeting_list(congress, chamber, limit=100)
            logger.info(f"Fetching details for {len(meeting_list)} {chamber} meetings...")

            for item in meeting_list:
                event_id = item.get("eventId")
                if not event_id or event_id in seen_ids:
                    continue
                seen_ids.add(event_id)

                # Fetch full meeting details
                meeting_data = self.get_meeting_details(congress, chamber, event_id)
                if not meeting_data:
                    continue

                # Check if from a tracked committee
                committees = meeting_data.get("committees", [])
                for comm in committees:
                    comm_code = comm.get("systemCode", "").lower()
                    if comm_code in self.TRACKED_COMMITTEES:
                        # Parse meeting date (format: 2026-01-22T16:15:00Z)
                        meeting_date_str = meeting_data.get("date", "")
                        if meeting_date_str:
                            meeting_date = meeting_date_str[:10]  # Get YYYY-MM-DD part
                            if meeting_date >= cutoff_date:
                                parsed = self._parse_meeting(meeting_data, comm_code)
                                if parsed:
                                    all_meetings.append(parsed)
                        break  # Don't add same meeting twice

        # Sort by date (most recent first)
        all_meetings.sort(key=lambda m: m.date, reverse=True)

        logger.info(f"Found {len(all_meetings)} meetings from tracked committees")
        return all_meetings

    def get_upcoming_meetings(
        self,
        congress: int = 119,
        days_ahead: int = 14,
    ) -> list[CommitteeMeeting]:
        """Fetch upcoming meetings from tracked committees.

        Args:
            congress: Congress number.
            days_ahead: Include meetings up to this many days ahead.

        Returns:
            List of upcoming CommitteeMeeting objects.
        """
        today = datetime.now().strftime("%Y-%m-%d")
        future_date = (datetime.now() + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
        upcoming = []

        for chamber in ["house", "senate"]:
            meetings_data = self.get_committee_meetings(congress, chamber)

            for meeting in meetings_data:
                committees = meeting.get("committees", [])
                for comm in committees:
                    comm_code = comm.get("systemCode", "")[:4].upper()
                    if comm_code in self.TRACKED_COMMITTEES:
                        meeting_date = meeting.get("date", "")
                        if meeting_date and today <= meeting_date <= future_date:
                            parsed = self._parse_meeting(meeting, comm_code)
                            if parsed:
                                upcoming.append(parsed)
                        break

        # Sort by date (soonest first)
        upcoming.sort(key=lambda m: m.date)

        logger.info(f"Found {len(upcoming)} upcoming meetings in next {days_ahead} days")
        return upcoming

    def _parse_meeting(
        self,
        meeting_data: dict[str, Any],
        committee_code: str,
    ) -> CommitteeMeeting | None:
        """Parse raw meeting data into CommitteeMeeting object.

        Args:
            meeting_data: Raw meeting data from API (full details).
            committee_code: Committee system code.

        Returns:
            CommitteeMeeting object or None if parsing fails.
        """
        try:
            # Extract event ID
            event_id = meeting_data.get("eventId", "")

            # Extract meeting type
            meeting_type = meeting_data.get("type", "Meeting")

            # Extract title
            title = meeting_data.get("title", "")
            if not title:
                title = meeting_data.get("name", "Committee Meeting")

            # Extract date and time from ISO format (2026-01-22T16:15:00Z)
            date_str = meeting_data.get("date", "")
            date = date_str[:10] if date_str else ""  # YYYY-MM-DD
            time = None
            if len(date_str) > 11:
                time = date_str[11:16]  # HH:MM

            # Extract location
            location = None
            loc_data = meeting_data.get("location")
            if isinstance(loc_data, dict):
                building = loc_data.get("building", "")
                room = loc_data.get("room", "")
                location = f"{building} {room}".strip() or None

            # Build URL - Congress.gov event pages
            chamber = meeting_data.get("chamber", "").lower()
            congress = meeting_data.get("congress", 119)
            url = f"https://www.congress.gov/event/{congress}th-congress/{chamber}-event/{event_id}"

            # Extract witnesses (if available)
            witnesses = []
            witness_data = meeting_data.get("witnesses", [])
            if witness_data:
                for w in witness_data:
                    name = w.get("name", "")
                    if name:
                        witnesses.append(name)

            # Extract related bills from relatedItems
            related_bills = []
            related_items = meeting_data.get("relatedItems", {})
            bills_data = related_items.get("bills", [])
            if bills_data:
                for b in bills_data:
                    bill_type = b.get("type", "").upper()
                    bill_num = b.get("number", "")
                    if bill_type and bill_num:
                        related_bills.append(f"{bill_type} {bill_num}")

            return CommitteeMeeting(
                event_id=str(event_id),
                committee_code=committee_code,
                committee_name=self.TRACKED_COMMITTEES.get(
                    committee_code, committee_code
                ),
                meeting_type=meeting_type,
                title=title,
                date=date,
                time=time,
                location=location,
                url=url,
                witnesses=witnesses,
                related_bills=related_bills,
            )

        except Exception as e:
            logger.warning(f"Failed to parse meeting: {e}")
            return None


def fetch_committee_meetings(
    client: CommitteeMeetingClient,
    config: dict[str, Any],
) -> list[CommitteeMeeting]:
    """Fetch committee meetings based on configuration.

    Args:
        client: Committee meeting client instance.
        config: Configuration dictionary.

    Returns:
        List of CommitteeMeeting objects.
    """
    congress_config = config.get("congress", {})
    current_congress = congress_config.get("current_congress", 119)

    committees_config = config.get("committees", {})
    days_back = committees_config.get("meetings_days_back", 14)

    # Update tracked committees from config if specified
    tracked = committees_config.get("tracked_committees", [])
    if tracked:
        client.TRACKED_COMMITTEES = {
            c["code"]: c["name"] for c in tracked
        }

    return client.get_all_tracked_meetings(
        congress=current_congress,
        days_back=days_back,
    )
