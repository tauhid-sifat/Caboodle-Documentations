# Broker Dashboard | Add Task Board (Simple Kanban) Tile

**New Requirement** | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user,  
**I want** a simple task board on the broker dashboard,  
**So that** I can track to-do items, in-progress work, and completed tasks in one place.

---

## Description

A lightweight Kanban-style task board with three columns: **To Do**, **In Progress**, **Done**. Each task has a title and optional notes. No retailer/banner/promo associations — just a personal or team task tracker accessible from a tile on the broker dashboard landing page.

---

## Acceptance Criteria

### Scenario 1: Task Board Tile
- **Given** I am on the broker dashboard landing page
- **When** I view the tile grid
- **Then** a "Tasks" tile is present
- **And** clicking it navigates to the task board view

### Scenario 2: Three-Column Board
- **Given** I am on the task board
- **Then** I see three columns: **To Do**, **In Progress**, **Done**
- **And** tasks are displayed as cards within their column
- **And** I can drag a card between columns to update its status

### Scenario 3: Create a Task
- **Given** I am on the task board
- **When** I click "Add Task"
- **Then** I can enter a title (required) and optional notes
- **And** the task appears in the **To Do** column

### Scenario 4: Edit / View Task Details
- **Given** a task card exists
- **When** I click it
- **Then** a detail panel opens showing the title, notes, and created date
- **And** I can edit the title and notes inline

### Scenario 5: Delete a Task
- **Given** I am viewing a task detail
- **When** I click "Delete"
- **Then** the task is removed from the board

---

## Design Notes

### Scope
- Simple entity: `TaskID`, `Title`, `Notes`, `Status` (Todo / InProgress / Done), `CreatedBy`, `CreatedOn`
- No brand/retailer/banner associations
- Tasks are user-scoped (each broker sees their own tasks) or optionally team-visible within a brokerage

### Backend
- New entity and endpoints in the Broker module (or shared)
- CRUD operations: list, create, update (status + content), delete
- No complex pipeline stage system — just three hard-coded statuses

### Frontend
- New tile on the broker dashboard (alongside Market Overview, Category Review, etc.)
- Kanban board view using simple drag-and-drop between columns
- Mobile-responsive (stack columns vertically on small screens)

---

## Notes
- This is intentionally **not** the CRM Pipeline — no deal stages, no brand context, no retailer links
- Could be extended later with assignments, due dates, or team views — keep MVP simple
- Confirm: per-user tasks or shared across the brokerage company?
