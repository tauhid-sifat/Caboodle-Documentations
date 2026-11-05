---
type: Document
title: "Caboodle Ticket Call — 2026-10-19"
---

# Caboodle Ticket Call — 2026-10-19

- **Source:** `meetings/transcripts/Caboodle Ticket Call on Oct 19 (Meeting Notes).txt` (Fellow AI notes, not a verbatim transcript)
- **Attendees:** Constance Wolfe (client), Bijoy Nath, Md Mashiul Azam Chowdhury, Md. Tauhidur Rahman, Taslima Keya, Kazi Towfiq Tasmin Ornov
- **Type:** Meeting notes (Fellow)

## Decisions
- Arnab's staged fix blocks deletion of a category review list row while the calendar references it, and tells the user to remove it from the calendar first.
- The brand report must retain all history permanently; deleting from the category list must never cascade into it.
- Ask Caboodle stays on a closed frontier model (Claude Opus and Sonnet) rather than self-hosting an open weight model.

## Open questions
- Whether self-hosting an open weight model is worth the maintenance overhead versus engineering around a frontier model.
- How the category review calendar's year-agnostic behaviour should interact with clearing old dates.
- How Ask Caboodle credits are priced per organisation once the credit system lands.

## Actions
| Action | Owner |
|---|---|
| Reply to Arnab's email with the full category review data flow requirements | Constance Wolfe |
| Schedule a post-vacation walkthrough of the category review data flow | Bijoy Nath |
| Hold the category review deployment until the data flow fix is tested | Taslima Keya |
| Prepare the IAM admin panel demo notes for the next call | Md Mashiul Azam Chowdhury |

## Jira keys
- None quoted in the notes. Referenced workstreams: category review list/calendar/brand report, IAM admin panel, Ask Caboodle query tool.
