# Ticket Call — 2026-08-10

- **Source:** `meetings/transcripts/Ticket Call on Aug 10.txt` (1084 lines)
- **Attendees:** Constance Wolfe (client), Bijoy Nath, Md Mashiul Azam Chowdhury (FD), Md. Tauhidur Rahman
- **Type:** ticket triage (Category Review → Brand Report deep dive)

## Decisions
- **D-0810-1 (VALIDATED):** Three ways data moves from CR list to Brand Report: (a) **with email notification**, (b) **without notifying** any brand user, (c) **brand environment → broker environment**.
- **D-0810-2 (CLARIFIED):** Email body includes the selected review's details (region, retailer, category, date columns); single-select (not multi) when composing.
- **D-0810-3 (VALIDATED):** Assignee list shows **brand owners AND sub-users** across selected brands; if none selected, email defaults to **brand owner only**.
- **D-0810-4 (APPROVED):** Removed-from-list items stay removed but the row **remains visible in the list** (established behavior, confirmed).

## Open questions
- Final email template layout — Bijoy building a document with Tawhid; needs Constance clarification on detail block.
- Category-view backend clarification items from Bijoy — pending Constance answers.

## Actions
| Action | Owner |
|--------|-------|
| Bijoy + Tawhid to produce category-view/brand-report clarification document | Bijoy, Tawhid |
| Constance to send Claude-drafted writeup for devs to enter into Jira | Constance |
| Constance to share screenshot of category email | Constance |
| Constance to send recording | Constance |

## Jira keys
- None mentioned explicitly in transcript. Workstream: Category Review (CS-1361/CS-1296), Brand Report, email template.
