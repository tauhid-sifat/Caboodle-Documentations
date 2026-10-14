# Category Review | Allow User to Increase Rows Per Page

**New Requirement** | User Story | Priority: TBD | Status: **Superseded by CS-1316**

**CW Decision 7/20/26:** Client prefers infinite scroll (CS-1316) over page size selector. This ticket is superseded. Do not implement.

---

## User Story

**As a** Broker user viewing Category Reviews,  
**I want** to control how many rows are displayed per page,  
**So that** I can see more reviews at once and reduce the need to navigate between pages.

---

## Acceptance Criteria

### Scenario 1: Page Size Selector
- **Given** I am viewing the paginated Category Review list
- **When** I look at the bottom of the table
- **Then** I see a page size selector (e.g., "Rows per page: 10 ▼") alongside the pagination controls
- **And** the available options include at least: 10, 25, 50, 100

### Scenario 2: Change Page Size
- **Given** the page size selector is visible
- **When** I select a new page size (e.g., 50)
- **Then** the table refreshes to show that many rows per page
- **And** pagination controls update accordingly (fewer pages)
- **And** the current page resets to page 1

### Scenario 3: Preference Persistence
- **Given** I have changed the page size
- **When** I navigate away and return to the Category Review page
- **Then** my selected page size is remembered for the session (or persisted)

---

## Out of Scope
- Changing row density / compact view
- Infinite scroll

---

## Notes
- Common pattern used elsewhere in the platform (reference existing pagination components for consistency).
- Default remains 10 rows per page (or whatever the current default is).
