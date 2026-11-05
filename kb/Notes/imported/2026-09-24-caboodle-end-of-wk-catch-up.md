---
type: Document
title: "Caboodle End of Wk Catch Up (Google Sign in) — 2026-09-24"
---

# Caboodle End of Wk Catch Up (Google Sign in) — 2026-09-24

- **Source:** `meetings/transcripts/Caboodle End of Wk Catch Up Google Sign in on Sep 24.txt` (1,256 lines)
- **Attendees:** Constance Wolfe (client), Kate Goldrick, Taslima Keya, Md Mashiul Azam Chowdhury (Efti), Bijoy Nath, Md. Tauhidur Rahman, Kazi Towfiq Tasmin Ornov
- **Type:** End of week catch up, store data and IAM demo

## Decisions
- **D-0924-1 (APPROVED):** Store identity is the combination of name, address, city/state, ZIP and lat/long. Name alone is no longer unique.
- **D-0924-2 (APPROVED):** Fix the sync to match addresses, then backfill rather than asking clients to re-upload months of data.
- **D-0924-3 (APPROVED):** Signup becomes one path only: the signup page. Same domain joins the existing organisation as a membership request; a new domain creates a new organisation with that user as admin.
- **D-0924-4 (CLARIFIED):** No unassigned role exists in the new IAM; every user carries a role with defined permissions.
- **D-0924-5 (PROPOSED):** Brokerage companies manage their own members and module selection, with Caboodle approving the requested plan from the platform admin side.

## Open questions
- Roughly 3,000 stores show a blank banner; merge each one or delete as duplicates.
- Distinguishing broker-level authority from sub-broker is still unsolved in current data.
- Who schedules the email signing fix for info@caboodleservices.com.

## Actions
| Action | Owner |
|---|---|
| Implement address-aware store uniqueness and backfill production | Bijoy Nath |
| Review the Hagen store duplicates against the new rule and report back | Bijoy Nath |
| Test simple promo and the remaining staging items by Sunday | Taslima Keya |
| Send Kate the merge-store walkthrough and record the session | Constance Wolfe |
| Ship data propagation (Whitefish case) to production next day | Bijoy Nath |

## Jira keys
- CS-1482 — testing audit umbrella with bug subtickets (Ornov)
