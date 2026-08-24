# Admin | CRM Data Upload | Filter Audit - Filter by Any Column

**ACDU1** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As an** Admin user working in CRM Data Upload,
**I want** to audit and standardize filtering so users can filter by **any column** across all CRM Data Upload sections,
**So that** every CRM data table has consistent, complete filtering.

---

## Description

Perform a **filter audit** across all CRM Data Upload screens (Retailers, Banners, Stores, Regions, Categories, Price Lists, Banner SKU, etc.). Ensure each table supports filtering by any column, and that filtering behavior is consistent and reusable (not built per-screen). This consolidates the broader CRM Data Upload improvement effort.

---

## Acceptance Criteria

### Scenario 1: Filter by Any Column
- **Given** any CRM Data Upload section with a data table
- **When** the user opens the filter controls
- **Then** they can filter by any column in that table

### Scenario 2: Consistent Experience
- **Given** multiple CRM Data Upload sections
- **When** the user filters/exports
- **Then** the filter and export behavior is consistent across sections (same UX, same data scope)

### Scenario 3: Filter Matches Export
- **Given** a filter is applied
- **When** the user exports
- **Then** the exported data matches the filtered view (no mismatch)

---

## Jira Reference (data/jira-tickets)
- **CS-11** - [BE] Global Admin CRM DATA UPLOAD Banner needs Filter/Search function (original filter request).
- **CS-1442** - CRM Data Upload Improvement: 'Filtering should be available on all applicable CRM data tables' (direct overlap).
- **CS-1443 / CS-1444 / CS-1445** - CRM Data Upload Improvements (BE/FE/Sections) - filtering + consistent upload/export.
- **CS-1475** - Sync CRM Data Upload Section Filters with Export Data.
- **CS-495** - Filtered export data mismatch (bug this audit should resolve).

---

## Related
- **AAC2** - Admin controls for dropdown options (complementary filtering/config control).

---

## Notes
- ACDU1 may be the umbrella/audit ticket for the CS-1442-1445 improvement epic; reconcile scope to avoid duplicate implementation tickets.
- Confirm which columns are currently non-filterable per section.
