# Distributor APL | Infinite Scrolling

**CS-1602** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user viewing the Distributor APL,  
**I want** to scroll continuously through the list rather than clicking through paginated pages,  
**So that** I can browse all APL records smoothly without losing my place.

---

## Acceptance Criteria

### Scenario 1: Infinite Scroll Loading
- **Given** I am viewing the Distributor APL list
- **When** I scroll to the bottom of the loaded rows
- **Then** the next batch of rows loads automatically
- **And** a loading indicator (spinner/skeleton) appears at the bottom while fetching
- **And** there is no interruption to my scroll position

### Scenario 2: Search & Filter Compatibility
- **Given** I have applied a search query or filter
- **When** I scroll to the bottom
- **Then** infinite scroll loads only records matching the active filter
- **And** changing the filter resets the scroll and loads fresh results

### Scenario 3: End of List
- **Given** all matching records have been loaded
- **When** I scroll to the bottom
- **Then** a "No more records" message appears
- **And** no further API calls are made

### Scenario 4: Backend Support
- **Given** the frontend requests the next page of APL records
- **When** it sends a cursor or offset parameter
- **Then** the backend returns the next batch with a flag indicating whether more records exist
- **And** the existing list/filter endpoints are extended to support cursor-based or offset pagination

---

## Out of Scope
- Changing the existing CRUD operations (upsert, delete, export)
- Infinite scroll for other modules (Category Review retains pagination)

---

## Notes
- Existing endpoint: `GET Brokers/apl*` (list distributor APL)
- If the current endpoint uses offset-based pagination (page number + page size), switch to cursor-based for infinite scroll, or keep offset with a `hasMore` flag.
- Reference the platform's existing infinite scroll implementation if any other module already uses it.
