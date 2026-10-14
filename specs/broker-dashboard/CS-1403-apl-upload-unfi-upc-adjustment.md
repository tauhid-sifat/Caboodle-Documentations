---
module: broker-dashboard
jira: [CS-1403]
status: backlog
last_verified: 2026-10-14
related_wiki: ../../wiki/category-review.md
---

# Broker Dashboard | APL Upload Adjust for UNFI UPC Codes

**CS-1403** | Bug | Priority: High | Status: Backlog  
**Assignee:** Md Mashiul Azam Chowdhury Efti | **Reporter:** Constance Wolfe

---

## User Story

**As a** Broker user uploading APL data from UNFI,  
**I want** the APL Upload module to automatically handle the truncated UPC codes that UNFI provides,  
**So that** APL uploads from UNFI succeed without being rejected due to UPC mismatches.

---

## Description

When UPC codes are pulled from the UNFI portal, UNFI removes the last digit (check digit) from the Product (Unit) UPC code. This truncated UPC does not match the full UPC stored in Caboodle's product records, causing the APL upload to reject the data.

The same issue was previously encountered and fixed for the **Distributor Report** import. That same systemic adjustment (UPC normalization/matching logic) needs to be applied to the **APL Upload** module on the Broker Dashboard.

---

## Acceptance Criteria

### Scenario 1: Truncated UNFI UPC Accepted on Upload
- **Given** I am uploading an APL file exported from the UNFI portal
- **When** the file contains UPC codes that are missing the last check digit (compared to the full UPC in ProductSpecs)
- **Then** the system matches the truncated UPC to the corresponding full UPC in the product catalog using the same logic already implemented for the Distributor Report
- **And** the upload succeeds, creating/updating the APL records with the correct product association

### Scenario 2: Existing Distributor Report Parity
- **Given** the Distributor Report already has a working UPC adjustment for UNFI data
- **When** the APL upload processes UNFI data
- **Then** it uses the same UPC matching logic (e.g., ignore last digit comparison, or pad/validate check digit) rather than requiring an exact match

### Scenario 3: Non-UNFI Uploads Unaffected
- **Given** I am uploading APL data from a source other than UNFI
- **When** the file contains standard full UPC codes
- **Then** the upload continues to use exact UPC matching as before — no regression

---

## Out of Scope
- Changing how UPCs are stored in ProductSpecs
- Fixing UPC normalization for other modules (Distributor Report is already fixed)
- Two-way sync with UNFI portal

---

## Context
- UNFI drops **2 leading zeros** and the **last (check) digit** from UPC codes
- Existing normalization strips leading zeros and dashes (`UpsertProductSpecRequest.cs:317-328`)
- The Distributor Report fix was applied in the DataUpload/DataHub pipeline; this ticket applies the same fix to the `Broker.DistributorAPL` import path (`POST Brokers/apl*`)

---

## Related Tickets
- **CS-1424** — Data Sync for Broker Distributor APL (extends automation for APL)

---

## Notes
- Reuse the existing UPC comparison utility from the Distributor Report implementation rather than duplicating logic.
- The uploaded APL data stores the original UNFI UPC; the match is against the ProductSpec UPC.
- Verify with the failed records report attached to this ticket in Jira.
