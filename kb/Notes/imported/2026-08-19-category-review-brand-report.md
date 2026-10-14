---
type: Document
title: "Category Review Brand Report — 2026-08-19"
---

# Category Review Brand Report — 2026-08-19

- **Source:** `meetings/transcripts/Category Review Brand Report on Aug 19.txt` (767 lines)
- **Attendees:** Constance Wolfe (client), Bijoy Nath, Md Mashiul Azam Chowdhury (FD)
- **Type:** Category Review Brand Report + Optimity/Bubbies data integration

## Decisions
- **D-0819-1 (VALIDATED):** Assignee notification logic: assignee list includes **sub-users and brand owners**; **empty assignees = notify all owners + sub-users** of selected brands; selecting individuals narrows to only those people.
- **D-0819-2 (APPROVED):** Next step on Optimity/Bubbies: Bijoy checks whether the table exists in their database and whether Caboodle can write to it; if yes, move to deciding what data goes in.
- **D-0819-3 (CLARIFIED):** No free-form email entry in the assignee composer (recipients come from the brand user list only).

## Open questions
- What data goes into the Optimity table (after write-access check passes)?
- How to explain owner vs sub-user semantics to brokers (Constance needs plain-language wording).
- Email backend/template storage for Send-to-Contacts — still undecided (see decisions index).

## Actions
| Action | Owner |
|--------|-------|
| Check Optimity table existence + write access; email Constance a writeup for the client | Bijoy (then Arnob for structure) |
| Reply in the Optimity email thread | FD |
| Re-send Fellow recording link to Tawhid's email (access broke) | Constance |

## Jira keys
- None mentioned explicitly in transcript. Workstream: Category Review Brand Report, email notification.
