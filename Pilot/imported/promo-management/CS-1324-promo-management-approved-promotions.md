---
type: Document
module: promo-management
jira: [CS-1324]
status: backlog
last_verified: 2026-10-14
related_wiki: ../../wiki/promo-management-status.md
---

# Broker Dashboard | Promotional Management — Only Push Brand Approved Promotions to Promo Management

**CS-1324** | User Story | Priority: High | Status: Backlog
**Reporter:** Constance Wolfe

---

## User Story

**As a** Broker, **I want** Promo Management to show only promotions the brand has pushed to Approved, **So that** I don't see or act on sandboxed promotions.

---

## Acceptance Criteria

### Scenario 1: Show Only Approved Promotions

- **Given** a brand has a promotion in Trade Spend Sandbox
- **And** the brand has pushed that promotion to Approved (i.e. it now exists as a live TradeSpendPromo linked via SandboxPromotionID)
- **When** I open the Promotional Management view
- **Then** the promotion is displayed in the list

### Scenario 2: Hide Sandbox-Only Promotions

- **Given** a brand has a promotion in Trade Spend Sandbox
- **And** the brand has NOT pushed that promotion to Approved
- **When** I open the Promotional Management view
- **Then** the promotion is NOT displayed in the list

### Scenario 3: Multi-Brand Filtering

- **Given** I am assigned to multiple brands
- **And** each brand has a mix of Sandbox-only promotions and promotions pushed to Approved
- **When** I open the Promotional Management view
- **Then** only the promotions pushed to Approved, from my assigned brands, are displayed
- **And** no Sandbox-only promotions from any assigned brand appear in the list

### Scenario 4: Updated Push Reflects in Promo Management

- **Given** a promotion was previously pushed to Approved and is visible in Promo Management
- **And** the brand edits the promotion in Sandbox and pushes it to Approved again
- **When** I open the Promotional Management view
- **Then** the promotion is still displayed, reflecting the updated pushed data

### Scenario 5: Filters Respect Approved-Only Scope

- **Given** the Promotional Management list is showing only promotions pushed to Approved
- **When** I apply a filter (e.g. year, retailer, banner, category, distributor)
- **Then** only Approved promotions matching the filter are shown

---

## CW Edit 7/20/26 — Brand Side: Remove & Modify Approved Promotions

These scenarios belong to the **Brand Environment > Trade Spend Sandbox** module. Currently there is no option to remove or modify a promotion once it has been pushed to Approved. This forces a manual workaround.

### Scenario 6: Remove a Promotion from Approved

- **Given** a Brand Owner has pushed a promotion to Approved
- **When** they want to remove it from live Approved Promotions
- **Then** there should be an option to un-approve / retract the promotion back to Sandbox status
- **And** the promotion should no longer appear in Broker Promo Management

**Current workaround (SOP):**
1. Create a copy of the Approved Promotion in the Sandbox
2. Rename the copy to `"Original Version - {Date} - {User Initials}"`
3. Delete the original approved version from Sandbox

### Scenario 7: Modify an Approved Promotion (Version History)

- **Given** a Brand Owner wants to make changes to an Approved Promotion
- **When** they need to edit the promotion
- **Then** the system should support versioning so that previous versions are preserved
- **And** after modifications, the user can push the revised version to Approved

**Current workaround (SOP):**
1. Create a copy of the Original Version in Sandbox
2. Rename to `"Revised - {Date} - {User Initials}"`
3. Make modifications in Sandbox
4. Push to Approved

**Requirement:** The system should natively support versioning of promotions. Each push to Approved creates a new version. Prior versions are archived but remain accessible. The workaround of manually copying and renaming promotions should not be necessary.

---

## Related Tickets
- **CS-NEW-pm3-promo-status-submission.md** — Promo Status Options / Submission Button
- **PM1** — Submission Button Fix (STORY 1328)
