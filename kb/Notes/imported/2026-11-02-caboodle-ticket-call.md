---
type: Document
title: "Caboodle Ticket Call — 2026-11-02"
---

# Caboodle Ticket Call — 2026-11-02

- **Source:** `meetings/transcripts/Caboodle Ticket Call on Nov 2.txt` (1,605 lines)
- **Attendees:** Constance Wolfe (client), Bijoy Nath, Md Mashiul Azam Chowdhury, Md. Tauhidur Rahman, Kazi Towfiq Tasmin Ornov
- **Type:** Ticket triage and IAM staging review

## Decisions
- **D-1102-1 (APPROVED):** A simple promotion spanning two months becomes one row instead of one row per month, so the TPR fee is only counted once.
- **D-1102-2 (APPROVED):** The 100 percent vs 15 percent colour threshold is configurable per brand by the organisation admin, not globally and not per promotion.
- **D-1102-3 (APPROVED):** A notice board goes on the broker dashboard. Admins post announcements; no comments and no threading.
- **D-1102-4 (APPROVED):** CS-1202 absorbs CS-1711 and CS-1617. Row width and single bar across months are one piece of work.
- **D-1102-5 (APPROVED):** Only four dashboard and pipeline tickets remain: broker dashboard, brand dashboard, broker pipeline, brand pipeline. The rest are duplicates or obsolete.
- **D-1102-6 (CLARIFIED):** IAM is deployed to staging so remaining tickets can proceed; user-facing QA follows before production.

## Open questions
- Should a newly created organisation get any default module, or does Caboodle configure everything first.
- Offboarding and retention policy for brands leaving a broker (30 day access was proposed, not agreed).
- Whether market overview editing should stay limited to presentation date and SKU status.
- Whether brand report KPIs reuse the approved back-button ticket or need a new one.

## Actions
| Action | Owner |
|---|---|
| Create the TSS colour threshold ticket with 4h backend and 2-3h frontend | Md. Tauhidur Rahman |
| Create the notice board ticket and the versioning copy frontend ticket | Md. Tauhidur Rahman |
| Merge CS-1711 and CS-1617 into CS-1202 and mark duplicates | Md. Tauhidur Rahman |
| Send the Noble export file and load it into their database tomorrow morning | Bijoy Nath |
| Draft offboarding policy; finalise module priority order | Md. Tauhidur Rahman / Constance Wolfe |

## Jira keys
- CS-1387 — data sync not populating distributor report (12h backend, 3h frontend)
- CS-1442 — upload, export and filtering consistency across CRM screens
- CS-1202 — promotional calendar bar width and single bar across months
- CS-1591, CS-1598 — duplicate broker dashboard tickets, keep one
- CS-1613, CS-1597 — on hold
- CS-1672 — disable push button when a sandbox promotion has no new changes
- CS-1709 — CRM delete or merge retailers
- CS-1333 — distributor report calculations (Ornov, in progress)
