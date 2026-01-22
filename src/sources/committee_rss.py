"""Committee RSS feed client for NAFSMA Legislative Tracker."""

from __future__ import annotations

import hashlib
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Any

import feedparser

logger = logging.getLogger(__name__)


@dataclass
class CommitteeItem:
    """A committee RSS feed item (hearing, press release, etc.)."""

    item_id: str
    title: str
    link: str
    published_date: str
    source_name: str
    description: str | None
    priority: str  # "critical", "high", "normal"

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "item_id": self.item_id,
            "title": self.title,
            "link": self.link,
            "published_date": self.published_date,
            "source_name": self.source_name,
            "description": self.description,
            "priority": self.priority,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "CommitteeItem":
        """Create from dictionary."""
        return cls(
            item_id=data["item_id"],
            title=data["title"],
            link=data["link"],
            published_date=data["published_date"],
            source_name=data["source_name"],
            description=data.get("description"),
            priority=data.get("priority", "normal"),
        )


class CommitteeRSSClient:
    """Client for fetching and parsing committee RSS feeds."""

    def __init__(self, timeout: int = 30):
        """Initialize the RSS client.

        Args:
            timeout: Request timeout in seconds.
        """
        self.timeout = timeout

    def fetch_feed(
        self,
        url: str,
        source_name: str,
        keywords: list[str] | None = None,
        priority_keywords: dict[str, list[str]] | None = None,
    ) -> list[CommitteeItem]:
        """Fetch and parse an RSS feed.

        Args:
            url: RSS feed URL.
            source_name: Name of the committee (e.g., "House T&I").
            keywords: Optional list of keywords to filter by.
            priority_keywords: Optional dict with "critical" and "high" keyword lists.

        Returns:
            List of CommitteeItem objects.
        """
        logger.info(f"Fetching RSS feed from {source_name}...")

        try:
            feed = feedparser.parse(url)

            if feed.bozo and feed.bozo_exception:
                logger.warning(f"RSS parse warning for {source_name}: {feed.bozo_exception}")

            items = []
            for entry in feed.entries:
                item = self._parse_entry(entry, source_name, priority_keywords)
                if item:
                    # Apply keyword filter if specified
                    if keywords:
                        if not self._matches_keywords(item, keywords):
                            continue
                    items.append(item)

            logger.info(f"Found {len(items)} items from {source_name}")
            return items

        except Exception as e:
            logger.error(f"Error fetching RSS feed from {source_name}: {e}")
            return []

    def _parse_entry(
        self,
        entry: Any,
        source_name: str,
        priority_keywords: dict[str, list[str]] | None = None,
    ) -> CommitteeItem | None:
        """Parse a single RSS entry into a CommitteeItem.

        Args:
            entry: feedparser entry object.
            source_name: Name of the source committee.
            priority_keywords: Optional dict with priority keyword lists.

        Returns:
            CommitteeItem or None if parsing fails.
        """
        try:
            # Get unique ID (prefer guid, fallback to link hash)
            item_id = getattr(entry, "id", None) or getattr(entry, "guid", None)
            if not item_id:
                # Create hash from title + link as fallback
                content = f"{entry.get('title', '')}{entry.get('link', '')}"
                item_id = hashlib.md5(content.encode()).hexdigest()

            # Parse published date
            published_date = ""
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                try:
                    dt = datetime(*entry.published_parsed[:6])
                    published_date = dt.strftime("%Y-%m-%d")
                except (TypeError, ValueError):
                    published_date = entry.get("published", "")
            elif hasattr(entry, "published"):
                published_date = entry.published

            # Get description/summary
            description = None
            if hasattr(entry, "summary"):
                description = entry.summary
            elif hasattr(entry, "description"):
                description = entry.description

            # Determine priority based on keywords
            title = entry.get("title", "")
            priority = self._determine_priority(title, description, priority_keywords)

            return CommitteeItem(
                item_id=item_id,
                title=title,
                link=entry.get("link", ""),
                published_date=published_date,
                source_name=source_name,
                description=description,
                priority=priority,
            )

        except Exception as e:
            logger.warning(f"Error parsing RSS entry: {e}")
            return None

    def _determine_priority(
        self,
        title: str,
        description: str | None,
        priority_keywords: dict[str, list[str]] | None,
    ) -> str:
        """Determine item priority based on keyword matches.

        Args:
            title: Item title.
            description: Item description.
            priority_keywords: Dict with "critical" and "high" keyword lists.

        Returns:
            Priority level: "critical", "high", or "normal".
        """
        if not priority_keywords:
            return "normal"

        text = f"{title} {description or ''}".lower()

        # Check critical keywords first
        for keyword in priority_keywords.get("critical", []):
            if keyword.lower() in text:
                return "critical"

        # Check high priority keywords
        for keyword in priority_keywords.get("high", []):
            if keyword.lower() in text:
                return "high"

        return "normal"

    def _matches_keywords(self, item: CommitteeItem, keywords: list[str]) -> bool:
        """Check if item matches any of the keywords.

        Args:
            item: CommitteeItem to check.
            keywords: List of keywords to match.

        Returns:
            True if item matches at least one keyword.
        """
        text = f"{item.title} {item.description or ''}".lower()
        return any(keyword.lower() in text for keyword in keywords)


def fetch_committee_items(
    client: CommitteeRSSClient,
    config: dict[str, Any],
) -> list[CommitteeItem]:
    """Fetch items from all configured committee RSS feeds.

    Args:
        client: CommitteeRSSClient instance.
        config: Configuration dict with committees settings.

    Returns:
        List of CommitteeItem objects from all feeds.
    """
    committees_config = config.get("committees", {})
    rss_feeds = committees_config.get("rss_feeds", [])

    if not rss_feeds:
        logger.warning("No committee RSS feeds configured")
        return []

    # Get priority keywords from congress config for priority scoring
    congress_config = config.get("congress", {})
    priority_keywords = congress_config.get("priority_keywords", {})

    all_items: list[CommitteeItem] = []

    for feed_config in rss_feeds:
        name = feed_config.get("name", "Unknown Committee")
        url = feed_config.get("url")
        keywords = feed_config.get("keywords", [])

        if not url:
            logger.warning(f"No URL for committee feed: {name}")
            continue

        items = client.fetch_feed(
            url=url,
            source_name=name,
            keywords=keywords if keywords else None,
            priority_keywords=priority_keywords,
        )
        all_items.extend(items)

    # Sort by date (newest first)
    all_items.sort(key=lambda x: x.published_date, reverse=True)

    logger.info(f"Total committee items fetched: {len(all_items)}")
    return all_items
