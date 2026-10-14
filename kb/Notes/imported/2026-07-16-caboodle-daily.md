---
type: Document
title: "Caboodle Daily — 2026-07-16"
---

# Caboodle Daily — 2026-07-16

- **Source:** `meetings/transcripts/Caboodle Daily on Jul 16.txt` (955 lines)
- **Attendees:** Constance Wolfe (client), Bijoy Nath, Md Mashiul Azam Chowdhury (FD), Md. Tauhidur Rahman, Taslima Keya
- **Type:** daily call (calendar bugs, Brand Report sync)

## Decisions
- **D-0716-1 (VALIDATED):** Brand Report / Calendar stay in sync: **remove from either removes from both**; remove from calendar cascades to brand report.
- **D-0716-2 (APPROVED):** Retailer-filter bug confirmed (removed retailers stick in filter; Gelson's-type misses) — Keya's ticket stands; retailer section is the problem area.
- **D-0716-3 (PROPOSED):** Upload failure UX: add an **exception report** listing failed rows (currently only a count); deprioritize email-as-notification work until other items land.

## Open questions
- Calendar retail-issue root cause (filter vs data) — under investigation.
- Deployment under review in staging — test results pending.

## Actions
| Action | Owner |
|--------|-------|
| Retailer-filter ticket testing/fix | Keya + devs |
| File generic exception-report ticket for uploads | Constance/devs |
| Talk Monday (weekend break) | All |

## Jira keys
- None mentioned explicitly in transcript. Workstream: Category Review calendar, DataUpload.
