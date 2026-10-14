---
module: broker-dashboard
jira: [CS-1424]
status: backlog
last_verified: 2026-10-14
related_wiki: ../../wiki/broker-dashboard.md
---

# Data Mapping | Broker Dashboard APL | Need Data Sync for Broker Distributor APL

**CS-1424** | User Story | Priority: Highest | Status: Backlog  
**Assignee:** Md Mashiul Azam Chowdhury Efti | **Reporter:** Constance Wolfe

---

## User Story

**As a** Broker user or Admin,  
**I want** automated data sync for the Distributor APL on the Broker Dashboard, similar to the existing sync for the Distributor Report,  
**So that** APL pricing and product data stays current without manual re-uploads.

---

## Overview

The Distributor Report has an automated data sync that crawls distributor portals, downloads CSV files, parses them, and splits records into mapped/unmapped for entity resolution (backed by `DataSyncJobService` + `DataSyncRun` in the DataHub module).

The Distributor APL (`Broker.DistributorAPLs`) currently only supports manual import/upsert (`POST Brokers/apl*`). This ticket extends the same automated sync pipeline to keep Distributor APL data in sync.

---

## Acceptance Criteria

### Scenario 1: APL Data Sync Trigger
- **Given** I am an Admin on the Data Mapping page
- **When** I configure and trigger a data sync for Distributor APL
- **Then** the sync creates a `DataSyncRun` with status tracking
- **And** the background job (`DataSyncJobService` or equivalent) crawls the configured distributor portal, downloads the APL file, and parses it

### Scenario 2: Mapped vs Unmapped APL Records
- **Given** a sync run has completed
- **When** the parsed APL data contains records that can be matched to existing products/UPCs
- **Then** matched records are upserted into the `DistributorAPL` table (DC, item code, UPC, wholesale costs)
- **And** unmatched records enter the unmapped queue for entity resolution, following the same flow as Distributor Report unmapped records

### Scenario 3: Broker Dashboard Visibility
- **Given** APL data has been synced
- **When** a Broker user views the Distributor APL section on the Broker Dashboard
- **Then** they see the up-to-date APL records with current wholesale costs
- **And** the data reflects the latest sync, not stale manually-uploaded data

### Scenario 4: Sync Status & Error Handling
- **Given** a sync run has completed (successfully or with errors)
- **When** I view the sync run status
- **Then** I see the run status (Success, Failed, Partial), record counts, and any error details
- **And** failures (unreachable portal, auth failure, parse errors) return clear messages without exposing credentials

---

## Out of Scope
- Manual APL import/upsert (existing flow unchanged)
- Real-time two-way sync (pull-only from distributor portal)
- Brand-side APL sync (broker dashboard only)

---

## CW Edit 7/20/26 — Distributor Reports Required

The following distributor reports are needed for this sync function:

| Distributor | Report Name |
|-------------|-------------|
| **KeHE** | Brand Item Location |
| **UNFI** | Inventory Details |

---

## Design Reference
- **Existing pattern:** `DataSyncJobService` in `caboodle/src/Modules/DataHub/` handles automated distributor sync for the Distributor Report. CS-1424 applies the same pipeline to `Broker.DistributorAPLs`.
- **Existing endpoints:** `POST|GET|DELETE Brokers/apl*` in `BrokersController.cs`

---

## Related Tickets
- **CS-1387** — Admin Data Sync Not Working / Not Populating Distributor Report (bug — existing sync infrastructure)
- **CS-1403** — Broker Dashboard APL Upload Adjust for UNFI UPC Codes
- **CS-1363** — Broker Dashboard APL Add Distributor & Product to Filter

---

## Notes
- Reuse `DataSyncJobService` where possible; extend it to handle APL source files if the format differs from Distributor Report sources.
- APL sync should respect the same credential management (`ThirdPartyCredential`) used by Distributor Report sync.
- No credentials or connection strings should appear in logs or API responses.
