---
type: Document
title: "A IT Ticket Review — 2026-10-12"
---

# A IT Ticket Review — 2026-10-12

- **Source:** `meetings/transcripts/A IT Ticket Review on Oct 12.txt` (1,000 lines)
- **Attendees:** Constance Wolfe (client), Shahriar Hyder, Md. Tauhidur Rahman, Md Mashiul Azam Chowdhury (FD), Bijoy Nath, Taslima Keya, Kazi Towfiq Tasmin Ornov
- **Type:** Roadmap hours and ticket review

## Decisions
- **D-1012-1 (APPROVED):** Simple promo same-month date entry is a defect to hotfix in production; the cross-month spanning fix stays separate and waits for IAM.
- **D-1012-2 (APPROVED):** Banner SKU upload from already-mapped distributor data is a deterministic workflow, so it becomes a normal backend build rather than an Ask Caboodle project.
- **D-1012-3 (APPROVED):** KPI cards belong inside their own reports, not on the landing dashboard; pinning a report to a dashboard is Phase 3 behaviour.
- **D-1012-4 (CLARIFIED):** Tasking shares at project level, not pipeline level. Project access is granted per user, and IAM can switch the pipeline module on or off per broker.
- **D-1012-5 (APPROVED):** Actual lift cannot be pulled from SPINs until banner and product mapping exists for SPINs data.
- **D-1012-6 (CLARIFIED):** Remaining roadmap estimates are deferred until IAM is done; work proceeds from the revised ticket list in the meantime.

## Open questions
- KPI card mapping per report: how many cards each page carries so layouts stay consistent.
- Where actualized lift is captured long term (edit a version vs. import) beyond manually changing event lift.
- DC and regional report Lovable links still need estimation once the KPI mapping is settled.

## Actions
| Action | Owner |
|---|---|
| Hotfix simple promo date entry and report back early tomorrow | Bijoy Nath |
| Share distributor report user guide with Kate, copying Constance | Taslima Keya |
| Verify highlighted redundant tickets and send the clean roadmap | Md. Tauhidur Rahman |
| Share SPINs project logic and conditions for the lift calculation | Constance Wolfe |
| Schedule a dedicated session to map KPI cards to reports | Constance Wolfe + Md. Tauhidur Rahman |

## Jira keys
- CS-1391 — data mapping / banner SKU upload (needs discussion, on hold)
- CS-1628 — brand modules, TSS actualized promotion
