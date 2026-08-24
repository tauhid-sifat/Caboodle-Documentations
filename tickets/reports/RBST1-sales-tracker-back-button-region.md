# Reports | Sales Tracker | Back Button Returns to International Region

**RBST1** | Bug | Priority: TBD | Status: New

---

## User Story

**As a** user of the Sales Tracker,
**I want** the back button (after viewing a retailer's product details) to return me to the region I started from,
**So that** I don't lose my place in the region I was working in.

---

## Description

In Sales Tracker, a user clicks a retailer within a region to view product details. There is a **back button** on the product-details view. However, clicking it always returns the user to the **International region**, regardless of which region they originally started from. The back navigation should return to the user's originating region.

---

## Acceptance Criteria

### Scenario 1: Back Returns to Originating Region
- **Given** a user opens a retailer's product details from a specific region (e.g., a non-International region)
- **When** they click the back button
- **Then** they return to that same region's Sales Tracker view
- **And** NOT to the International region

### Scenario 2: International Region Still Works
- **Given** the user started in the International region
- **When** they click back
- **Then** they return to the International region (correct behavior for that case)

---

## Jira Reference (data/jira-tickets)
- No direct duplicate found for the Sales Tracker back-button-returns-to-International-region bug.
- Context (back-button navigation patterns): **CS-1056** (Sales Tracker -> Banner Page needs back button), **CS-814** (Banner Page back to retail page), **CS-993** (Sales Tracker bar links to Banner Page).

---

## Related
- Sales Tracker report/module.

---

## Notes
- Likely the back button hard-codes the International region as the return target; it should preserve the entry region (route param / state).
- Verify behavior across all regions, not just International.
