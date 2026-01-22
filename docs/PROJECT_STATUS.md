# NAFSMA Legislative Tracker - Project Status

**Last Updated:** January 2026

## Overview

The NAFSMA Legislative Tracker is an automated system that monitors federal legislation, regulations, and disaster declarations relevant to flood and stormwater management agencies. It runs daily via GitHub Actions and delivers email digests to NAFSMA staff.

---

## What's Implemented

### Data Sources

| Source | Status | Description |
|--------|--------|-------------|
| **Congress.gov API** | Working | Bills from 119th Congress with subject-based filtering |
| **Federal Register API** | Working | Rules, proposed rules, and notices from FEMA, EPA, USACE |
| **OpenFEMA API** | Working | Disaster declarations (floods, storms, hurricanes) |
| **Committee RSS** | Partial | USACE News works; House T&I and Senate EPW feeds are broken |

### Features

- **Daily automated checks** via GitHub Actions (7 AM ET, weekdays)
- **Email digests** via SendGrid with HTML formatting
- **State tracking** to avoid duplicate notifications
- **Priority scoring** (critical/high/normal) based on NAFSMA keywords
- **Comment period alerts** for regulations closing within 7 days

### Output Example

Each daily digest includes:
- New bills (by priority level)
- Bill status changes
- Comment periods closing soon
- FEMA disaster declarations
- Federal Register documents
- Committee/agency news

---

## What Works Well

### 1. Congress.gov Subject-Based Filtering
The system uses CRS-assigned policy areas and legislative subjects rather than unreliable text search. This reliably surfaces water resources, flood control, and emergency management legislation.

**Relevant subjects tracked:**
- Floods and storm protection
- Water resources development
- Disaster relief and insurance
- Levees, dams, watersheds
- Emergency management

### 2. Federal Register Integration
Excellent coverage of regulatory activity from key agencies:
- **FEMA** - Flood hazard determinations, NFIP changes
- **EPA** - Clean water regulations, water quality rules
- **USACE** - Corps permits, navigation rules

Comment period tracking with 7-day warnings is actionable intelligence.

### 3. OpenFEMA Disaster Tracking
Real-time awareness of disaster declarations affecting NAFSMA members:
- Floods, severe storms, hurricanes
- State-level tracking
- Links to FEMA disaster pages

### 4. State Management
JSON-based tracking prevents duplicate notifications and enables:
- Detection of bill status changes
- First-seen timestamps for all items
- Persistence across runs via git commits

### 5. Automation
GitHub Actions provides reliable, free automation:
- No server to maintain
- Secrets management for API keys
- Manual trigger capability for testing

---

## What Doesn't Work Well

### 1. Congressional Committee RSS Feeds
**Problem:** House T&I and Senate EPW RSS feeds return malformed XML or 404 errors.

**Impact:** No committee hearing or press release tracking from primary committees of jurisdiction.

**Workaround:** Added Congress.gov Most Viewed Bills feed as a fallback, but it's not committee-specific.

### 2. Limited Agency Coverage
**Problem:** Only monitoring 3 agencies (FEMA, EPA, USACE).

**Missing:**
- Department of Interior (water rights, reclamation)
- Department of Transportation (infrastructure)
- NOAA (coastal, weather)
- State-level agencies

### 3. No Historical Analysis
**Problem:** System only tracks "new" items since last run.

**Missing:**
- Trend analysis over time
- Bill progression tracking (introduced → committee → floor → passed)
- Historical comparisons

### 4. Basic Keyword Matching
**Problem:** Priority scoring uses simple substring matching.

**Limitations:**
- No semantic understanding
- Can miss relevant items with different phrasing
- Can flag irrelevant items with keyword coincidence

### 5. Email-Only Output
**Problem:** No web interface or searchable archive.

**Limitations:**
- Hard to search past digests
- No filtering or sorting by user
- No mobile-friendly dashboard

---

## What Could Be Next

### Near-Term Improvements

#### 1. Weekly Digest Workflow
Add `weekly-digest.yml` to summarize the week's activity:
- Aggregate counts
- Highlight most important items
- Upcoming comment deadlines

#### 2. Expand Agency Coverage
Add more Federal Register agencies:
```yaml
agencies:
  - slug: "bureau-of-reclamation"
    name: "Reclamation"
  - slug: "national-oceanic-and-atmospheric-administration"
    name: "NOAA"
```

#### 3. Fix or Replace Committee Feeds
Options:
- Monitor committee websites via web scraping
- Use Congress.gov committee hearing API (if available)
- Subscribe to committee email lists and parse

### Medium-Term Features

#### 4. Bill Tracker Excel Export (Phase 4)
Generate spreadsheets for:
- Active bills being tracked
- Status history
- Sponsor information
- Committee assignments

Useful for sharing with NAFSMA board or members.

#### 5. AI-Powered Relevance Scoring (Phase 5)
Use Claude API to:
- Analyze bill text for NAFSMA relevance
- Generate summaries of complex legislation
- Identify potential impacts on members
- Reduce false positives/negatives

#### 6. Web Dashboard (Phase 6)
GitHub Pages site with:
- Searchable archive of past digests
- Filter by source, priority, date
- Bill tracking status
- Interactive charts

### Long-Term Vision

#### 7. Member Customization
Allow NAFSMA members to:
- Set geographic filters (their state)
- Choose topic preferences
- Adjust notification frequency

#### 8. Slack/Teams Integration
Real-time notifications for:
- Critical legislation
- Urgent comment deadlines
- Major disaster declarations

#### 9. Advocacy Tracking
Monitor:
- NAFSMA position letters
- Member testimony
- Bill co-sponsors from member districts

---

## Technical Architecture

```
GitHub Actions (daily-check.yml)
    │
    ├── Congress.gov API → Subject filtering → Bill tracking
    │
    ├── Federal Register API → Agency filtering → Document tracking
    │
    ├── OpenFEMA API → Incident type filtering → Disaster tracking
    │
    ├── RSS Feeds → Keyword filtering → News tracking
    │
    ├── State Manager → JSON persistence → Change detection
    │
    └── Digest Generator → Jinja2 templates → Email via SendGrid
```

## Repository Structure

```
nafsma-legislative-tracker/
├── src/
│   ├── sources/
│   │   ├── congress.py        # Congress.gov API client
│   │   ├── federal_register.py # Federal Register API client
│   │   ├── openfema.py        # OpenFEMA API client
│   │   └── committee_rss.py   # RSS feed client
│   ├── outputs/
│   │   ├── digest.py          # Digest generation
│   │   └── email.py           # SendGrid email
│   ├── utils/
│   │   ├── config.py          # Configuration loading
│   │   └── state.py           # State management
│   └── main.py                # CLI entry point
├── templates/
│   └── daily_digest.md.j2     # Digest template
├── data/
│   ├── config.yaml            # Configuration
│   └── state.json             # Tracking state
├── .github/workflows/
│   └── daily-check.yml        # GitHub Actions
└── requirements.txt
```

---

## Conclusion

The NAFSMA Legislative Tracker successfully automates monitoring of federal legislation, regulations, and disasters relevant to flood and stormwater management. The core functionality is solid and production-ready.

**Strengths:** Reliable data sources, automated delivery, change detection, priority scoring.

**Gaps:** Committee tracking, limited agencies, no web interface, basic keyword matching.

**Next steps** should focus on expanding coverage (more agencies, fixed committee feeds) and improving usability (Excel exports, web dashboard) before tackling advanced features like AI scoring.
