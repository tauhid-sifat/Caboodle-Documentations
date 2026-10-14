---
type: Document
module: broker-dashboard
jira: [CS-1598]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/broker-dashboard.md
---

# Broker Dashboard | Dashboard (from wireframe)

**CS-1598** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user,  
**I want** the broker dashboard to match the approved wireframe layout,  
**So that** I get a consistent landing experience with quick actions, KPIs, and a timeline in one view.

---

## Description

Build (or finalize) the broker dashboard to match the deployed wireframe (`Wireframe/index.html`, live at https://caboodle-broker-dashboard.vercel.app). The dashboard layout, top to bottom, is:

1. **Header** — Caboodle logo, nav (Dashboard, Management ▾, Strategy ▾, Files icon), brand selector.
2. **Quick Actions** — 6 tiles: Market Overview, Category Review, Distributor APL, Promotional Management, File, and **Tasks** (which opens the Pipeline/Task view — see CS-1601).
3. **KPI Row** — 4 compact horizontal cards: Stores In, Reviews Due, Active Promos, Brands Represented (each with icon + value/label + trend + "View" link).
4. **Timeline panel** — a single panel titled **"Timeline — Next 14 Days"** showing a unified feed of Category Review deadlines, Promo events, and Tasks, grouped by day (Today, Tomorrow, …). Filter pills switch the window (7d / 14d / 30d) and toggle visibility of Cat Review / Promo / Tasks. Each timeline item links out to its source view (Category Review, Promo Calendar, or the Pipeline/Tasks view).

Note: the wireframe does **not** contain a Kanban / task board on the dashboard. Tasks live in the separate Pipeline/Task view (CS-1601), reached via the **Tasks** quick-action tile; the dashboard only surfaces task items inside the Timeline feed.

This ticket is the container/umbrella for the dashboard shell and composition. Specific sub-features (KPI cards, the Pipeline/Task view, filters, assignments) are tracked in their own tickets (see Related).

---

## Acceptance Criteria

### Scenario 1: Dashboard Shell Loads
- **Given** I log in as a Broker (or Sub-Broker)
- **When** I land on the dashboard
- **Then** the header, quick-action tiles, KPI row, and Timeline panel all render per the wireframe
- **And** the brand selector reflects my currently active brand

### Scenario 2: Quick Actions Navigate
- **Given** I see the quick-action tiles
- **When** I click a tile
- **Then** I am taken to the corresponding module/feature (Tasks tile opens the Pipeline/Task view)

### Scenario 3: KPI Row
- **Given** the KPI row is visible
- **When** data is available
- **Then** the 4 KPI cards show current values with trend and a "View" link
- **And** empty/zero states are handled gracefully

### Scenario 4: Timeline Panel
- **Given** I view the lower section of the dashboard
- **Then** a single Timeline panel ("Next 14 Days") renders with day-grouped items (Category Review, Promo, Task)
- **And** the 7d/14d/30d and Cat Review / Promo / Tasks filter pills work
- **And** clicking a timeline item navigates to its source view

---

## Design Reference
- Wireframe: `Wireframe/index.html` (https://caboodle-broker-dashboard.vercel.app) — `view-dashboard` section
- KPI cards spec: `CS-1305-broker-dashboard-kpi-cards.md`
- Pipeline/Task view: `CS-1601-broker-dashboard-pipeline-task-board.md`

---

## Related
- **CS-1305** — original broker dashboard KPI/calendar ticket (this CS-1598 expands scope to the full wireframe shell).
- **CS-1601** — the separate Pipeline/Task view (Fellow-style list, not a Kanban).
- **CS-1599 / CS-1600** — task-level enhancements (assign time/person, filter) that apply to the Pipeline/Task view.

---

## Notes
- Dark mode toggle was removed from the final wireframe — do not implement.
- Quick Actions sit *under* the header (above the KPI row) per the wireframe.
- The former `CS-NEW-broker-dashboard-task-board.md` (3-column Kanban) has been **removed** as obsolete — it contradicted the wireframe (no Kanban) and is superseded by CS-1601.
