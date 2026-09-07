# Promotional Management | Pin/Freeze Filter Options

**CS-1616** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user,  
**I want** to pin or freeze filter options on the Promotional Management page,  
**So that** I don't have to reselect the same filters (e.g., current year) every time I access the page.

---

## Description

The Promotional Management page has filter options (year, month, retailer, banner, etc.), but these reset to defaults each time the user navigates away or reloads the page. Since brokers often work within a single planning year, they must re-select "current year" every visit.

This story adds the ability to pin/freeze filter selections so they persist across sessions.

---

## Acceptance Criteria

### Scenario 1: Pin a Filter Value
- **Given** I have filter selections applied (e.g., Year = 2026)
- **When** I click a "Pin" or "Save" icon next to a filter
- **Then** that filter value is saved as my default preference
- **And** it auto-applies the next time I visit the page

### Scenario 2: Multiple Pinned Filters
- **Given** I have pinned the Year filter to 2026
- **When** I also pin the Month filter to a specific value
- **Then** both filters auto-apply on page load
- **And** I can unpin individually

### Scenario 3: Unpin / Reset
- **Given** I have active pinned filters
- **When** I click "Unpin" or "Reset to Defaults"
- **Then** the filters return to default state
- **And** pins are cleared

### Scenario 4: User-Specific Persistence
- **Given** User A has pinned Year = 2026
- **When** User B logs in on the same browser
- **Then** User B sees their own pinned filter preferences (not User A's)
- **And** preferences are stored per user (backend or localStorage tied to user ID)

---

## Design Notes

### Storage Options
- **Option A (Simple):** Browser localStorage — persisted per device, no backend changes needed
- **Option B (Recommended):** Backend user preference endpoint — persists across devices, user-specific

### Implementation
- Add a small pin icon (📌 or toggle) next to each filter field
- Active pinned filters show a filled pin; inactive show an outline
- Pinned state is sent in the API request as default query parameters

---

## Notes
- Also applicable to other broker pages (Category Review, Market Overview filters)
- If backend option, consider a generic `UserPreference` entity (key-value per user) for reuse
