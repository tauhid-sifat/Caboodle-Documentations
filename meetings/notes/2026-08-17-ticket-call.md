# Ticket Call — 2026-08-17

- **Source:** `meetings/transcripts/Caboodle Ticket Call on Aug 17.txt` (771 lines)
- **Attendees:** Constance Wolfe (client), Md Mashiul Azam Chowdhury (FD), Md. Tauhidur Rahman
- **Type:** ticket triage (storage, email resend, filters)

## Decisions
- **D-0817-1 (PROPOSED):** Jira attachment storage full: options are **upgrade storage vs delete old attachments** (Google-Drive sharing for retrieval in the meantime); analytics (PostHog) + cleanup proposed.
- **D-0817-2 (APPROVED):** Email UX: **resend emails for selected** items; select-and-email brands from the list.
- **D-0817-3 (APPROVED):** Enable **retail APL export** alongside current work.
- **D-0817-4 (CLARIFIED):** Sticky/user-wise filters are a **UX layer over the same core functionality** (frontend rendering), distinct from RBAC scoping — open question on how far they stretch (trade-spend rep scoping cited).

## Open questions
- Filter dependency behavior (brands/retailers/search interplay) — walked through live, needs ticket.
- Final-status sticky filtering (users don't want to re-filter every visit) — same theme as Aug 18 session.
- Bug sprint start timing (after tomorrow's talk).

## Actions
| Action | Owner |
|--------|-------|
| Try attachment add; audit tickets with attachments | FD |
| Constance to send notes + meeting invite for tomorrow | Constance |
| Start bug sprint after next-day discussion | Dev team |

## Jira keys
- None mentioned explicitly in transcript. Workstream: Admin (storage), APL export, sticky filters.
