"""State management for NAFSMA Legislative Tracker."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

from src.sources.congress import BillInfo
from src.utils.config import get_project_root

logger = logging.getLogger(__name__)


@dataclass
class TrackedBill:
    """A bill being tracked with its last known state."""

    bill_id: str
    title: str
    last_action: str | None
    last_action_date: str | None
    first_seen: str  # ISO date string
    last_updated: str  # ISO date string

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "bill_id": self.bill_id,
            "title": self.title,
            "last_action": self.last_action,
            "last_action_date": self.last_action_date,
            "first_seen": self.first_seen,
            "last_updated": self.last_updated,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "TrackedBill":
        """Create from dictionary."""
        return cls(
            bill_id=data["bill_id"],
            title=data["title"],
            last_action=data.get("last_action"),
            last_action_date=data.get("last_action_date"),
            first_seen=data["first_seen"],
            last_updated=data["last_updated"],
        )


@dataclass
class StateData:
    """Complete state data for the tracker."""

    last_run: str | None = None
    bills: dict[str, TrackedBill] = field(default_factory=dict)
    federal_register_documents: dict[str, dict[str, Any]] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "last_run": self.last_run,
            "bills": {k: v.to_dict() for k, v in self.bills.items()},
            "federal_register_documents": self.federal_register_documents,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "StateData":
        """Create from dictionary."""
        bills = {}
        for bill_id, bill_data in data.get("bills", {}).items():
            bills[bill_id] = TrackedBill.from_dict(bill_data)

        return cls(
            last_run=data.get("last_run"),
            bills=bills,
            federal_register_documents=data.get("federal_register_documents", {}),
        )


class StateManager:
    """Manages persistent state for the legislative tracker."""

    def __init__(self, state_path: str | Path | None = None):
        """Initialize the state manager.

        Args:
            state_path: Path to state JSON file. Defaults to data/state.json.
        """
        if state_path is None:
            self.state_path = get_project_root() / "data" / "state.json"
        else:
            self.state_path = Path(state_path)

        self._state: StateData | None = None

    def load(self) -> StateData:
        """Load state from disk.

        Returns:
            StateData object (creates empty state if file doesn't exist).
        """
        if self._state is not None:
            return self._state

        if self.state_path.exists():
            try:
                with open(self.state_path) as f:
                    data = json.load(f)
                self._state = StateData.from_dict(data)
                logger.info(f"Loaded state with {len(self._state.bills)} tracked bills")
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Error loading state file: {e}. Starting fresh.")
                self._state = StateData()
        else:
            logger.info("No state file found. Starting fresh.")
            self._state = StateData()

        return self._state

    def save(self) -> None:
        """Save current state to disk."""
        if self._state is None:
            logger.warning("No state to save")
            return

        # Ensure directory exists
        self.state_path.parent.mkdir(parents=True, exist_ok=True)

        with open(self.state_path, "w") as f:
            json.dump(self._state.to_dict(), f, indent=2)

        logger.info(f"Saved state to {self.state_path}")

    def get_state(self) -> StateData:
        """Get the current state, loading if necessary."""
        return self.load()

    def update_last_run(self) -> None:
        """Update the last run timestamp to now."""
        state = self.get_state()
        state.last_run = datetime.now().isoformat()


@dataclass
class BillUpdate:
    """Represents an update/change detected for a bill."""

    bill: BillInfo
    update_type: str  # "new" or "status_change"
    previous_action: str | None = None
    previous_action_date: str | None = None


def process_bills(
    state_manager: StateManager,
    bills: list[BillInfo],
) -> tuple[list[BillUpdate], list[BillInfo]]:
    """Process a list of bills and detect new/changed ones.

    Args:
        state_manager: StateManager instance.
        bills: List of BillInfo objects from search results.

    Returns:
        Tuple of (list of BillUpdates for new/changed bills, list of all bills).
    """
    state = state_manager.get_state()
    updates: list[BillUpdate] = []
    now = datetime.now().isoformat()

    for bill in bills:
        existing = state.bills.get(bill.bill_id)

        if existing is None:
            # New bill
            updates.append(BillUpdate(bill=bill, update_type="new"))
            state.bills[bill.bill_id] = TrackedBill(
                bill_id=bill.bill_id,
                title=bill.title,
                last_action=bill.latest_action,
                last_action_date=bill.latest_action_date,
                first_seen=now,
                last_updated=now,
            )
            logger.info(f"New bill detected: {bill.bill_id}")

        elif _has_status_changed(existing, bill):
            # Status change
            updates.append(
                BillUpdate(
                    bill=bill,
                    update_type="status_change",
                    previous_action=existing.last_action,
                    previous_action_date=existing.last_action_date,
                )
            )
            # Update tracked state
            existing.last_action = bill.latest_action
            existing.last_action_date = bill.latest_action_date
            existing.last_updated = now
            logger.info(f"Status change detected for: {bill.bill_id}")

    return updates, bills


def _has_status_changed(tracked: TrackedBill, current: BillInfo) -> bool:
    """Check if a bill's status has changed.

    Args:
        tracked: Previously tracked bill state.
        current: Current bill info from API.

    Returns:
        True if the status has changed.
    """
    # Check if action date changed
    if tracked.last_action_date != current.latest_action_date:
        return True

    # Check if action text changed (in case date is the same but text differs)
    if tracked.last_action != current.latest_action:
        return True

    return False


def process_federal_register_documents(
    state_manager: StateManager,
    documents: list[Any],
) -> list[Any]:
    """Process Federal Register documents and return new ones.

    Args:
        state_manager: StateManager instance.
        documents: List of FederalRegisterDocument objects.

    Returns:
        List of new FederalRegisterDocument objects (not previously seen).
    """
    state = state_manager.get_state()
    new_docs = []
    now = datetime.now().isoformat()

    for doc in documents:
        doc_number = doc.document_number
        if doc_number not in state.federal_register_documents:
            # New document
            new_docs.append(doc)
            state.federal_register_documents[doc_number] = {
                "document_number": doc_number,
                "title": doc.title,
                "doc_type": doc.doc_type,
                "publication_date": doc.publication_date,
                "first_seen": now,
            }
            logger.info(f"New Federal Register document: {doc_number}")

    return new_docs
