# Admin | Store Report | Eliminate / Merge Store Duplicates

**CS-1593** | New Requirement | User Story | Priority: TBD | Status: New → **Resolved / Awaiting Live Push** (per Bijoy 8/24) | https://caboodleservices.atlassian.net/browse/CS-1593

> **Status update 2026-08-24 (Bijoy, ticket call) + synced 2026-09-07:** Bijoy reported this has been **resolved and pushing to live soon**. Live Jira status still shows `Backlog` as of fetch — treat as **status lag**; directory reflects resolved/pending deploy.

---

## User Story

**As an** Admin user,
**I want** to eliminate or merge duplicate stores in the Store Report (and underlying store data),
**So that** store listings are clean, de-duplicated, and correctly mapped.

---

## Description

Store data contains duplicates (due to naming inconsistencies) and some stores are incorrectly mapped to multiple banners/retailers. Need a way to **eliminate/merge** duplicate stores and enforce clean mapping, without losing historical data tied to those stores.

This is a direct match to Jira **CS-1419** (Admin CRM Data Upload Stores | Remove Duplicates & Resolve Multi-Mapping) - CS-1593 is the working ticket for that effort, extended to the Store Report surface.

---

## Acceptance Criteria

### Scenario 1: Identify & Merge Duplicates
- **Given** duplicate store entries (by name/address/geo)
- **When** the dedupe process runs
- **Then** duplicates are merged into a single store record
- **And** historical data tied to the merged stores is preserved

### Scenario 2: Enforce 1:1 Mapping Where Applicable
- **Given** stores improperly mapped to multiple banners/retailers
- **When** resolved
- **Then** a 1:1 mapping rule is enforced where applicable
- **And** multi-mapping is corrected without data loss

### Scenario 3: Store Report Reflects Clean Data
- **Given** the cleanup is complete
- **When** the Admin opens the Store Report
- **Then** duplicates no longer appear

---

## Jira Reference (data/jira-tickets)
- **CS-1419** - Admin CRM Data Upload Stores | Remove Duplicates & Resolve Multi-Mapping - EXACT match (dedupe script, 1:1 mapping, preserve history).
- **CS-1502** - Investigate root cause of duplicate store creation (prevention).
- **CS-1308 / CS-1309 / CS-1364 / CS-1342** - CRM Data Upload Stores edit/delete/upload issues (related store-data hygiene).
- **CS-1418** - CRM Data Upload Stores: missing State field (store data quality).

---

## Related
- **CS-1597** - Retailer CRM store-level listing from Banner Page (depends on clean store data).
- **AGENTS.md - Store module** - orphan domain; store dedupe supports making store data usable.

---

## Notes
- Coordinate with CS-1419's cleanup script; CS-1593 may be the Store-Report-facing view of the same work.
- Define 'duplicate' matching rules (name, address, geo lat/long).
- **2026-08-24 — Bijoy update:** Dedup/merge fix complete in staging; pushing to live soon. Verify on live that Store Report no longer shows duplicates and that historical data/mapping preservation holds; close ticket after live verification.
- **2026-09-07 — Sync note:** Live Jira still `Backlog`/`Medium` (updated 2026-08-25) — no Jira status transition yet. Next action: update Jira to `In Staging` → `In Production`/`Closed` after deploy and add deployment note.
