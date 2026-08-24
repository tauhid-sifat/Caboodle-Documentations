# Market Overview | Fix Misleading Store Count for UNFI Independents / Infra

**MO4** | Bug | Priority: High | Status: New

---

## User Story

**As a** Broker user viewing Market Overview reports,  
**I want** the store count to reflect the actual number of stores I'm selling into, not the banner's total door count,  
**So that** KPI cards and reports are not misleading.

---

## Description

UNFI Independents and Infra are aggregated banners that group many standalone mom-and-pop stores under one label. For example, "UNFI Independents" has a door count of ~700, but a broker may only sell into 1-2 of those stores. When the Market Overview report shows 700 stores, it falsely inflates the broker's actual distribution footprint.

This makes every downstream metric unreliable — KPI cards, store count dashboards, and brand reports all show incorrect numbers.

---

## Root Cause

- UNFI Independents banner has `DoorCount = ~700` (all stores grouped under one banner)
- Market Overview reports pull the banner's door count as "Number of Stores"
- There is no per-broker or per-product distinction between "total banner doors" vs "actual stores with distribution"

---

## Acceptance Criteria

### Scenario 1: Accurate Store Count in Reports
- **Given** a broker has logged a Market Overview entry for a product under UNFI Independents
- **When** viewing the Market Overview report
- **Then** the "Number of Stores" shows the actual stores selected in the log entry, not the banner door count
- **And** if no specific stores were selected, show 0 or "N/A" rather than the banner door count

### Scenario 2: KPI Cards Reflect Actual Count
- **Given** the broker dashboard shows a "Stores In" KPI card
- **Then** the count reflects actual store-level distribution, not aggregated banner door counts
- **And** UNFI Independents / Infra entries are counted individually per store selected

### Scenario 3: Banner Door Count Still Available
- **Given** a brand user views the report
- **Then** they can still see the banner's total door count as reference information
- **But** the default "Number of Stores" column shows actual distribution, not banner total

---

## Notes
- Per client meeting: UNFI Independents is a catch-all for standalone stores without a dedicated banner
- Infra has the same aggregation pattern — apply the same fix
- The MO5 (multiple stores per log) deliverable enables selecting specific stores, which feeds into this fix
- Coordinate with the dashboard KPI cards work (CS-1305)
