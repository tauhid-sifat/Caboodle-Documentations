# Broker Dashboard | Assign Time and Person (Dashboard)

**BD2** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user managing dashboard tasks,  
**I want** to assign a person and a time to each task on the dashboard,  
**So that** I know who owns a task and when it is due/scheduled.

---

## Description

Extends the broker dashboard **Pipeline/Task view** (Fellow-style list, see BD4) with two assignment fields per task:
- **Person** — the broker/user the task is assigned to (e.g., from the brokerage's user list).
- **Time** — a due date / scheduled time for the task.

This makes the task list actionable for a team rather than just a personal checklist. The assigned person and time should be visible on the task row and editable from the task detail panel.

---

## Acceptance Criteria

### Scenario 1: Assign a Person
- **Given** I am creating or editing a task
- **When** I open the assignee field
- **Then** I can pick a person from the brokerage's user list
- **And** the selected person's name displays on the task row

### Scenario 2: Assign a Time
- **Given** I am creating or editing a task
- **When** I set a time (due date / scheduled time)
- **Then** the time displays on the task row
- **And** overdue items are visually distinguished (e.g., highlighted)

### Scenario 3: Unassigned State
- **Given** a task has no assignee or no time
- **Then** the row shows a neutral "Unassigned" / "No date" indicator
- **And** the task still appears in the list

### Scenario 4: Filter by Assignee (link to BD3)
- **Given** tasks have assignees
- **When** I filter by "My tasks" or a contact name (see BD3)
- **Then** only matching tasks are shown

---

## Design Reference
- Pipeline/Task view: `BD4-broker-dashboard-pipeline-task-board.md`
- Dashboard shell: `BD1-broker-dashboard-from-wireframe.md`

---

## Related
- **BD4** — the base Pipeline/Task list this enhances. BD2 adds the `AssignedTo` and `DueTime` fields to that entity.
- **BD3** — filtering by assignee / contact name.

---

## Notes
- Confirm the source of the "person" list (brokerage users only, or include brand contacts?).
- Keep the MVP simple: a single assignee and a single datetime, not recurring/scheduling complexity.
