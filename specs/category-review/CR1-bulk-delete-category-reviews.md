---
module: category-review
jira: [CS-1605]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/category-review.md
---

# Category Review | Remove All Reviews at Once Rather Than Page by Page

**CS-1605** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user managing Category Reviews,  
**I want** to select and delete multiple reviews across all pages at once, rather than deleting page by page,  
**So that** I can clean up large sets of reviews efficiently.

---

## Description

The Category Review list is paginated, and the current delete flow only allows removing reviews one at a time or per-page. Users need the ability to select reviews across all pages and perform a single bulk delete action.

---

## Acceptance Criteria

### Scenario 1: Select Reviews Across Pages
- **Given** I am viewing the Category Review list with multiple pages of results
- **When** I select reviews on page 1, then navigate to page 2 and select more
- **Then** all selected reviews across both pages are tracked
- **And** a selection counter shows the total number of selected items

### Scenario 2: Select All Across All Pages
- **Given** the Category Review list spans multiple pages
- **When** I check the "Select All" checkbox in the table header
- **Then** a prompt appears: "Select all X reviews across all pages?" with options to select just the current page or all pages
- **And** selecting "all pages" selects every review matching the current filter

### Scenario 3: Bulk Delete
- **Given** I have selected one or more reviews (across pages)
- **When** I click "Delete" / "Remove Selected"
- **Then** a confirmation dialog shows the number of reviews to be deleted
- **And** upon confirmation, all selected reviews are deleted via a bulk delete endpoint
- **And** the list refreshes showing the remaining reviews

### Scenario 4: Backend Bulk Delete
- **Given** a bulk delete request with a list of review IDs
- **When** the backend receives the request
- **Then** all matching reviews are soft-deleted (set `Deleted = true`)
- **And** any associated calendar entries (`CategoryReviewCalender`) are also removed
- **And** reviews that don't exist or are already deleted are silently skipped (no error for already-deleted IDs)

---

## Design Reference
- **Existing delete endpoint:** `DELETE Brokers/category-reviews` (single review delete, line 827 in `BrokersController.cs`)
- **Proposed new endpoint:** `POST Brokers/category-reviews/bulk-delete` or `DELETE Brokers/category-reviews` accepting a list of IDs

---

## Out of Scope
- Changing the existing single-delete behavior
- Bulk edit of reviews (this ticket is delete-only)

---

## Notes
- The current `DELETE Brokers/category-reviews` endpoint has no permission attribute â€” the new bulk endpoint should apply the same auth treatment (or add `[MustHavePermission]` if the existing one is being fixed).
- Consider whether the bulk delete should also handle calendar propagation (removing the review from brand calendars when deleted).
- Selection state should persist client-side across pages (not reset on navigation).
