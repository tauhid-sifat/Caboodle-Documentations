---
type: Document
module: broker-dashboard
jira: [CS-1600]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/broker-dashboard.md
---

# Broker Dashboard | Dashboard Filter — My Tasks or Contact Name

**CS-1600** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user on the Pipeline/Task view,  
**I want** to filter tasks by "My tasks" or by a contact/person name,  
**So that** I can focus on what's assigned to me or to a specific person without scanning everything.

---

## Description

Add a filter control to the broker dashboard **Pipeline/Task view** that lets the user narrow the visible tasks by owner:
- **"My tasks"** — show only tasks assigned to the current user.
- **Contact name** — show only tasks assigned to a selected person (from the brokerage user list).

The filter applies across the task list (regardless of status: todo / in-progress / done) and is independent of any search term. This pairs with CS-1599 (assigning a person to a task).

---

## Acceptance Criteria

### Scenario 1: Filter by "My Tasks"
- **Given** tasks are assigned to various people
- **When** I select the "My tasks" filter
- **Then** only tasks assigned to me are shown in the list
- **And** tasks assigned to others are hidden

### Scenario 2: Filter by Contact Name
- **Given** I can pick a contact from a list
- **When** I select a specific contact name
- **Then** only tasks assigned to that contact are shown

### Scenario 3: Clear Filter
- **Given** a filter is active
- **When** I clear it (or select "All")
- **Then** all tasks are shown again in the list

### Scenario 4: Combined with Search
- **Given** a person filter is active
- **When** I also type a search term
- **Then** the filter and search both apply (intersection)

---

## Design Reference
- Pipeline/Task view: `CS-1601-broker-dashboard-pipeline-task-board.md`
- Assignment fields: `CS-1599-broker-dashboard-assign-time-person.md`
- Dashboard shell: `CS-1598-broker-dashboard-from-wireframe.md`

---

## Related
- **CS-1599** — required for the assignee values this filter operates on.
- **CS-1601** — the base Pipeline/Task list.

---

## Notes
- Determine default state: show "All" or "My tasks" on first load (recommend "All" to avoid hiding shared work).
- Filter state should persist for the session.
