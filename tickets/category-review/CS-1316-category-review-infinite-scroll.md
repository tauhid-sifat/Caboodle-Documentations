# Category Review | Replace Pagination with Infinite Scroll

**CS-1316** | User Story | Priority: High | Status: New  
**Reporter:** Constance Wolfe

---

## User Story

**As a** Broker user viewing the Category Review list,  
**I want** to scroll continuously through all records instead of clicking through pages,  
**So that** I can see the full picture at a glance without navigating page to page.

---

## Description

The Category Review list currently uses pagination, requiring users to click through multiple pages to see all records. Users find this cumbersome — they want a spreadsheet-like experience where they can scroll down and see everything.

Per the client meeting, this should work like the Distributor APL infinite scrolling implementation (`../broker-dashboard/CS-NEW-distributor-apl-infinite-scroll.md`): as the user scrolls down, more records load automatically. No page numbers, no next/previous buttons.

---

## Acceptance Criteria

### Scenario 1: Infinite Scroll
- **Given** I am viewing the Category Review list
- **Then** records load in batches as I scroll down
- **And** there is no pagination UI (no page numbers, no next/previous buttons)
- **And** a loading indicator appears when fetching the next batch

### Scenario 2: Scroll to Top
- **Given** I have scrolled deep into the list
- **When** I click a "Scroll to Top" button (floating)
- **Then** the page scrolls smoothly back to the top

### Scenario 3: Search/Filter Compatible
- **Given** I apply a search term or filter
- **Then** the infinite scroll resets and loads fresh results
- **And** only matching records are loaded on scroll

---

## Design Reference
- See Distributor APL infinite scroll pattern: `../broker-dashboard/CS-NEW-distributor-apl-infinite-scroll.md`
- The Lovable prototype (`YearlyPlanningTable.tsx`) uses native CSS overflow scrolling (`overflow-auto`, `min-w-[1000px]`) — this is the desired UX pattern

## Notes
- Maintain existing server-side filtering and sorting
- Consider a "total records" count at the top so users know the scope

---

## CW Decision 7/20/26 — Infinite Scroll Preferred

Client has reviewed both CS-1316 (Infinite Scroll) and CR3 (Page Size Selector). **Infinite scroll is preferred.** CR3 (`CS-NEW-category-review-page-size.md`) is superseded by this ticket. Do not implement pagination UX changes — replace with infinite scroll only.
