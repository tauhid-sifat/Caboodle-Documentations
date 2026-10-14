# Review Broker Questions — 2026-08-04

- **Source:** `meetings/transcripts/Review Broker Questions on Aug 4.txt` (770 lines)
- **Attendees:** Constance Wolfe (client), Bijoy Nath, Md Mashiul Azam Chowdhury (FD), Md. Tauhidur Rahman
- **Type:** broker requirements review (user-scoped views, filters)

## Decisions
- **D-0804-1 (APPROVED):** User-login-specific views: implement **system-wide** (not per-broker custom) — a user sees only their retailers/brands on login, with fixed filters.
- **D-0804-2 (CLARIFIED):** Implementation is straightforward per module; cost scales with **how many modules** get it (Retailers, Promo, Products, Reports candidates).
- **D-0804-3 (APPROVED):** Notify brand = owners AND sub-users (re-confirmed; see 2026-07-30 note).
- **D-0804-4 (APPROVED):** Keya transitions to **proactive QA audit** of the current system (Constance finds bugs opportunistically today); debrief + process recommendations to follow.

## Open questions
- Full module list for fixed filters — Constance to decide (led to Aug 18 session).
- MO6 sheet-view mockup — client has one, not yet obtained.
- Organization model (multi-broker/admin/sub-user per brokerage) — design discussion, no decision.

## Actions
| Action | Owner |
|--------|-------|
| Email Keya re: transition to audit + schedule debrief | Constance |
| Decide filter module list | Constance |

## Jira keys
- None mentioned explicitly in transcript. Workstream: user-based fixed filters, Market Overview (MO6).
