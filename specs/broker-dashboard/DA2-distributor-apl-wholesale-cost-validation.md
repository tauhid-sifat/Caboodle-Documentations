---
module: broker-dashboard
jira: [CS-1603]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/broker-dashboard.md
---

# Distributor APL | Wholesale Case Cost Required on Edit But Not on Upload

**CS-1603** | New Requirement | Bug | Priority: TBD | Status: New

---

## User Story

**As a** Broker user managing Distributor APL,  
**I want** the Wholesale Case Cost validation to be consistent between manual edit and bulk upload,  
**So that** I am not blocked from editing records that were successfully uploaded.

---

## Description

There is a validation mismatch in the Distributor APL module:

- **Upload (CSV import):** Wholesale Case Cost is **not required** â€” records can be imported without it
- **Edit (manual upsert):** Wholesale Case Cost **is required** â€” the form/API rejects saving if the field is empty

This means records uploaded without a Wholesale Case Cost cannot be edited later unless the cost is provided, even if the user only wants to update other fields (e.g., item code, unit cost).

---

## Acceptance Criteria

### Scenario 1: Consistency Fix
- **Either** make Wholesale Case Cost optional on edit (matching upload behavior)
- **Or** make Wholesale Case Cost required on upload (matching edit behavior)
- **And** the validation rule is applied uniformly across both paths

### Scenario 2: Edit Existing Records Without Cost
- **Given** a Distributor APL record was uploaded without a Wholesale Case Cost
- **When** I edit and save that record without providing a cost
- **Then** the save succeeds (if optional) or prompts for the cost (if required)
- **And** other fields (item code, unit cost, etc.) can be updated independently

---

## Notes
- Existing endpoint: `POST Brokers/apl*` (upsert distributor APL)
- Resolve the direction with the business â€” does Wholesale Case Cost need to be mandatory or not?
