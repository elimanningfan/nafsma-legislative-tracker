# NAFSMA Legislative Tracker - Claude Code Project Brief

## Project Overview

Build a GitHub Actions-based system that automatically monitors federal legislative and regulatory sources relevant to NAFSMA (National Association of Flood & Stormwater Management Agencies), tracks changes, and delivers email digests.

**Repository**: github.com/elimanningfan/nafsma-legislative-tracker
**Initial Notification Email**: jon@nafsma.org
**Approach**: Production-ready MVP, phased source additions

---

## MVP Scope (Phase 1)

Focus on **two high-value integrations** that provide immediate wins:

### 1. Congress.gov API Integration
- Track bills matching NAFSMA keywords (WRDA, NFIP, flood insurance, clean water act, FEMA, stormwater)
- Detect new bill introductions
- Detect status changes on tracked bills
- Pull bill details: sponsors, committees, latest actions, summaries

### 2. Federal Register API Integration  
- Monitor FEMA, EPA, USACE proposed rules and notices
- Track open comment periods
- Alert when comment periods are closing (7-day warning)

### 3. Automated Workflows
- **Daily check** (weekday mornings): New bills, new regulations, status changes
- **Comment period alerts** (twice daily): Closing comment periods

### 4. Output & Delivery
- Markdown digest generated for each run
- Email delivery via SendGrid
- State tracking to avoid duplicate notifications
- Git-committed history of all updates

---

## Technical Stack

```
Language:       Python 3.11+
APIs:           Congress.gov API (free), Federal Register API (free)
Automation:     GitHub Actions (free tier)
Email:          SendGrid (free tier - 100/day)
State:          JSON files committed to repo
Templates:      Jinja2 for digest formatting
```

---

## Repository Structure (Target)

```
nafsma-legislative-tracker/
├── .github/
│   └── workflows/
│       ├── daily-check.yml        # Main daily monitoring
│       └── comment-alerts.yml     # Comment period warnings
├── src/
│   ├── sources/
│   │   ├── congress.py            # Congress.gov API client
│   │   └── federal_register.py    # Federal Register API client
│   ├── outputs/
│   │   ├── digest.py              # Digest generator
│   │   └── email.py               # SendGrid integration
│   ├── utils/
│   │   ├── state.py               # State management
│   │   └── config.py              # Configuration loader
│   └── main.py                    # CLI entry point
├── data/
│   ├── config.yaml                # Source configuration & keywords
│   └── state.json                 # Tracking state (auto-updated)
├── templates/
│   ├── daily_digest.md.j2         # Daily digest template
│   └── comment_alert.md.j2        # Comment period alert template
├── outputs/
│   └── digests/                   # Generated digests (git-tracked)
├── requirements.txt
└── README.md
```

---

## Configuration (data/config.yaml)

```yaml
# NAFSMA Legislative Tracker Configuration

notifications:
  email_recipients:
    - jon@nafsma.org
  
congress:
  api_base: "https://api.congress.gov/v3"
  current_congress: 119
  
  # Bill searches to run
  searches:
    - name: "WRDA"
      query: "water resources development"
    - name: "NFIP"
      query: "flood insurance"
    - name: "Clean Water"
      query: "clean water act"
    - name: "FEMA"
      query: "FEMA emergency management"
    - name: "Stormwater"
      query: "stormwater"
    - name: "Appropriations - USACE"
      query: "army corps engineers appropriations"
      
  # Keywords that indicate high relevance
  priority_keywords:
    critical:
      - "WRDA"
      - "water resources development act"
      - "NFIP"
      - "national flood insurance"
      - "flood insurance program"
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

federal_register:
  api_base: "https://www.federalregister.gov/api/v1"
  
  # Agencies to monitor
  agencies:
    - slug: "federal-emergency-management-agency"
      name: "FEMA"
    - slug: "environmental-protection-agency"
      name: "EPA"
    - slug: "army-corps-of-engineers"  
      name: "USACE"
      
  # Document types to track
  document_types:
    - "Proposed Rule"
    - "Rule"
    - "Notice"
    
  # Days warning for comment periods
  comment_warning_days: 7
```

---

## GitHub Actions Workflows

### Daily Check (.github/workflows/daily-check.yml)

```yaml
name: Daily Legislative Check

on:
  schedule:
    - cron: '0 11 * * 1-5'  # 6 AM ET weekdays
  workflow_dispatch:        # Manual trigger

env:
  CONGRESS_API_KEY: ${{ secrets.CONGRESS_API_KEY }}
  SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}

jobs:
  check:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          
      - run: pip install -r requirements.txt
      
      - name: Run daily check
        run: python -m src.main daily-check
        
      - name: Send digest email
        run: python -m src.main send-digest
        if: success()
        
      - name: Commit state
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/state.json outputs/
          git diff --quiet --cached || git commit -m "Daily check $(date +%Y-%m-%d)"
          git push
```

---

## Required Secrets & Setup

### 1. Get Congress.gov API Key
- Go to: https://api.data.gov/signup/
- Sign up with email
- API key delivered instantly

### 2. Get SendGrid API Key  
- Go to: https://signup.sendgrid.com/
- Create free account (100 emails/day)
- Settings → API Keys → Create API Key (Full Access)
- Verify sender email (jon@nafsma.org)

### 3. Configure Repository Secrets
In GitHub repo → Settings → Secrets and variables → Actions:

```
CONGRESS_API_KEY: [your key from api.data.gov]
SENDGRID_API_KEY: [your key from SendGrid]
```

---

## MVP Deliverables Checklist

### Session 1: Project Setup & Congress.gov Integration
- [ ] Initialize repo structure
- [ ] Create requirements.txt with dependencies
- [ ] Build Congress.gov API client
- [ ] Implement bill search functionality
- [ ] Create state management system
- [ ] Write basic daily digest template

### Session 2: Federal Register & Email Integration
- [ ] Build Federal Register API client
- [ ] Implement comment period tracking
- [ ] Create SendGrid email integration
- [ ] Build digest generator with Jinja2 templates

### Session 3: GitHub Actions & Testing
- [ ] Create daily-check.yml workflow
- [ ] Create comment-alerts.yml workflow
- [ ] Test manual workflow triggers
- [ ] Verify email delivery
- [ ] Document setup in README

### Session 4: Polish & Handoff
- [ ] Refine digest formatting
- [ ] Add error handling and logging
- [ ] Test full automated cycle
- [ ] Create operator documentation
- [ ] Handoff to NAFSMA team

---

## Sample Daily Digest Output

```markdown
# NAFSMA Legislative Update
**Date:** January 21, 2026

## 🔴 Critical Updates

### New Bills Introduced
- **H.R. 1234 - Water Resources Development Act of 2026**
  - Sponsor: Rep. Sam Graves (R-MO)
  - Committee: Transportation and Infrastructure
  - [View on Congress.gov](https://congress.gov/bill/119/hr/1234)

### Bill Status Changes
- **S. 567 - NFIP Reauthorization Act** 
  - Status changed: In Committee → Passed Senate
  - Latest action: "Passed Senate by voice vote"

## 📋 Open Comment Periods

### Closing Within 7 Days
- **FEMA: Proposed Changes to NFIP Rating Methodology**
  - Comments due: January 28, 2026 (7 days)
  - [Submit comment](https://regulations.gov/...)

### Newly Opened
- **EPA: MS4 Permit Program Updates**
  - Comments due: March 15, 2026
  - [View proposed rule](https://federalregister.gov/...)

## 📊 Summary
- New bills tracked: 3
- Status changes: 1
- Comment periods closing soon: 2
- Total items: 6

---
*Generated automatically by NAFSMA Legislative Tracker*
```

---

## Commands for Claude Code Session

Start the Claude Code session with:

```bash
# Clone and enter repo
git clone https://github.com/elimanningfan/nafsma-legislative-tracker.git
cd nafsma-legislative-tracker

# Or if creating fresh
mkdir nafsma-legislative-tracker
cd nafsma-legislative-tracker
git init
```

Then provide this brief to Claude Code with the prompt:

> "I'm building a GitHub Actions-based legislative tracking system for NAFSMA. Here's the project brief. Let's start with Session 1: set up the project structure and build the Congress.gov API integration. Focus on getting a working bill search that can find WRDA, NFIP, and flood-related legislation."

---

## Notes for Development

1. **Congress.gov API** is very well-documented and reliable. No rate limits for reasonable use.

2. **Federal Register API** requires no authentication. Very clean REST API.

3. **SendGrid free tier** requires email verification. Make sure to verify jon@nafsma.org as a sender.

4. **State management** is critical - the system needs to know what it's already seen to avoid duplicate emails.

5. **Start simple** - get the core bill tracking working before adding complexity.

---

## Future Phases (Post-MVP)

**Phase 2**: Add committee RSS feeds (House T&I, Senate EPW)
**Phase 3**: Add USACE/FEMA news monitoring  
**Phase 4**: Add Bill Tracker Excel generation
**Phase 5**: Add AI-powered relevance scoring (Claude API)
**Phase 6**: Web dashboard via GitHub Pages
