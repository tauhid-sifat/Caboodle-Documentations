---
module: market-overview
jira: [CS-1609]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Market Overview | Add Text Search to List View

**CS-1609** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user viewing the Market Overview list,  
**I want** a free-text search bar that searches across records,  
**So that** I can quickly find observations without navigating multiple filter dropdowns.

---

## Description

The Market Overview list view currently supports heavy filtering via dropdowns (statuses, brand, banner, retailer, SKU, DC, store, region IDs, created by, date range, case stack, training flags), but lacks a general text search input. Users must click through multiple filter fields to narrow down results.

A single search bar that performs full-text search across key fields â€” SKU name, comment text, brand name, DC name â€” would speed up locating specific observations.

---

## Acceptance Criteria

### Scenario 1: Free-Text Search
- **Given** I am on the Market Overview list page
- **When** I type a keyword into the search bar and press Enter
- **Then** the list filters to records where the keyword matches any of:
  - SKU name / item code
  - Free-text Comment
  - Brand name
  - DC name
  - Retailer / Banner name
  - Store name
- **And** the search is debounced (e.g., 300ms) or triggered on Enter

### Scenario 2: Search Combined with Filters
- **Given** I have existing filter selections (date range, status, etc.)
- **When** I also enter a search term
- **Then** both filters and search term apply together (AND logic)
- **And** the search term appears in the URL/query parameters for shareability

### Scenario 3: Clear Search
- **Given** I have an active search term
- **When** I clear the search bar
- **Then** the list resets to the current filter state without the search constraint

---

## API Reference
- **Endpoint:** `GET .../MarketOverviews` (line 66) â€” currently filterable by IDs and flags
- **Extension:** Add a `SearchTerm` query parameter, server-side searches across relevant text fields

---

## Notes
- Server-side search is preferred for paginated results
- Consider adding search to the report view as well (`GET report` endpoint)
