---
type: spec
title: Admin generic corrupt-data report
module: admin
status: draft
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
jira: []
---

# Admin | Uploads | Generic Corrupt-Data Report

**CS-NEW** | New Requirement | Priority: TBD | Status: Draft

---

## User Story

**As an** Admin user handling data uploads,
**I want** a generic corrupt-data report covering all upload sections,
**So that** upload failures are visible and actionable in one consistent way instead of per-section fixes.

---

## Description

Upload-failure reporting needs a generic corrupt-data report for all upload sections, not a category-view-specific fix (D-0720-1, CLARIFIED 2026-07-20).

Trigger: an upload completes with failed/skipped records. The report summarizes what failed and provides the failed-record rows for download, generalizing the existing per-upload pattern of a failed-records report attached to the upload (cf. CS-1403 line 74: "failed records report attached to this ticket in Jira" for the APL UNFI upload).

How it differs from per-section handling: today failure detail (if any) is section-specific (e.g. the CS-1403 APL attachment). This ticket asks for one shared report shape applied across every upload section (CRM Data Upload sections, APL, Distributor Report, etc.), so any section's failures produce counts plus downloadable failed rows in the same format.

Visibility: TBD — the notes do not say who sees the report (uploader only vs all Admins) or where it surfaces (upload dialog, section history, email). Marked OPEN below.

---

## Acceptance Criteria

### Scenario 1: Report generated on upload with failures
- **Given** an upload in any upload section
- **When** the upload completes with one or more failed/skipped records
- **Then** a corrupt-data report is produced for that upload run

### Scenario 2: Report content — counts plus failed rows
- **Given** an upload run with failures
- **When** the user views the report
- **Then** the report shows failure counts and offers the failed-record rows for download (generalizing the CS-1403 failed-records attachment pattern)

### Scenario 3: Generic across all sections
- **Given** uploads in different sections (e.g. CRM Data Upload sections, APL)
- **When** each completes with failures
- **Then** each produces the same generic report shape — no section-specific format

### Scenario 4: Clean uploads produce no report
- **Given** an upload with zero failures
- **When** it completes
- **Then** no corrupt-data report is produced

---

## Open Questions (notes are silent — TBD, do not assume)
- Who sees the report: uploader only, or all Admin users? Where does it surface (upload dialog, per-section history page, email notification)?
- Report format: downloadable file type (CSV?), on-screen table, or both? Retention: how long is a report kept?
- Does the report include per-row failure reasons, or only the failed rows? (Notes say only "corrupt-data report".)
- Exact section list: which upload entry points count as "all upload sections"?

---

## Jira Reference
- No Jira key mentioned in the 2026-07-20 ticket-call notes. Workstream: DataUpload exception reporting.
- Related: **CS-1403** (APL Upload UNFI UPC adjustment — existing per-upload failed-records attachment this ticket generalizes).
