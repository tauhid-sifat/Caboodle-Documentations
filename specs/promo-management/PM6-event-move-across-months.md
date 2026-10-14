---
module: promo-management
jira: [CS-1618]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/promo-management-status.md
---

# Promotional Management | Allow Event to Span/Move Across Months

**CS-1618** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user,  
**I want** promotional events that span multiple months to appear across the relevant months,  
**So that** the grid accurately reflects the full duration of multi-month events.

---

## Description

Currently, a promotional event is assigned to a single month column in the grid. If an event runs from January 15 to February 15, it only appears in January. The user cannot see it in February's column, and cannot move an event's dates across month boundaries.

This story allows events with date ranges spanning multiple months to appear in all relevant month columns, and allows dragging/resizing events across month boundaries.

---

## Acceptance Criteria

### Scenario 1: Multi-Month Display
- **Given** an event has a start date in January and end date in February
- **When** I view the promotional grid
- **Then** the event appears in both the January and February columns
- **And** a visual indicator shows it's a continuation (e.g., arrow, connector line, or truncated badge)

### Scenario 2: Drag Event Across Months (DISCUSS WITH CW — NOT SURE THAT WE WANT USER TO DRAG AND CHANGE DATES)
- **Given** I am on the grid view
- **When** I drag an event card from one month to another
- **Then** the event's date range updates to reflect the new month(s)
- **And** the change is persisted via API

### Scenario 3: Resize Event Duration (CW needs clarity on this)
- **Given** an event is displayed as a bar/card spanning its duration
- **When** I drag the edge of the event bar to extend or shorten it
- **Then** the start or end date updates accordingly
- **And** the event spans the correct months after resize

---

## Design Notes

### Backend
- No changes required if displaying by date range instead of month-assigned — the event already has `StartDate` and `EndDate`
- The drag/update operation calls the existing event update endpoint with new dates

### Frontend
- The grid needs to compare each event's date range against each month column to determine visibility
- Dragging between months updates the event's month assignment or dates

---

## Implementation Options (CW — I don't believe we need B & C — Just A)

| Option | Complexity | Description |
|--------|-----------|-------------|
| A | Low | Events with multi-month dates appear in all relevant months (read-only); no drag |
| B | Medium | Option A + drag between months to reassign |
| C | High | Full gantt-style resize and drag within/between months |

Recommend starting with Option A (multi-month display) and adding drag/resize in a follow-up. Per CW: only Option A is needed — no drag/resize (B & C).

---

## Notes
- Event dates are stored on `TradeSpendPromoEvent` as date range fields — display is a frontend concern
- Confirm with business: should multi-month events count toward totals in each month they appear?
