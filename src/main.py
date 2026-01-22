"""CLI entry point for NAFSMA Legislative Tracker."""

import logging
import sys
from datetime import datetime

import click

from src.outputs.digest import DigestGenerator
from src.outputs.email import send_daily_digest, send_comment_period_alert
from src.sources.congress import CongressApiClient, find_relevant_bills, run_all_searches
from src.sources.federal_register import (
    FederalRegisterClient,
    fetch_agency_documents,
    get_closing_comment_periods,
)
from src.utils.config import get_project_root, load_config
from src.utils.state import StateManager, process_bills, process_federal_register_documents

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


@click.group()
@click.option("--debug", is_flag=True, help="Enable debug logging")
def cli(debug: bool) -> None:
    """NAFSMA Legislative Tracker CLI."""
    if debug:
        logging.getLogger().setLevel(logging.DEBUG)


@cli.command()
@click.option("--save-digest/--no-save-digest", default=True, help="Save digest to file")
@click.option("--send-email/--no-send-email", default=False, help="Send digest via email")
@click.option("--days-back", default=7, help="Days to look back for Federal Register")
def daily_check(save_digest: bool, send_email: bool, days_back: int) -> None:
    """Run the daily legislative check.

    Uses subject-based filtering to find NAFSMA-relevant bills,
    fetches Federal Register documents, detects new items and
    status changes, and generates a digest.
    """
    logger.info("Starting daily legislative check")

    # Load configuration
    config = load_config()
    logger.info("Configuration loaded")

    # Initialize components
    congress_client = CongressApiClient()
    federal_register_client = FederalRegisterClient()
    state_manager = StateManager()
    digest_generator = DigestGenerator()

    # Find relevant bills using subject-based filtering
    logger.info("Finding NAFSMA-relevant bills...")
    relevant_bills = find_relevant_bills(congress_client, config)
    logger.info(f"Found {len(relevant_bills)} relevant bills")

    # Process bills against state to detect new/changed
    bill_updates, _ = process_bills(state_manager, relevant_bills)
    logger.info(f"Detected {len(bill_updates)} bill updates (new or status changes)")

    # Fetch Federal Register documents
    logger.info("Fetching Federal Register documents...")
    fr_docs = fetch_agency_documents(federal_register_client, config, days_back=days_back)
    logger.info(f"Found {len(fr_docs)} Federal Register documents")

    # Process Federal Register documents to find new ones
    new_fr_docs = process_federal_register_documents(state_manager, fr_docs)
    logger.info(f"Detected {len(new_fr_docs)} new Federal Register documents")

    # Check for comment periods closing soon
    comment_warning_days = config.get("federal_register", {}).get("comment_warning_days", 7)
    comment_alerts = get_closing_comment_periods(fr_docs, warning_days=comment_warning_days)
    logger.info(f"Found {len(comment_alerts)} documents with comment periods closing soon")

    # Generate digest
    digest_content = digest_generator.generate_daily_digest(
        bill_updates,
        federal_register_docs=new_fr_docs,
        comment_alerts=comment_alerts,
    )

    if save_digest:
        output_path = digest_generator.save_digest(digest_content)
        logger.info(f"Digest saved to: {output_path}")

    # Send email if requested
    if send_email:
        date_str = datetime.now().strftime("%Y-%m-%d")
        email_result = send_daily_digest(config, digest_content, date_str)
        if email_result.success:
            logger.info(f"Email sent: {email_result.message}")
        else:
            logger.error(f"Email failed: {email_result.message}")

        # Send separate comment period alert if there are closing comment periods
        if comment_alerts:
            alert_result = send_comment_period_alert(config, comment_alerts)
            if alert_result.success:
                logger.info(f"Comment alert sent: {alert_result.message}")
            else:
                logger.error(f"Comment alert failed: {alert_result.message}")

    # Update and save state
    state_manager.update_last_run()
    state_manager.save()

    # Print digest to stdout
    click.echo("\n" + "=" * 60)
    click.echo(digest_content)
    click.echo("=" * 60 + "\n")

    # Summary
    new_bills = sum(1 for u in bill_updates if u.update_type == "new")
    status_changes = sum(1 for u in bill_updates if u.update_type == "status_change")
    click.echo(f"Summary: {new_bills} new bills, {status_changes} status changes, "
               f"{len(new_fr_docs)} new FR docs, {len(comment_alerts)} comment alerts")


@cli.command()
@click.argument("query")
@click.option("--congress", default=119, help="Congress number (default: 119)")
@click.option("--limit", default=10, help="Maximum results (default: 10)")
def search(query: str, congress: int, limit: int) -> None:
    """Search for bills matching a query (for testing)."""
    logger.info(f"Searching for: {query}")

    config = load_config()
    client = CongressApiClient()
    priority_keywords = config.get("congress", {}).get("priority_keywords", {})

    bills = client.search_and_build_bills(
        query=query,
        congress=congress,
        limit=limit,
        priority_keywords=priority_keywords,
    )

    click.echo(f"\nFound {len(bills)} bills:\n")

    for bill in bills:
        click.echo(f"[{bill.priority.upper()}] {bill.bill_type.upper()} {bill.bill_number}")
        click.echo(f"  Title: {bill.title}")
        if bill.sponsor:
            click.echo(f"  Sponsor: {bill.sponsor}")
        if bill.latest_action:
            click.echo(f"  Latest Action ({bill.latest_action_date}): {bill.latest_action}")
        click.echo(f"  URL: {bill.url}")
        click.echo()


@cli.command()
@click.option("--verbose", "-v", is_flag=True, help="Show detailed information")
def show_state(verbose: bool) -> None:
    """Show current tracking state."""
    state_manager = StateManager()
    state = state_manager.load()

    click.echo(f"Last run: {state.last_run or 'Never'}")
    click.echo(f"Tracked bills: {len(state.bills)}")
    click.echo(f"Tracked Federal Register documents: {len(state.federal_register_documents)}")

    if verbose and state.bills:
        click.echo("\nTracked Bills:")
        for bill_id, tracked in state.bills.items():
            click.echo(f"  - {bill_id}: {tracked.title[:60]}...")
            click.echo(f"    First seen: {tracked.first_seen}")
            click.echo(f"    Last updated: {tracked.last_updated}")

    if verbose and state.federal_register_documents:
        click.echo("\nTracked Federal Register Documents:")
        for doc_id, doc in list(state.federal_register_documents.items())[:10]:
            click.echo(f"  - {doc_id}: {doc.get('title', 'No title')[:50]}...")
            click.echo(f"    Type: {doc.get('doc_type', 'Unknown')}")
        if len(state.federal_register_documents) > 10:
            click.echo(f"  ... and {len(state.federal_register_documents) - 10} more")


@cli.command()
@click.confirmation_option(prompt="Are you sure you want to reset the state?")
def reset_state() -> None:
    """Reset tracking state (removes all tracked items)."""
    state_path = get_project_root() / "data" / "state.json"
    if state_path.exists():
        state_path.unlink()
        click.echo("State reset successfully.")
    else:
        click.echo("No state file found.")


@cli.command()
@click.option("--with-search", is_flag=True, help="Also test text search (may be unreliable)")
def test_api(with_search: bool) -> None:
    """Test the Congress.gov API connection."""
    click.echo("Testing Congress.gov API connection...")

    try:
        client = CongressApiClient()

        # Test basic bill listing (most reliable)
        click.echo("\n1. Testing bill listing endpoint...")
        data = client._make_request("bill/119", {"limit": 3})
        bills = data.get("bills", [])

        if bills:
            click.echo("   Bill listing: OK")
            for b in bills[:3]:
                click.echo(f"   - {b.get('type', '?')}{b.get('number', '?')}: {b.get('title', 'No title')[:50]}...")
        else:
            click.echo("   Bill listing returned no results")

        # Test specific bill fetch
        click.echo("\n2. Testing specific bill fetch...")
        bill_data = client.get_bill_details(119, "hr", 1)
        if bill_data:
            click.echo(f"   Bill details: OK - HR 1: {bill_data.get('title', 'No title')[:50]}...")
        else:
            click.echo("   Bill details: No data returned")

        # Test subjects endpoint (key for our approach)
        click.echo("\n3. Testing subjects endpoint...")
        subjects = client.get_bill_subjects(119, "hr", 1)
        if subjects:
            policy_area = subjects.get("policyArea", {}).get("name", "None")
            leg_subjects = subjects.get("legislativeSubjects", [])
            click.echo(f"   Subjects: OK - Policy Area: {policy_area}")
            click.echo(f"   Legislative subjects: {len(leg_subjects)} found")
        else:
            click.echo("   Subjects: No data returned")

        # Optionally test text search (known to be unreliable)
        if with_search:
            click.echo("\n4. Testing text search (may fail due to API issues)...")
            try:
                results = client.search_bills("flood", limit=3)
                if results:
                    click.echo(f"   Text search: OK - Found {len(results)} results")
                else:
                    click.echo("   Text search: No results")
            except Exception as e:
                click.echo(f"   Text search: FAILED - {e}")
                click.echo("   Note: Congress.gov text search is often unavailable")

        click.echo("\nAPI connection test completed successfully!")

    except Exception as e:
        click.echo(f"API connection failed: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.option("--limit", default=10, help="Maximum bills to show (default: 10)")
def find_bills(limit: int) -> None:
    """Find NAFSMA-relevant bills using subject-based filtering.

    This tests the new reliable approach without modifying state.
    """
    logger.info("Finding NAFSMA-relevant bills...")

    config = load_config()
    client = CongressApiClient()

    bills = find_relevant_bills(client, config)

    click.echo(f"\nFound {len(bills)} relevant bills:\n")

    for bill in bills[:limit]:
        priority_marker = {"critical": "!!!", "high": "!!", "normal": ""}.get(bill.priority, "")
        click.echo(f"[{bill.priority.upper()}] {priority_marker} {bill.bill_type.upper()} {bill.bill_number}")
        click.echo(f"  Title: {bill.title}")
        if bill.policy_area:
            click.echo(f"  Policy Area: {bill.policy_area}")
        if bill.sponsor:
            click.echo(f"  Sponsor: {bill.sponsor}")
        if bill.latest_action:
            click.echo(f"  Latest Action ({bill.latest_action_date}): {bill.latest_action}")
        click.echo(f"  URL: {bill.url}")
        click.echo()

    if len(bills) > limit:
        click.echo(f"... and {len(bills) - limit} more bills")


if __name__ == "__main__":
    cli()
