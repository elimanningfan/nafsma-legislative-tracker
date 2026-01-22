# NAFSMA Legislative Tracking System
## Technical Specification: GitHub Actions Implementation

---

## Executive Summary

A GitHub Actions-based automation system that monitors 30+ federal legislative and regulatory sources, tracks changes, maintains a bill tracker, and delivers digests to the NAFSMA team.

**Key Characteristics:**
- **Cost:** $0-10/month (within GitHub free tier + optional email service)
- **Infrastructure:** None to manage (serverless via GitHub)
- **Maintenance:** Low (configuration-driven)
- **Reliability:** High (GitHub's infrastructure)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GITHUB REPOSITORY                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     .github/workflows/                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │ daily.yml    │  │ weekly.yml   │  │ on-demand.yml            │  │   │
│  │  │ (6 AM ET)    │  │ (Fri 3 PM)   │  │ (manual trigger)         │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────┬───────────┘  │   │
│  └─────────┼─────────────────┼─────────────────────────┼───────────────┘   │
│            │                 │                         │                    │
│            ▼                 ▼                         ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        src/ (Python)                                 │   │
│  │                                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │ sources/    │  │ analysis/   │  │ outputs/    │  │ utils/     │ │   │
│  │  │             │  │             │  │             │  │            │ │   │
│  │  │ congress.py │  │ relevance.py│  │ digest.py   │  │ state.py   │ │   │
│  │  │ fed_reg.py  │  │ diff.py     │  │ tracker.py  │  │ notify.py  │ │   │
│  │  │ committees.py│ │             │  │ email.py    │  │            │ │   │
│  │  │ agencies.py │  │             │  │             │  │            │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│            │                                                                │
│            ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        data/ (Persisted State)                       │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │   │
│  │  │ sources.yaml    │  │ state.json      │  │ bill_tracker.json   │ │   │
│  │  │ (configuration) │  │ (seen items)    │  │ (tracked bills)     │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│            │                                                                │
│            ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        outputs/ (Generated)                          │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │   │
│  │  │ digests/        │  │ bill_tracker/   │  │ alerts/             │ │   │
│  │  │  2025-01-21.md  │  │  tracker.xlsx   │  │  urgent.json        │ │   │
│  │  │  2025-01-20.md  │  │  tracker.json   │  │                     │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │         EXTERNAL SERVICES           │
                    │                                     │
                    │  • SendGrid/Mailgun (email)        │
                    │  • Slack webhook (optional)        │
                    │  • Congress.gov API                │
                    │  • Federal Register API            │
                    │  • OpenFEMA API                    │
                    └─────────────────────────────────────┘
```

---

## Repository Structure

```
nafsma-legislative-tracker/
│
├── .github/
│   └── workflows/
│       ├── daily-check.yml           # Main daily monitoring workflow
│       ├── weekly-digest.yml         # Weekly summary generation
│       ├── bill-tracker-update.yml   # Update bill tracker spreadsheet
│       ├── comment-period-alert.yml  # Check for closing comment periods
│       └── manual-check.yml          # On-demand full check
│
├── src/
│   ├── __init__.py
│   │
│   ├── sources/                      # Source-specific fetchers
│   │   ├── __init__.py
│   │   ├── base.py                   # Base class for all sources
│   │   ├── congress_api.py           # Congress.gov API integration
│   │   ├── federal_register.py       # Federal Register API
│   │   ├── committee_rss.py          # Congressional committee RSS feeds
│   │   ├── committee_scraper.py      # Scrape pages without RSS
│   │   ├── fema.py                   # FEMA/OpenFEMA integration
│   │   ├── usace.py                  # USACE RSS and news
│   │   ├── epa.py                    # EPA news and regulations
│   │   └── allied_orgs.py            # ASFPM, NACWA, NACo, etc.
│   │
│   ├── analysis/                     # Content analysis
│   │   ├── __init__.py
│   │   ├── relevance.py              # NAFSMA relevance scoring
│   │   ├── categorizer.py            # Categorize by topic (WRDA, NFIP, etc.)
│   │   ├── diff.py                   # Detect meaningful changes
│   │   └── urgency.py                # Flag urgent items
│   │
│   ├── outputs/                      # Output generators
│   │   ├── __init__.py
│   │   ├── digest.py                 # Generate digest markdown/HTML
│   │   ├── bill_tracker.py           # Update bill tracker
│   │   ├── email_sender.py           # Send via SendGrid/Mailgun
│   │   └── slack_notifier.py         # Optional Slack integration
│   │
│   ├── utils/                        # Utilities
│   │   ├── __init__.py
│   │   ├── state.py                  # State management (seen items)
│   │   ├── config.py                 # Configuration loader
│   │   └── logging.py                # Structured logging
│   │
│   └── main.py                       # Main entry point
│
├── data/
│   ├── sources.yaml                  # Source definitions and config
│   ├── keywords.yaml                 # NAFSMA-relevant keywords
│   ├── state.json                    # Tracking state (auto-updated)
│   └── bill_tracker.json             # Current bill tracker data
│
├── outputs/                          # Generated outputs (git-tracked)
│   ├── digests/
│   │   └── .gitkeep
│   ├── bill_tracker/
│   │   └── .gitkeep
│   └── alerts/
│       └── .gitkeep
│
├── templates/
│   ├── daily_digest.md.j2            # Jinja2 template for daily digest
│   ├── weekly_digest.md.j2           # Weekly summary template
│   ├── urgent_alert.md.j2            # Urgent alert template
│   └── email_wrapper.html.j2         # HTML email wrapper
│
├── tests/
│   ├── test_sources/
│   ├── test_analysis/
│   └── test_outputs/
│
├── config.yaml                       # Main configuration
├── requirements.txt                  # Python dependencies
├── pyproject.toml                    # Project metadata
├── README.md                         # Documentation
└── LICENSE
```

---

## GitHub Actions Workflows

### 1. Daily Check Workflow (`.github/workflows/daily-check.yml`)

```yaml
name: Daily Legislative Check

on:
  schedule:
    # Run at 6 AM Eastern (11:00 UTC during EST, 10:00 UTC during EDT)
    - cron: '0 11 * * 1-5'  # Weekdays only
  workflow_dispatch:  # Allow manual trigger
    inputs:
      full_check:
        description: 'Run full check (all sources)'
        required: false
        default: 'false'
        type: boolean

env:
  CONGRESS_API_KEY: ${{ secrets.CONGRESS_API_KEY }}
  SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}
  NOTIFICATION_EMAIL: ${{ vars.NOTIFICATION_EMAIL }}

jobs:
  check-sources:
    runs-on: ubuntu-latest
    
    permissions:
      contents: write  # Needed to commit state changes
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for accurate diffing
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      
      - name: Run daily check
        id: check
        run: |
          python -m src.main daily-check \
            --output-dir outputs/digests \
            --state-file data/state.json \
            ${{ github.event.inputs.full_check == 'true' && '--full' || '' }}
        env:
          RUN_DATE: ${{ github.event.repository.updated_at }}
      
      - name: Check for new items
        id: changes
        run: |
          if [ -f outputs/digests/$(date +%Y-%m-%d).md ]; then
            echo "has_updates=true" >> $GITHUB_OUTPUT
            echo "digest_file=outputs/digests/$(date +%Y-%m-%d).md" >> $GITHUB_OUTPUT
          else
            echo "has_updates=false" >> $GITHUB_OUTPUT
          fi
      
      - name: Send email notification
        if: steps.changes.outputs.has_updates == 'true'
        run: |
          python -m src.outputs.email_sender \
            --digest-file ${{ steps.changes.outputs.digest_file }} \
            --recipients "$NOTIFICATION_EMAIL"
      
      - name: Commit state changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add data/state.json outputs/
          git diff --quiet --cached || git commit -m "Daily check: $(date +%Y-%m-%d)"
          git push

  check-urgent:
    runs-on: ubuntu-latest
    needs: check-sources
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          ref: main  # Get latest after previous job's push
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Check for urgent items
        id: urgent
        run: |
          python -m src.main check-urgent \
            --output-file outputs/alerts/urgent.json
      
      - name: Send urgent alerts
        if: steps.urgent.outputs.has_urgent == 'true'
        run: |
          python -m src.outputs.email_sender \
            --template urgent_alert \
            --data-file outputs/alerts/urgent.json \
            --recipients "$NOTIFICATION_EMAIL" \
            --subject "URGENT: NAFSMA Legislative Alert"
```

### 2. Weekly Digest Workflow (`.github/workflows/weekly-digest.yml`)

```yaml
name: Weekly Legislative Digest

on:
  schedule:
    # Run at 3 PM Eastern on Fridays
    - cron: '0 20 * * 5'
  workflow_dispatch:

env:
  CONGRESS_API_KEY: ${{ secrets.CONGRESS_API_KEY }}
  SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}
  NOTIFICATION_EMAIL: ${{ vars.NOTIFICATION_EMAIL }}

jobs:
  generate-digest:
    runs-on: ubuntu-latest
    
    permissions:
      contents: write
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Generate weekly digest
        run: |
          python -m src.main weekly-digest \
            --output-dir outputs/digests \
            --week-ending $(date +%Y-%m-%d)
      
      - name: Update bill tracker
        run: |
          python -m src.outputs.bill_tracker \
            --input-file data/bill_tracker.json \
            --output-xlsx outputs/bill_tracker/NAFSMA_Bill_Tracker_$(date +%Y-%m-%d).xlsx
      
      - name: Send weekly digest email
        run: |
          python -m src.outputs.email_sender \
            --template weekly_digest \
            --digest-file outputs/digests/weekly_$(date +%Y-%m-%d).md \
            --attachments outputs/bill_tracker/NAFSMA_Bill_Tracker_$(date +%Y-%m-%d).xlsx \
            --recipients "$NOTIFICATION_EMAIL"
      
      - name: Commit updates
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add data/ outputs/
          git diff --quiet --cached || git commit -m "Weekly digest: $(date +%Y-%m-%d)"
          git push
```

### 3. Comment Period Alert Workflow (`.github/workflows/comment-period-alert.yml`)

```yaml
name: Comment Period Monitor

on:
  schedule:
    # Run twice daily at 8 AM and 2 PM Eastern
    - cron: '0 13 * * 1-5'
    - cron: '0 19 * * 1-5'
  workflow_dispatch:

env:
  SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}
  NOTIFICATION_EMAIL: ${{ vars.NOTIFICATION_EMAIL }}

jobs:
  check-comment-periods:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Check Federal Register comment periods
        id: comments
        run: |
          python -m src.main check-comment-periods \
            --agencies FEMA EPA USACE \
            --days-warning 7 \
            --output-file outputs/alerts/comment_periods.json
      
      - name: Send alerts for closing periods
        if: steps.comments.outputs.closing_soon == 'true'
        run: |
          python -m src.outputs.email_sender \
            --template comment_period_alert \
            --data-file outputs/alerts/comment_periods.json \
            --recipients "$NOTIFICATION_EMAIL" \
            --subject "Comment Period Closing Soon - Action Required"
```

### 4. Bill Tracker Update Workflow (`.github/workflows/bill-tracker-update.yml`)

```yaml
name: Update Bill Tracker

on:
  schedule:
    # Run daily at 7 AM Eastern
    - cron: '0 12 * * 1-5'
  workflow_dispatch:
    inputs:
      bill_number:
        description: 'Specific bill to check (e.g., HR1234)'
        required: false
        type: string

env:
  CONGRESS_API_KEY: ${{ secrets.CONGRESS_API_KEY }}

jobs:
  update-tracker:
    runs-on: ubuntu-latest
    
    permissions:
      contents: write
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Update bill tracker from Congress.gov
        run: |
          python -m src.main update-bill-tracker \
            --tracker-file data/bill_tracker.json \
            ${{ github.event.inputs.bill_number && format('--bill {0}', github.event.inputs.bill_number) || '' }}
      
      - name: Generate updated Excel file
        run: |
          python -m src.outputs.bill_tracker \
            --input-file data/bill_tracker.json \
            --output-xlsx outputs/bill_tracker/NAFSMA_Bill_Tracker_Current.xlsx
      
      - name: Check for status changes
        id: changes
        run: |
          git diff --name-only data/bill_tracker.json | grep -q bill_tracker.json && \
            echo "has_changes=true" >> $GITHUB_OUTPUT || \
            echo "has_changes=false" >> $GITHUB_OUTPUT
      
      - name: Commit changes
        if: steps.changes.outputs.has_changes == 'true'
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add data/bill_tracker.json outputs/bill_tracker/
          git commit -m "Bill tracker update: $(date +%Y-%m-%d)"
          git push
```

---

## Core Python Modules

### Source Configuration (`data/sources.yaml`)

```yaml
# NAFSMA Legislative Tracking - Source Configuration

congress_api:
  enabled: true
  api_base: "https://api.congress.gov/v3"
  searches:
    - name: "WRDA Bills"
      query: "water resources development"
      congress: 119
      bill_type: ["hr", "s"]
    - name: "NFIP Bills"
      query: "flood insurance"
      congress: 119
    - name: "Appropriations - Energy Water"
      query: "energy water appropriations"
      congress: 119
    - name: "Clean Water Act"
      query: "clean water act"
      congress: 119
    - name: "FEMA Reform"
      query: "FEMA emergency management"
      congress: 119

federal_register:
  enabled: true
  api_base: "https://www.federalregister.gov/api/v1"
  agencies:
    - slug: "federal-emergency-management-agency"
      name: "FEMA"
      priority: critical
    - slug: "environmental-protection-agency"
      name: "EPA"
      priority: critical
    - slug: "army-corps-of-engineers"
      name: "USACE"
      priority: critical
    - slug: "national-oceanic-and-atmospheric-administration"
      name: "NOAA"
      priority: medium
  document_types:
    - "Proposed Rule"
    - "Rule"
    - "Notice"

committees:
  rss_feeds:
    - name: "House T&I"
      url: "https://transportation.house.gov/news/documentquery.aspx?DocumentTypeID=2545&rss=true"
      priority: critical
      keywords: ["water", "WRDA", "FEMA", "flood", "infrastructure"]
    
    - name: "Senate EPW"
      url: "https://www.epw.senate.gov/public/index.cfm/rss/feed"
      priority: critical
      keywords: ["water", "WRDA", "infrastructure", "EPA"]
  
  scrape_pages:
    - name: "House T&I Water Resources Hearings"
      url: "https://transportation.house.gov/subcommittees/subcommittee/?ID=107422"
      selector: ".news-item"
      priority: critical
    
    - name: "House T&I Emergency Management Hearings"
      url: "https://transportation.house.gov/subcommittees/subcommittee/?ID=107419"
      selector: ".news-item"
      priority: critical

agencies:
  fema:
    enabled: true
    openfema_api: "https://www.fema.gov/api/open/v2"
    news_rss: "https://www.fema.gov/feeds/all-news.rss"
    priority: critical
    
  usace:
    enabled: true
    news_rss: "https://www.usace.army.mil/RSS/"
    priority: critical
    
  epa:
    enabled: true
    news_rss: "https://www.epa.gov/newsreleases/rss"
    priority: high
    keywords: ["water", "stormwater", "NPDES", "WIFIA", "clean water"]

allied_orgs:
  - name: "ASFPM"
    url: "https://www.floods.org/news/"
    type: scrape
    priority: high
    
  - name: "NACWA"
    url: "https://www.nacwa.org/advocacy-analysis/legislative-updates"
    type: scrape
    priority: medium

# Relevance keywords for filtering
relevance_keywords:
  critical:
    - "WRDA"
    - "water resources development act"
    - "NFIP"
    - "national flood insurance"
    - "flood insurance program"
    - "Risk Rating 2.0"
    - "levee safety"
    - "section 408"
    
  high:
    - "FEMA"
    - "USACE"
    - "Army Corps"
    - "flood control"
    - "flood risk"
    - "stormwater"
    - "MS4"
    - "NPDES"
    - "clean water act"
    - "BRIC"
    - "hazard mitigation"
    - "WIFIA"
    
  medium:
    - "EPA water"
    - "infrastructure"
    - "appropriations"
    - "disaster"
    - "emergency management"
    - "floodplain"
    - "watershed"
```

### Congress.gov API Integration (`src/sources/congress_api.py`)

```python
"""
Congress.gov API Integration

Fetches bill information, tracks status changes, and identifies new legislation.
API Documentation: https://api.congress.gov/
"""

import os
import httpx
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass
from enum import Enum

class BillStatus(Enum):
    INTRODUCED = "introduced"
    IN_COMMITTEE = "in_committee"
    PASSED_HOUSE = "passed_house"
    PASSED_SENATE = "passed_senate"
    PASSED_BOTH = "passed_both"
    TO_PRESIDENT = "to_president"
    BECAME_LAW = "became_law"
    VETOED = "vetoed"

@dataclass
class Bill:
    congress: int
    bill_type: str  # hr, s, hjres, sjres, hconres, sconres, hres, sres
    bill_number: int
    title: str
    short_title: Optional[str]
    sponsor: str
    sponsor_party: str
    sponsor_state: str
    introduced_date: datetime
    latest_action: str
    latest_action_date: datetime
    status: BillStatus
    committees: list[str]
    cosponsors_count: int
    subjects: list[str]
    summary: Optional[str]
    url: str
    
    @property
    def bill_id(self) -> str:
        return f"{self.bill_type}{self.bill_number}-{self.congress}"
    
    def to_dict(self) -> dict:
        return {
            "bill_id": self.bill_id,
            "congress": self.congress,
            "bill_type": self.bill_type,
            "bill_number": self.bill_number,
            "title": self.title,
            "short_title": self.short_title,
            "sponsor": self.sponsor,
            "sponsor_party": self.sponsor_party,
            "sponsor_state": self.sponsor_state,
            "introduced_date": self.introduced_date.isoformat(),
            "latest_action": self.latest_action,
            "latest_action_date": self.latest_action_date.isoformat(),
            "status": self.status.value,
            "committees": self.committees,
            "cosponsors_count": self.cosponsors_count,
            "subjects": self.subjects,
            "summary": self.summary,
            "url": self.url,
        }


class CongressAPI:
    """Client for Congress.gov API"""
    
    BASE_URL = "https://api.congress.gov/v3"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("CONGRESS_API_KEY")
        if not self.api_key:
            raise ValueError("Congress.gov API key required")
        
        self.client = httpx.Client(
            base_url=self.BASE_URL,
            params={"api_key": self.api_key},
            timeout=30.0,
        )
    
    def search_bills(
        self,
        query: str,
        congress: int = 119,
        bill_type: Optional[list[str]] = None,
        from_date: Optional[datetime] = None,
        limit: int = 50,
    ) -> list[Bill]:
        """Search for bills matching query terms"""
        
        params = {
            "query": query,
            "limit": limit,
            "sort": "updateDate desc",
        }
        
        if from_date:
            params["fromDateTime"] = from_date.strftime("%Y-%m-%dT00:00:00Z")
        
        response = self.client.get(f"/bill/{congress}", params=params)
        response.raise_for_status()
        
        bills = []
        for item in response.json().get("bills", []):
            # Filter by bill type if specified
            if bill_type and item["type"].lower() not in [t.lower() for t in bill_type]:
                continue
            
            bill = self._fetch_bill_details(congress, item["type"], item["number"])
            if bill:
                bills.append(bill)
        
        return bills
    
    def get_bill(self, congress: int, bill_type: str, bill_number: int) -> Optional[Bill]:
        """Get details for a specific bill"""
        return self._fetch_bill_details(congress, bill_type, bill_number)
    
    def get_bills_updated_since(
        self,
        since: datetime,
        congress: int = 119,
    ) -> list[Bill]:
        """Get all bills updated since a given datetime"""
        
        params = {
            "fromDateTime": since.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "sort": "updateDate desc",
            "limit": 250,
        }
        
        response = self.client.get(f"/bill/{congress}", params=params)
        response.raise_for_status()
        
        bills = []
        for item in response.json().get("bills", []):
            bill = self._fetch_bill_details(congress, item["type"], item["number"])
            if bill:
                bills.append(bill)
        
        return bills
    
    def _fetch_bill_details(
        self,
        congress: int,
        bill_type: str,
        bill_number: int
    ) -> Optional[Bill]:
        """Fetch full details for a single bill"""
        
        try:
            response = self.client.get(f"/bill/{congress}/{bill_type}/{bill_number}")
            response.raise_for_status()
            data = response.json()["bill"]
            
            # Get summary if available
            summary = None
            summary_resp = self.client.get(
                f"/bill/{congress}/{bill_type}/{bill_number}/summaries"
            )
            if summary_resp.status_code == 200:
                summaries = summary_resp.json().get("summaries", [])
                if summaries:
                    summary = summaries[0].get("text")
            
            # Get subjects
            subjects = []
            subjects_resp = self.client.get(
                f"/bill/{congress}/{bill_type}/{bill_number}/subjects"
            )
            if subjects_resp.status_code == 200:
                subjects = [
                    s["name"] for s in subjects_resp.json().get("subjects", [])
                ]
            
            return Bill(
                congress=congress,
                bill_type=bill_type.lower(),
                bill_number=bill_number,
                title=data.get("title", ""),
                short_title=data.get("shortTitle"),
                sponsor=data.get("sponsor", {}).get("fullName", "Unknown"),
                sponsor_party=data.get("sponsor", {}).get("party", ""),
                sponsor_state=data.get("sponsor", {}).get("state", ""),
                introduced_date=datetime.fromisoformat(
                    data["introducedDate"].replace("Z", "+00:00")
                ),
                latest_action=data.get("latestAction", {}).get("text", ""),
                latest_action_date=datetime.fromisoformat(
                    data.get("latestAction", {}).get("actionDate", data["introducedDate"]).replace("Z", "+00:00")
                ),
                status=self._determine_status(data),
                committees=[c["name"] for c in data.get("committees", {}).get("item", [])],
                cosponsors_count=data.get("cosponsors", {}).get("count", 0),
                subjects=subjects,
                summary=summary,
                url=data.get("url", f"https://congress.gov/bill/{congress}/{bill_type}/{bill_number}"),
            )
            
        except Exception as e:
            print(f"Error fetching bill {bill_type}{bill_number}: {e}")
            return None
    
    def _determine_status(self, data: dict) -> BillStatus:
        """Determine bill status from API data"""
        latest_action = data.get("latestAction", {}).get("text", "").lower()
        
        if "became public law" in latest_action:
            return BillStatus.BECAME_LAW
        elif "vetoed" in latest_action:
            return BillStatus.VETOED
        elif "presented to president" in latest_action:
            return BillStatus.TO_PRESIDENT
        elif "passed senate" in latest_action and "passed house" in data.get("title", "").lower():
            return BillStatus.PASSED_BOTH
        elif "passed senate" in latest_action:
            return BillStatus.PASSED_SENATE
        elif "passed house" in latest_action:
            return BillStatus.PASSED_HOUSE
        elif "referred to" in latest_action:
            return BillStatus.IN_COMMITTEE
        else:
            return BillStatus.INTRODUCED
    
    def close(self):
        self.client.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        self.close()
```

### Federal Register Integration (`src/sources/federal_register.py`)

```python
"""
Federal Register API Integration

Monitors proposed rules, final rules, and notices from FEMA, EPA, USACE, and other agencies.
API Documentation: https://www.federalregister.gov/developers/documentation/api/v1
"""

import httpx
from datetime import datetime, date, timedelta
from typing import Optional
from dataclasses import dataclass

@dataclass
class FederalRegisterDocument:
    document_number: str
    document_type: str  # Rule, Proposed Rule, Notice
    title: str
    abstract: Optional[str]
    agencies: list[str]
    publication_date: date
    effective_date: Optional[date]
    comment_end_date: Optional[date]
    comments_close_on: Optional[date]
    docket_ids: list[str]
    regulation_id_numbers: list[str]
    html_url: str
    pdf_url: str
    
    @property
    def is_comment_open(self) -> bool:
        if not self.comments_close_on:
            return False
        return self.comments_close_on >= date.today()
    
    @property
    def days_until_comment_close(self) -> Optional[int]:
        if not self.comments_close_on:
            return None
        return (self.comments_close_on - date.today()).days
    
    def to_dict(self) -> dict:
        return {
            "document_number": self.document_number,
            "document_type": self.document_type,
            "title": self.title,
            "abstract": self.abstract,
            "agencies": self.agencies,
            "publication_date": self.publication_date.isoformat(),
            "effective_date": self.effective_date.isoformat() if self.effective_date else None,
            "comment_end_date": self.comments_close_on.isoformat() if self.comments_close_on else None,
            "docket_ids": self.docket_ids,
            "html_url": self.html_url,
            "pdf_url": self.pdf_url,
            "is_comment_open": self.is_comment_open,
            "days_until_comment_close": self.days_until_comment_close,
        }


class FederalRegisterAPI:
    """Client for Federal Register API"""
    
    BASE_URL = "https://www.federalregister.gov/api/v1"
    
    # Agency slugs for NAFSMA-relevant agencies
    NAFSMA_AGENCIES = {
        "fema": "federal-emergency-management-agency",
        "epa": "environmental-protection-agency",
        "usace": "army-corps-of-engineers",
        "noaa": "national-oceanic-and-atmospheric-administration",
        "hud": "housing-and-urban-development-department",
    }
    
    def __init__(self):
        self.client = httpx.Client(
            base_url=self.BASE_URL,
            timeout=30.0,
        )
    
    def get_documents(
        self,
        agencies: Optional[list[str]] = None,
        document_types: Optional[list[str]] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        per_page: int = 100,
    ) -> list[FederalRegisterDocument]:
        """Fetch documents from Federal Register"""
        
        params = {
            "per_page": per_page,
            "order": "newest",
            "fields[]": [
                "document_number",
                "type",
                "title",
                "abstract",
                "agencies",
                "publication_date",
                "effective_on",
                "comments_close_on",
                "docket_ids",
                "regulation_id_numbers",
                "html_url",
                "pdf_url",
            ],
        }
        
        if agencies:
            # Convert friendly names to slugs
            agency_slugs = []
            for agency in agencies:
                if agency.lower() in self.NAFSMA_AGENCIES:
                    agency_slugs.append(self.NAFSMA_AGENCIES[agency.lower()])
                else:
                    agency_slugs.append(agency)
            params["conditions[agencies][]"] = agency_slugs
        
        if document_types:
            params["conditions[type][]"] = document_types
        
        if from_date:
            params["conditions[publication_date][gte]"] = from_date.isoformat()
        
        if to_date:
            params["conditions[publication_date][lte]"] = to_date.isoformat()
        
        response = self.client.get("/documents.json", params=params)
        response.raise_for_status()
        
        documents = []
        for item in response.json().get("results", []):
            doc = self._parse_document(item)
            if doc:
                documents.append(doc)
        
        return documents
    
    def get_open_comment_periods(
        self,
        agencies: Optional[list[str]] = None,
        days_remaining: Optional[int] = None,
    ) -> list[FederalRegisterDocument]:
        """Get documents with open comment periods"""
        
        today = date.today()
        
        params = {
            "per_page": 100,
            "conditions[comment_date][gte]": today.isoformat(),
            "fields[]": [
                "document_number",
                "type",
                "title",
                "abstract",
                "agencies",
                "publication_date",
                "comments_close_on",
                "docket_ids",
                "html_url",
                "pdf_url",
            ],
        }
        
        if agencies:
            agency_slugs = [
                self.NAFSMA_AGENCIES.get(a.lower(), a) for a in agencies
            ]
            params["conditions[agencies][]"] = agency_slugs
        
        response = self.client.get("/documents.json", params=params)
        response.raise_for_status()
        
        documents = []
        for item in response.json().get("results", []):
            doc = self._parse_document(item)
            if doc:
                # Filter by days remaining if specified
                if days_remaining and doc.days_until_comment_close:
                    if doc.days_until_comment_close <= days_remaining:
                        documents.append(doc)
                else:
                    documents.append(doc)
        
        return documents
    
    def get_document(self, document_number: str) -> Optional[FederalRegisterDocument]:
        """Get a specific document by number"""
        
        response = self.client.get(f"/documents/{document_number}.json")
        if response.status_code == 404:
            return None
        response.raise_for_status()
        
        return self._parse_document(response.json())
    
    def _parse_document(self, data: dict) -> Optional[FederalRegisterDocument]:
        """Parse API response into FederalRegisterDocument"""
        
        try:
            return FederalRegisterDocument(
                document_number=data["document_number"],
                document_type=data.get("type", "Unknown"),
                title=data.get("title", ""),
                abstract=data.get("abstract"),
                agencies=[a["name"] for a in data.get("agencies", [])],
                publication_date=date.fromisoformat(data["publication_date"]),
                effective_date=date.fromisoformat(data["effective_on"]) if data.get("effective_on") else None,
                comment_end_date=date.fromisoformat(data["comments_close_on"]) if data.get("comments_close_on") else None,
                comments_close_on=date.fromisoformat(data["comments_close_on"]) if data.get("comments_close_on") else None,
                docket_ids=data.get("docket_ids", []),
                regulation_id_numbers=data.get("regulation_id_numbers", []),
                html_url=data.get("html_url", ""),
                pdf_url=data.get("pdf_url", ""),
            )
        except Exception as e:
            print(f"Error parsing document: {e}")
            return None
    
    def close(self):
        self.client.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        self.close()
```

### State Management (`src/utils/state.py`)

```python
"""
State Management

Tracks what items have been seen to avoid duplicate notifications.
State is persisted to JSON and committed back to the repository.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, field, asdict

@dataclass
class SeenItem:
    item_id: str
    source: str
    first_seen: datetime
    last_seen: datetime
    title: str
    status: Optional[str] = None
    notified: bool = False
    
@dataclass
class TrackingState:
    last_check: datetime
    seen_items: dict[str, SeenItem] = field(default_factory=dict)
    bill_statuses: dict[str, str] = field(default_factory=dict)
    
    def has_seen(self, item_id: str) -> bool:
        return item_id in self.seen_items
    
    def mark_seen(
        self,
        item_id: str,
        source: str,
        title: str,
        status: Optional[str] = None,
    ) -> bool:
        """
        Mark an item as seen.
        Returns True if this is a new item, False if already seen.
        """
        now = datetime.utcnow()
        
        if item_id in self.seen_items:
            self.seen_items[item_id].last_seen = now
            return False
        
        self.seen_items[item_id] = SeenItem(
            item_id=item_id,
            source=source,
            first_seen=now,
            last_seen=now,
            title=title,
            status=status,
        )
        return True
    
    def get_status_change(self, bill_id: str, new_status: str) -> Optional[tuple[str, str]]:
        """
        Check if a bill's status has changed.
        Returns (old_status, new_status) if changed, None otherwise.
        """
        old_status = self.bill_statuses.get(bill_id)
        
        if old_status is None:
            self.bill_statuses[bill_id] = new_status
            return None
        
        if old_status != new_status:
            self.bill_statuses[bill_id] = new_status
            return (old_status, new_status)
        
        return None
    
    def mark_notified(self, item_id: str):
        """Mark an item as having been included in a notification"""
        if item_id in self.seen_items:
            self.seen_items[item_id].notified = True
    
    def get_unnotified_items(self, source: Optional[str] = None) -> list[SeenItem]:
        """Get items that haven't been included in notifications yet"""
        items = []
        for item in self.seen_items.values():
            if not item.notified:
                if source is None or item.source == source:
                    items.append(item)
        return items
    
    def cleanup_old_items(self, days: int = 90):
        """Remove items older than specified days"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        self.seen_items = {
            k: v for k, v in self.seen_items.items()
            if v.last_seen > cutoff
        }


class StateManager:
    """Manages persistence of tracking state"""
    
    def __init__(self, state_file: Path):
        self.state_file = Path(state_file)
        self.state: Optional[TrackingState] = None
    
    def load(self) -> TrackingState:
        """Load state from file"""
        if self.state_file.exists():
            with open(self.state_file) as f:
                data = json.load(f)
            
            # Parse seen items
            seen_items = {}
            for item_id, item_data in data.get("seen_items", {}).items():
                seen_items[item_id] = SeenItem(
                    item_id=item_data["item_id"],
                    source=item_data["source"],
                    first_seen=datetime.fromisoformat(item_data["first_seen"]),
                    last_seen=datetime.fromisoformat(item_data["last_seen"]),
                    title=item_data["title"],
                    status=item_data.get("status"),
                    notified=item_data.get("notified", False),
                )
            
            self.state = TrackingState(
                last_check=datetime.fromisoformat(data["last_check"]),
                seen_items=seen_items,
                bill_statuses=data.get("bill_statuses", {}),
            )
        else:
            self.state = TrackingState(last_check=datetime.utcnow())
        
        return self.state
    
    def save(self):
        """Save state to file"""
        if self.state is None:
            return
        
        # Convert to JSON-serializable format
        data = {
            "last_check": self.state.last_check.isoformat(),
            "seen_items": {
                k: {
                    "item_id": v.item_id,
                    "source": v.source,
                    "first_seen": v.first_seen.isoformat(),
                    "last_seen": v.last_seen.isoformat(),
                    "title": v.title,
                    "status": v.status,
                    "notified": v.notified,
                }
                for k, v in self.state.seen_items.items()
            },
            "bill_statuses": self.state.bill_statuses,
        }
        
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.state_file, "w") as f:
            json.dump(data, f, indent=2)
    
    def __enter__(self):
        self.load()
        return self.state
    
    def __exit__(self, *args):
        self.save()
```

---

## Digest Generation (`src/outputs/digest.py`)

```python
"""
Digest Generator

Creates formatted markdown/HTML digests from collected updates.
"""

from datetime import datetime, date
from pathlib import Path
from typing import Optional
from jinja2 import Environment, FileSystemLoader
from dataclasses import dataclass

@dataclass
class DigestItem:
    source: str
    category: str  # legislation, regulation, hearing, news
    title: str
    summary: str
    url: str
    date: date
    priority: str  # critical, high, medium, low
    action_required: Optional[str] = None
    deadline: Optional[date] = None

@dataclass
class DigestSection:
    title: str
    items: list[DigestItem]

class DigestGenerator:
    """Generates formatted digests"""
    
    def __init__(self, template_dir: Path):
        self.env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=True,
        )
    
    def generate_daily_digest(
        self,
        items: list[DigestItem],
        digest_date: date,
        output_path: Path,
    ) -> Path:
        """Generate daily digest markdown"""
        
        # Group items by category
        sections = self._group_by_category(items)
        
        # Sort by priority within each section
        for section in sections:
            section.items.sort(
                key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3}[x.priority]
            )
        
        template = self.env.get_template("daily_digest.md.j2")
        content = template.render(
            date=digest_date,
            sections=sections,
            total_items=len(items),
            critical_count=sum(1 for i in items if i.priority == "critical"),
            action_items=[i for i in items if i.action_required],
        )
        
        output_file = output_path / f"{digest_date.isoformat()}.md"
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(content)
        
        return output_file
    
    def generate_weekly_digest(
        self,
        items: list[DigestItem],
        week_ending: date,
        output_path: Path,
    ) -> Path:
        """Generate weekly summary digest"""
        
        sections = self._group_by_category(items)
        
        template = self.env.get_template("weekly_digest.md.j2")
        content = template.render(
            week_ending=week_ending,
            sections=sections,
            total_items=len(items),
            by_source=self._count_by_source(items),
            by_priority=self._count_by_priority(items),
        )
        
        output_file = output_path / f"weekly_{week_ending.isoformat()}.md"
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(content)
        
        return output_file
    
    def _group_by_category(self, items: list[DigestItem]) -> list[DigestSection]:
        """Group items into sections by category"""
        
        categories = {
            "legislation": "Legislative Updates",
            "regulation": "Regulatory Actions",
            "hearing": "Hearings & Markups",
            "comment": "Comment Periods",
            "news": "Agency News",
            "other": "Other Updates",
        }
        
        sections = []
        for cat_key, cat_title in categories.items():
            cat_items = [i for i in items if i.category == cat_key]
            if cat_items:
                sections.append(DigestSection(title=cat_title, items=cat_items))
        
        return sections
    
    def _count_by_source(self, items: list[DigestItem]) -> dict[str, int]:
        counts = {}
        for item in items:
            counts[item.source] = counts.get(item.source, 0) + 1
        return dict(sorted(counts.items(), key=lambda x: -x[1]))
    
    def _count_by_priority(self, items: list[DigestItem]) -> dict[str, int]:
        counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        for item in items:
            counts[item.priority] += 1
        return counts
```

---

## GitHub Actions Limits & Cost Analysis

### Free Tier Limits (as of 2024)

| Resource | Free Tier Limit | Our Expected Usage |
|----------|-----------------|-------------------|
| Actions minutes/month | 2,000 min (Linux) | ~200-400 min |
| Storage for artifacts | 500 MB | ~50 MB |
| Concurrent jobs | 20 | 1-2 |

### Estimated Monthly Usage

| Workflow | Frequency | Est. Runtime | Monthly Minutes |
|----------|-----------|--------------|-----------------|
| Daily check | 5x/week | 3-5 min | ~80 min |
| Weekly digest | 1x/week | 5-8 min | ~30 min |
| Comment period check | 10x/week | 2-3 min | ~100 min |
| Bill tracker update | 5x/week | 2-4 min | ~60 min |
| **Total** | | | **~270 min** |

**Verdict: Well within free tier** (13% of limit)

### Optional Paid Services

| Service | Purpose | Free Tier | Paid |
|---------|---------|-----------|------|
| SendGrid | Email delivery | 100 emails/day | $15/mo for more |
| Slack webhook | Notifications | Free | Free |
| Congress.gov API | Bill data | Free (no limits) | N/A |
| Federal Register API | Regulations | Free (no limits) | N/A |

---

## Security Considerations

### Secrets Management

```yaml
# Required secrets (set in repo Settings > Secrets)
CONGRESS_API_KEY: "your-key-here"      # Get from api.data.gov
SENDGRID_API_KEY: "SG.xxxxx"           # For email delivery
SLACK_WEBHOOK_URL: "https://hooks..."  # Optional

# Repository variables (not secrets, but configurable)
NOTIFICATION_EMAIL: "team@nafsma.org"
```

### Permissions

```yaml
# Minimal permissions in workflow
permissions:
  contents: write    # To commit state changes
  # No other permissions needed
```

---

## Deployment Steps

1. **Create repository** from template or fresh
2. **Configure secrets** in Settings > Secrets and variables > Actions
3. **Get API keys**:
   - Congress.gov: https://api.data.gov/signup/
   - SendGrid: https://sendgrid.com/free/
4. **Customize** `data/sources.yaml` for NAFSMA priorities
5. **Test manually** via workflow_dispatch
6. **Enable scheduled** workflows (automatic once committed)

---

## Monitoring & Maintenance

### Workflow Monitoring

- GitHub Actions tab shows all runs
- Email notifications on failure (configure in repo settings)
- Logs retained for 90 days

### Maintenance Tasks

| Task | Frequency | Description |
|------|-----------|-------------|
| Review digests | Weekly | Ensure relevance filtering is working |
| Update keywords | Monthly | Add new relevant terms as issues emerge |
| Check API changes | Quarterly | Congress.gov/Fed Register API updates |
| Clean old state | Automatic | `cleanup_old_items()` runs in workflow |

---

## Future Enhancements

1. **Claude API Integration**: Add AI-powered summarization and relevance scoring
2. **Web Dashboard**: GitHub Pages site showing current status
3. **Slack/Teams Integration**: Real-time alerts for urgent items
4. **Historical Analytics**: Track legislative trends over time
5. **Member Portal**: Self-service dashboard for NAFSMA members
