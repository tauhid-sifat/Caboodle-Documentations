---
type: Document
title: "Quick Touch Base Before Weekend — 2026-09-17"
---

# Quick Touch Base Before Weekend — 2026-09-17

- **Source:** `meetings/transcripts/Quick touch base before weekend on Sep 17.txt` (960 lines)
- **Attendees:** Constance Wolfe (client), Md. Tauhidur Rahman, Md Mashiul Azam Chowdhury, Bijoy Nath, Kazi Towfiq Tasmin Ornov, Taslima Keya
- **Type:** Pre-weekend status and roadmap prioritisation

## Decisions
- **D-0917-1 (APPROVED):** Jira/Atlassian stays at 8 seats: Bijoy, Constance, Faria, Ornov, Ifti, Tawhid, Riz and Keya. Shahriar is not added.
- **D-0917-2 (APPROVED):** UPC leading zeros are dropped. The system UPC is the source of truth, mapped from the data mapping UPC table, and the distributor APL upload matches on that.
- **D-0917-3 (APPROVED):** All users and brands, including inactive and pre-migration ones, are migrated. No data is deleted during the IAM cutover; archiving waits for the separate archive database.
- **D-0917-4 (APPROVED):** The organization/access model ticket is raised from low to highest priority; it must land before further broker-side features.
- **D-0917-5 (CLARIFIED):** Work proceeds module by module rather than strictly by priority, except where blockers force a jump.
- **D-0917-6 (APPROVED):** After simple promo, the next priority is the broker dashboard and pipeline, then user-based filters.

## Open questions
- Where the connector between the pipeline and the dashboard must land first: tasks and due dates are needed before the dashboard can show task counts.
- Whether permissions should allow broker management, not just the broker owner, to view team pipelines.
- Which measures from the SPINs template are in scope, and whether the table needs widening.

## Actions
| Action | Owner |
|---|---|
| Fix trade spend rollup alignment and redeploy to staging | Md Mashiul Azam Chowdhury |
| Add requirements and acceptance criteria to the two pipeline tickets (brand, broker) | Md. Tauhidur Rahman |
| Raise CS-1461 priority and estimate the whole organization model | Bijoy Nath |
| Create the naming suggestion ticket for manually added category review rows | Taslima Keya |
| Investigate data mapping slowness and create the ticket | Bijoy Nath |

## Jira keys
- CS-1461 — organization based access control (epic, priority low, needs discussion)
- CS-1333, CS-1423 — distributor report calculations and data sync
- CS-1278 — UNFI web crawler / XPath instability
- CS-1387 — data sync not working, not populating distributor report
