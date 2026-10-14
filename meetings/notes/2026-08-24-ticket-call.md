# Ticket Call — 2026-08-24

- **Source:** `meetings/transcripts/Caboodle Ticket Call on Aug 24.txt` (1148 lines)
- **Attendees:** Constance Wolfe (client), Bijoy Nath, Md Mashiul Azam Chowdhury (FD), Md. Tauhidur Rahman
- **Type:** ticket triage (stores, retail APL push, category calendar)

## Decisions
- **D-0824-1 (APPROVED):** **Retail APL on broker dashboard to be pushed live** same day (ahead of Constance's Jade Street presentation) if devs judge it ready.
- **D-0824-2 (APPROVED):** Duplicate stores in production: Bijoy runs a one-time **primary dedupe run**; afterwards an **admin merge tool** lets admins remove future duplicates without re-upload.
- **D-0824-3 (APPROVED):** Category-view calendar: **remove the compose section** when clicking a review; calendar shows **no contact/assignee info** (emailing happens from the list/Brand Report, not the calendar).
- **D-0824-4 (PROPOSED):** Retail APL list needs **infinite scroll or paging** (hard to use as-is); Tawhid notes an infinite-scroll ticket already exists.

## Open questions
- Costco category-name anomaly in staging — staging-only artifact or real bug?
- Category calendar review-month vs live-environment date differences — to verify.
- Consolidated Action Items email from Tawhid (AI summaries → Claude summary) — process question, not resolved.

## Actions
| Action | Owner |
|--------|-------|
| Primary dedupe run on production stores + push market-overview/stores changes to prod | Bijoy |
| Push retail APL live before Jade Street call if ready | FD/Bijoy |
| Note infinite-scroll/paging request for retail APL | Tawhid |
| Constance to get comfortable with Category Review, send invite for next-day call + recording | Constance |

## Jira keys
- None mentioned explicitly in transcript (infinite-scroll ticket referenced but not numbered). Workstream: Market Overview stores, Distributor APL, Category Review calendar.
