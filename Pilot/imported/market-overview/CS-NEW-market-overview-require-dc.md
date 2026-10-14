---
type: Document
module: market-overview
jira: [MO7]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Market Overview | Require Distribution Center on Log Entry

**MO7** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user logging a Market Overview observation,  
**I want** the Distribution Center (DC) field to be required when creating a log entry,  
**So that** every observation is tied to a specific distribution center for accurate supply chain tracking.

---

## Description

The Market Overview record currently has `DCID` as an optional field. However, distribution center context is critical for understanding which DC services the observed store/banner. Without a required DC, records may be created without a clear supply chain link, reducing the value of the data for reporting and CRM sync.

This story evaluates and implements making `DCID` mandatory on Market Overview creation.

---

## Acceptance Criteria

### Scenario 1: DC Required on Create
- **Given** I am creating a new Market Overview log entry
- **When** I submit the form without selecting a Distribution Center
- **Then** the system rejects the submission with a validation error: "Distribution Center is required"
- **And** the DC field is visually marked as required (asterisk, label)

### Scenario 2: DC Selection Experience
- **Given** I am on the Market Overview create form
- **When** I select a Retailer/Banner
- **Then** the DC dropdown is populated with distribution centers relevant to that Banner/Distributor relationship
- **And** only active DCs are shown

### Scenario 3: Existing Records Without DC
- **Given** there are existing Market Overview records without a DC
- **When** a user views or edits those records
- **Then** the DC field shows as empty (not blocked)
- **And** the user is prompted to select a DC on edit, but not forced (backward compatibility)

---

## Notes
- Confirm with business: should DC be required globally or only for certain retailers/banners?
- The two DC concepts (`DistributionCenter` vs `DistributorDc`) need resolution first — see CS-NEW-market-overview-crm-status-hierarchy.md
