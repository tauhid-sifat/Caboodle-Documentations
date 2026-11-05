---
type: Document
title: "Ticket Clarification — 2026-10-28"
---

# Ticket Clarification — 2026-10-28

- **Source:** `meetings/transcripts/Ticket Clarification on Oct 28.txt` (1,374 lines)
- **Attendees:** Constance Wolfe (client), Md Mashiul Azam Chowdhury, Bijoy Nath, Md. Tauhidur Rahman, Taslima Keya
- **Type:** Roadmap ticket clarification session

## Decisions
- **D-1028-1 (APPROVED):** External data upload reuses the existing unified distributor sales table. Users map their file columns to system columns once per provider, and the mapping is remembered for later uploads.
- **D-1028-2 (APPROVED):** Copying a single version creates a new separate promotion each time; copying two versions yields two new promotions.
- **D-1028-3 (APPROVED):** The pipeline collapses to two tickets, one for brand and one for broker. Brand pipeline behaves like a personal board with a separate shared tab.
- **D-1028-4 (APPROVED):** The EDLP toggle in the stepper needs an explanatory message: enabling it means EDLP only, no additional promotions.
- **D-1028-5 (CLARIFIED):** Activity logging from the IAM work (login, session length) covers the admin visibility request, so no separate heat map ticket is needed.
- **D-1028-6 (CLARIFIED):** No new tickets enter the roadmap once acceptance criteria are fixed; later changes are logged as new tickets.

## Open questions
- Which SPINs measures the upload template must accept; the template needs review before the table is widened.
- When the archive database is funded and built.
- How to unlink a banner from a distributor without destroying promotions already built on that link.
- Whether brokers and brands need separate starter module sets on creation.

## Actions
| Action | Owner |
|---|---|
| Send the full estimation set plus acceptance criteria and priority list | Md. Tauhidur Rahman |
| Send the priority ticket list for cross-referencing against the roadmap | Constance Wolfe |
| Write the CS-1276 description from the column-mapping walkthrough | Md. Tauhidur Rahman |
| Create tickets for store void report filters, filter persistence and banner relinking | Md. Tauhidur Rahman |
| Complete the IAM frontend, then deploy to staging on Sunday | Md Mashiul Azam Chowdhury |

## Jira keys
- CS-1276 — bespoke reporting and external data upload (agnostic distributor and retailer data)
- CS-1293 — review SPINs measures accepted into Caboodle (to be reopened)
- CS-1802 — version copy naming and open questions
