# CS-1543: User-Level Data Isolation, Filter Persistence, and Task Roll-Up

**Status:** To Do | **Priority:** High | **Reporter:** Ms. Constance Wolfe | **Created:** August 17, 2026

---

## User Story

**As a** Broker user,  
**I want** my data and workflow personalized to me — with saved filter preferences, visibility restricted to my own tasks/data, and a consolidated view of all my work across brands — **so that** I can work efficiently without repetitive setup, data clutter, or navigating between modules.

---

## Background

This ticket implements three related user-centric improvements discussed on August 4th. The organizational concept (requirement #3 from that discussion) is **already covered by CS-1461** (confirmed via Jira API access).

---

## Feature Scope

| # | Requirement | Coverage |
|---|-------------|----------|
| 1 | User-specific saved filters (system-wide) | **NEW** — expands CS-1616 to all modules |
| 2 | User-specific data/task visibility | **NEW** — enforce access control |
| 3 | Organizational model for brokers | **COVERED by CS-1461** |
| 4 | Master task roll-up in Broker Dashboard | **NEW** |

---

## Acceptance Criteria

### Scenario 1: Persistent User Filters

- **Given** I am on any filtered view (Market Overview, Category Review, PM, Distributor APL, etc.)
- **When** I adjust filters (e.g., Retailer = Costco, Year = 2026) and click "Save as Default"
- **Then** my filter selections are saved as my personal default for that module
- **And** when I revisit that module, my saved filters auto-apply
- **And** my saved filters persist across devices (server-side storage)
- **And** I can clear or reset my saved preferences per module or globally

### Scenario 2: User-Specific Data Visibility

- **Given** I am a Broker user assigned to specific brands via the Organization structure
- **When** I access any data listing (Market Overview, Category Review, Promotional Management, etc.)
- **Then** I only see data/records associated with my assigned brands
- **And** I cannot see data from brands I don't represent (even if I know IDs or try direct access)
- **And** an Admin can configure visibility scopes (e.g., allow brokers to see all Organization members' tasks)
- **And** all 16+ ungated controllers receive proper `[MustHavePermission]` attributes for data access control

### Scenario 3: Master Task Roll-Up

- **Given** I am a Broker user on the Broker Dashboard landing page
- **When** the dashboard loads
- **Then** a "Task Roll-Up" section appears below KPI cards
- **And** it displays all pending work items from my assigned brands
- **And** items are grouped by brand with collapsible sections and counts
- **And** each item shows its source module via icon/color
- **And** each item shows a status badge (Pending Review, Overdue, Submitted, Action Required)
- **And** clicking an item navigates me to the specific record (deep link)
- **And** I can filter by source module via tabs (All | Market Overview | Category Review | Promo Management)
- **And** when I have no pending tasks, an empty state message displays

---

## Data Sources for Task Roll-Up

| Source | What Qualifies | Status Logic |
|--------|----------------|--------------|
| **Market Overview** | Observations assigned to me, status Pending/In Progress | SkuStatus-derived |
| **Category Review** | Reviews assigned to me, status not Complete/Approved | Brand report status |
| **Promotional Management** | Promotions I submitted (IsSubmitted=true), not yet approved | Status = Pending |

---

## Design Notes

- **Persistence:** Filter preferences stored server-side via `UserPreference` table (`key`, `userId`, `module`, `value`)
- **Access Control:** Data visibility enforced at API/query level, not UI-only
- **Roll-Up:** Read-only aggregation — surfaces existing tasks, does not create new ones
- **Dependencies:** Requires CS-1461 (Organization model) for brand assignment scoping
- **UI/UX:** Use existing Caboodle patterns (shadcn/ui, Tailwind, React Query)
- **Storage:** Server-side preferred over localStorage for cross-device persistence

---

## Related Tickets

- **CS-1461** — Organization concept and implementation (covers org model)
- **CS-NEW-broker-dashboard-task-board.md** — Personal Kanban task board (separate feature)
- **CS-NEW-pm4-pin-filter-options.md** — Existing promo filter pinning (expands to system-wide)

---

## Out of Scope

- Creating new task types (this surfaces existing work items)
- Manual task creation/editing (covered by task board ticket)
- Organization creation/invitation flows (CS-1461 subtasks)
- Brand/module-specific filter logic (uses existing endpoints)

---

## Note

The three features are interdependent: filters and access control both need user/org context, and the task roll-up depends on both. Implementation should follow a "defense in depth" approach: UI hints + API enforcement + data filtering.