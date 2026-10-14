---
module: promo-management
jira: [CS-1711]
status: backlog
last_verified: 2026-10-14
related_wiki: ../../wiki/promo-management-status.md
---

# Broker Dashboard | Promotional Management | Revise UI to Match the Category Review Calendar

**CS-1711** | User Story | Priority: Medium | Status: Backlog
**Internal code:** PM9
**Reporter:** Constance Wolfe

---

## User Story

**As a** Broker user,
**I want** the Promotional Management grid to look and behave like the Category Review calendar,
**So that** the broker modules feel consistent and are faster to scan.

---

## Description

The Broker Promotional Management page currently renders as a year grid grouped by brand, distributor, banner, and category, with one column per month. The Category Review calendar uses the yearly planning grid introduced for category review: sticky left columns, 12 month columns, color-coded month badges, year navigation, and a consistent filter panel.

This ticket revises the Promotional Management UI to match the Category Review calendar, so the two modules share the same visual language and interaction pattern.

This is a UI and layout change. The underlying promotion data and events do not change.

**Scope**
- Align the grid structure: sticky left columns plus 12 month columns.
- Align the year navigation (chevrons and This Year).
- Align month cell and badge styling, including colors.
- Align the filter panel layout and behavior.
- Keep promo-specific content (event names, totals) inside the aligned cells.

**Out of scope**
- Changes to promotion data, statuses, submission, or calculations.

---

## Acceptance Criteria

### Scenario 1: Grid structure matches the Category Review calendar
- **Given** I open Promotional Management
- **Then** it uses the same grid structure as the Category Review calendar
- **And** the left columns stay sticky while scrolling months horizontally
- **And** there are 12 month columns

### Scenario 2: Year navigation
- **Given** I am viewing the grid
- **Then** I can move between years with chevrons
- **And** a This Year control returns me to the current year

### Scenario 3: Consistent cell and badge styling
- **Given** the grid renders promotion events
- **Then** cells and badges use the same styling and colors as the Category Review calendar
- **And** the layout does not break when a month contains many events

### Scenario 4: Consistent filter panel
- **Given** I open the filters
- **Then** the filter panel matches the Category Review calendar in layout and behavior
- **And** filtering updates the grid

### Scenario 5: Data preserved
- **Given** the UI has changed
- **Then** promotion events still appear in the correct months
- **And** multi-month events render across every month they span

### Scenario 6: Export and filters still work
- **Given** I export from Promotional Management
- **Then** the export still works and respects the active filters

### Scenario 7: Uniform month column widths
- **Given** the grid is displayed
- **Then** all 12 month columns are the same width, regardless of event count

---

## Design Notes
- Reuse the Category Review yearly grid component where practical, rather than rebuilding it.
- Reference the Category Review grid and rollup patterns for the calendar behavior.
- Frontend change only. No backend work expected.

---

## Open Questions
- Full restyle, or layout alignment only?
- Which calendar is the reference: the broker yearly planning grid or the rollup calendar?
- Should promo-specific columns and totals be kept as-is inside the new grid?
- Does this complement or supersede the uniform grid width ticket (PM5)?
- Does the multi-month event rendering decision (PM6, Option A) apply to this grid?

---

## Related Tickets
- **CS-1361** - Category Review yearly planning grid
- **CS-1296** - Category Review calendar rollup
- **PM5 / CS-1617** - Promotional Management uniform grid widths
- **PM6 / CS-1202** - multi-month event rendering
- **CS-1305** - Broker Dashboard
