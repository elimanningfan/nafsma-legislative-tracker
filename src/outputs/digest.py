"""Digest generator for NAFSMA Legislative Tracker."""

from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader

from src.sources.congress import BillInfo
from src.utils.config import get_project_root
from src.utils.state import BillUpdate

logger = logging.getLogger(__name__)


class DigestGenerator:
    """Generates markdown digests from legislative updates."""

    def __init__(self, template_dir: str | Path | None = None):
        """Initialize the digest generator.

        Args:
            template_dir: Path to templates directory. Defaults to templates/.
        """
        if template_dir is None:
            template_dir = get_project_root() / "templates"
        else:
            template_dir = Path(template_dir)

        self.env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=False,  # We're generating markdown, not HTML
            trim_blocks=True,
            lstrip_blocks=True,
        )

    def generate_daily_digest(
        self,
        bill_updates: list[BillUpdate],
        federal_register_docs: list[Any] | None = None,
        comment_alerts: list[Any] | None = None,
        committee_items: list[Any] | None = None,
        disaster_declarations: list[Any] | None = None,
        date: datetime | None = None,
    ) -> str:
        """Generate a daily digest from bill updates, Federal Register, and committee items.

        Args:
            bill_updates: List of BillUpdate objects.
            federal_register_docs: List of new FederalRegisterDocument objects.
            comment_alerts: List of FederalRegisterDocument objects with closing comment periods.
            committee_items: List of CommitteeItem objects from RSS feeds.
            disaster_declarations: List of DisasterDeclaration objects from OpenFEMA.
            date: Date for the digest. Defaults to today.

        Returns:
            Rendered markdown string.
        """
        if date is None:
            date = datetime.now()

        federal_register_docs = federal_register_docs or []
        comment_alerts = comment_alerts or []
        committee_items = committee_items or []
        disaster_declarations = disaster_declarations or []

        # Separate updates by type and priority
        new_bills_critical = []
        new_bills_high = []
        new_bills_normal = []
        status_changes = []

        for update in bill_updates:
            if update.update_type == "new":
                if update.bill.priority == "critical":
                    new_bills_critical.append(update)
                elif update.bill.priority == "high":
                    new_bills_high.append(update)
                else:
                    new_bills_normal.append(update)
            elif update.update_type == "status_change":
                status_changes.append(update)

        total_new_bills = len(new_bills_critical) + len(new_bills_high) + len(new_bills_normal)
        has_updates = (
            len(bill_updates) > 0
            or len(federal_register_docs) > 0
            or len(comment_alerts) > 0
            or len(committee_items) > 0
            or len(disaster_declarations) > 0
        )

        template = self.env.get_template("daily_digest.md.j2")
        return template.render(
            date=date.strftime("%B %d, %Y"),
            new_bills_critical=new_bills_critical,
            new_bills_high=new_bills_high,
            new_bills_normal=new_bills_normal,
            status_changes=status_changes,
            new_federal_register=federal_register_docs,
            comment_alerts=comment_alerts,
            committee_items=committee_items,
            disaster_declarations=disaster_declarations,
            total_new_bills=total_new_bills,
            total_status_changes=len(status_changes),
            total_federal_register=len(federal_register_docs),
            total_comment_alerts=len(comment_alerts),
            total_committee_items=len(committee_items),
            total_disaster_declarations=len(disaster_declarations),
            has_updates=has_updates,
        )

    def save_digest(
        self,
        content: str,
        output_dir: str | Path | None = None,
        filename: str | None = None,
    ) -> Path:
        """Save a digest to the outputs directory.

        Args:
            content: Digest markdown content.
            output_dir: Output directory. Defaults to outputs/digests/.
            filename: Output filename. Defaults to digest-YYYY-MM-DD.md.

        Returns:
            Path to the saved file.
        """
        if output_dir is None:
            output_dir = get_project_root() / "outputs" / "digests"
        else:
            output_dir = Path(output_dir)

        output_dir.mkdir(parents=True, exist_ok=True)

        if filename is None:
            filename = f"digest-{datetime.now().strftime('%Y-%m-%d')}.md"

        output_path = output_dir / filename

        with open(output_path, "w") as f:
            f.write(content)

        logger.info(f"Saved digest to {output_path}")
        return output_path


def create_digest_context(
    bill_updates: list[BillUpdate],
    federal_register_updates: list[dict[str, Any]] | None = None,
    comment_period_alerts: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Create a context dictionary for digest generation.

    This is useful for more complex digests that include multiple sources.

    Args:
        bill_updates: List of BillUpdate objects.
        federal_register_updates: List of Federal Register updates (for Session 2).
        comment_period_alerts: List of comment period alerts (for Session 2).

    Returns:
        Context dictionary for template rendering.
    """
    # Organize bill updates
    new_bills = [u for u in bill_updates if u.update_type == "new"]
    status_changes = [u for u in bill_updates if u.update_type == "status_change"]

    # Further categorize by priority
    critical_new = [u for u in new_bills if u.bill.priority == "critical"]
    high_new = [u for u in new_bills if u.bill.priority == "high"]
    normal_new = [u for u in new_bills if u.bill.priority == "normal"]

    return {
        "date": datetime.now().strftime("%B %d, %Y"),
        "new_bills": {
            "critical": critical_new,
            "high": high_new,
            "normal": normal_new,
            "total": len(new_bills),
        },
        "status_changes": status_changes,
        "federal_register": federal_register_updates or [],
        "comment_alerts": comment_period_alerts or [],
        "summary": {
            "new_bills": len(new_bills),
            "status_changes": len(status_changes),
            "federal_register": len(federal_register_updates or []),
            "comment_alerts": len(comment_period_alerts or []),
        },
    }
