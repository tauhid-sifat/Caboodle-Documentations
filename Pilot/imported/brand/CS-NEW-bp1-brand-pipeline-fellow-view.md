---
type: Document
module: brand
jira: [CS-1652]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/broker-dashboard.md
---

# Brand Modules | Pipeline | Rebuild as Fellow-style Plan/Task List (from wireframe)

**CS-1652** | New Requirement | User Story | Priority: Medium | Status: New

---

## User Story

**As a** Brand user,  
**I want** the Brand Pipeline to be a Fellow-style plan/task list (matching the Broker Dashboard wireframe) instead of the current CRM deal-stage board,  
**So that** I can track work items (plans and their tasks) with assignee, due date, priority, and status in a clear, consistent way.

---

## Description

Replace the existing **Brand Module Pipeline** (currently a CRM deal-stage board) with the same **Fellow-style plan/task list** implemented for the Broker Dashboard in **CS-1601** (`BD4-broker-dashboard-pipeline-task-board.md`). This makes the Brand and Broker pipelines consistent.

This is a **Fellow-style plan/task list** — **not** a Kanban board and **not** a CRM deal-stage pipeline.

Layout (reuse the Broker Dashboard wireframe, `Wireframe/index.html` `view-tasks` section — `tasks-layout`, `plan-sidebar`):
- A left **sidebar** (~320px) listing **Plans** (e.g., buyer-meeting plans, brand initiative plans). Selecting a plan shows its tasks in the main area.
- The main area renders the selected plan's **tasks as rows**, with a collapsible **"Done (n)"** section toggled by a "Show done / Hide done" control.
- Each task has: **title**, **status** (todo / in-progress / done), **priority** (high / med / low), **assignee**, **due date**, **notes**, and **files**.

This replaces the CRM Pipeline task board — no more deal stages, no brand/retailer association config. It is the Brand module's lightweight task tracker.

---

## Acceptance Criteria

### Scenario 1: Pipeline View Loads
- **Given** I open the Pipeline in the Brand module
- **Then** a plan sidebar and a task list render per the wireframe
- **And** the view is titled "Pipeline"

### Scenario 2: Plans and Tasks
- **Given** plans exist
- **When** I select a plan in the sidebar
- **Then** its tasks display as rows in the main area
- **And** each task shows title, status, priority, assignee, and due date

### Scenario 3: Task Status & Done Toggle
- **Given** a plan has tasks in various states
- **When** I toggle "Show done / Hide done"
- **Then** completed tasks are revealed or hidden accordingly
- **And** I can change a task's status (todo / in-progress / done)

### Scenario 4: Task Detail
- **Given** a task is selected
- **Then** I can view/edit notes and attached files
- **And** (with the assignment logic in CS-1594) I can set assignee

### Scenario 5: CRM Pipeline Replaced
- **Given** the new view is in place
- **Then** the former CRM deal-stage Pipeline is no longer shown
- **And** the module now contains only lightweight plan/task data

---

## Design Reference
- Wireframe: `Wireframe/index.html` (https://caboodle-broker-dashboard.vercel.app) — `view-tasks` section (Fellow-style list, `tasks-layout`, `plan-sidebar`)
- Broker-equivalent spec: `CS-1601-broker-dashboard-pipeline-task-board.md` (BD4)
- Assignment behavior: `CS-1594-brand-pipeline-assign-users.md` (BMP1)
- Email behavior: `CS-1595-brand-pipeline-email-on-update.md` (BMP2)

---

## Related
- **CS-1601** — the Broker Dashboard equivalent of this view (same pattern; this is the Brand-side application).
- **CS-1594 / CS-1595** — assignment and email controls that apply to the Brand Pipeline tasks.
- **CS-1535** — existing Pipeline plan search defect; confirm it's resolved/re-scoped by this rebuild.
- **CS-540** — Pipeline activity URL sharing; confirm behavior after the rebuild.

---

## Notes
- Keep MVP aligned to the wireframe; enhancements (assignee, time, filtering) mirror the Broker Pipeline's CS-1599 / CS-1600.
- Confirm whether "Plans" are user-created or map to existing entities (e.g., buyer-meeting plans).
- Confirm data migration: existing CRM Pipeline deals/tasks that must be preserved vs. starting fresh.
- Coordinate with CS-1594 (assign users) — the new view must persist a real assignment, not just an email recipient.
