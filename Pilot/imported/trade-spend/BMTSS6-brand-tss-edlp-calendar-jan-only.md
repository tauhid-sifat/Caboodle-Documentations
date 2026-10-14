---
type: Document
module: trade-spend
jira: [CS-1630]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Brand Modules | TSS / Promo Calendar | EDLP Shows Only in January - Should Span All Months

**CS-1630** | Bug | Priority: TBD | Status: New

---

## User Story

**As a** Brand user viewing the Promotional Calendar and Monthly Report,
**I want** EDLP promotions to appear across all months of their date range (not only January),
**So that** planned cases/revenue are distributed correctly through the year.

---

## Description

An EDLP promotion set up with dates **Jan 1 - Dec 31** currently appears in the **Promotional Calendar only in the month of January**. The total planned cases for the EDLP should be split across all months of the year.

- It works correctly in **Broker Promotional Management** (EDLP shows across all months there).
- The bug also occurs in the **Monthly Report** (EDLP only in January).
- Hypothesis: the Brand Promotional Calendar / Monthly Report may still be pulling from **TSS (Sandbox)** rather than **Approved Promotions (BAP)**, causing the mis-distribution.

This is a direct match to Jira **CS-1436** (same symptom, same environments).

---

## Acceptance Criteria

### Scenario 1: EDLP Across All Months (Brand Calendar)
- **Given** an EDLP with a full-year date range is Approved
- **When** the Brand Promotional Calendar renders
- **Then** the EDLP appears across all months of its range (cases/revenue split per month)
- **And** it matches the Broker Promotional Management behavior

### Scenario 2: EDLP Across All Months (Monthly Report)
- **Given** the same EDLP
- **When** the Monthly Report renders
- **Then** the EDLP is distributed across all months (not only January)

### Scenario 3: Source Consistency
- **Given** the fix
- **When** data is pulled
- **Then** the Brand Calendar / Monthly Report source matches Approved Promotions (BAP), not just TSS

---

## Jira Reference (data/jira-tickets)
- **CS-1436** - 'TSS | EDLP Promotional Reporting only Populating the Month of January' - EXACT match (same symptom, Broker PM works, Monthly Report affected, hypothesis re: TSS vs Approved). Use this Jira ticket as the source of truth.
- **CS-1202 / CS-1232** - Promo events stretching across >1 month should show on all months (general rule this bug violates).
- **CS-1170** - Combine EDLP in 1 row with other events (related EDLP calendar rendering).
- **CS-1260** - EDLP Accounts on Trade Spend Roll Up (EDLP works in TSS but not roll up).
- **CS-1447** - Promo Rev discrepancy across TSS / BAP / Monthly Report (data-source consistency).

---

## Related
- **CS-1627** - EDLP entry path (upstream).
- **CS-1628** - actualization/reporting consistency.

---

## Notes
- Confirm whether the Brand Calendar/Monthly Report query filters by Approved vs. Sandbox status.
- Validate the month-split math (planned cases / 12, or by days-in-range).
