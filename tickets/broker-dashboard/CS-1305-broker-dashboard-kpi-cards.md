# Broker Dashboard | Create Dashboard with KPI Cards & Calendar Views

**CS-1305** | User Story | Priority: High | Status: New  
**Reporter:** Constance Wolfe

---

## User Story

**As a** Broker user,  
**I want** a rich broker dashboard with KPI cards, calendar summaries, and quick-action tiles,  
**So that** I can see key metrics and upcoming events at a glance when I log in.

---

## Description

Per client clarification, CS-1305 is re-scoped. Instead of a minor UI polish (matching brand environment styles), the broker dashboard needs a full redesign into a KPI-driven landing page.

The current broker dashboard is a plain tile grid. The desired state includes:
- **KPI cards** — e.g., store count (adjusted for UNFI Independents issue — see CS-1611), category reviews due this month, active promotions
- **Calendar summaries** — upcoming Category Review milestones and Promotional events visible on the dashboard
- **Pipeline/Task board** — simple To Do / In Progress / Done board (see task board deliverable)
- **Quick-action tiles** — existing navigation to Market Overview, Category Review, Distributor APL, etc.
- **Broker logo/branding** — broker logo in the header area (see CS-1072)

---

## Acceptance Criteria

### Scenario 1: KPI Cards
- **Given** I land on the broker dashboard
- **Then** I see KPI cards showing:
  - Number of stores I'm in (with accurate count — see CS-1611)
  - Category Reviews due this month
  - Active/pending promotional events
  - Total brands represented
- **And** each KPI card is clickable, linking to the relevant section

### Scenario 2: Calendar Summary
- **Given** I am on the dashboard
- **Then** I see a compact calendar or list showing:
  - Upcoming Category Review deadlines (next 30 days)
  - Active promotional events for the current month
- **And** clicking an event navigates to the detail view

### Scenario 3: Navigation Tiles
- **Given** I am on the dashboard
- **Then** the existing tile grid navigation remains accessible
- **And** tiles are visually updated to match the new dashboard design

### Scenario 4: Broker Branding
- **Given** I am on the dashboard
- **Then** the broker logo is displayed in the header/hero area (see CS-1072)

---

## Notes
- Per the meeting, the client suggested deleting the old CS-1305 and creating this as a new scope
- Coordinate with: CS-1072 (logo), task board deliverable, CS-1611 (store count fix)
- The client mentioned a sample dashboard from Bijoy with Category Review + pipeline integration — reference that for layout ideas
