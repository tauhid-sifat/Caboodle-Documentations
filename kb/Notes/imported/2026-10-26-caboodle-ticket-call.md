---
type: Document
title: "Caboodle Ticket Call — 2026-10-26"
---

# Caboodle Ticket Call — 2026-10-26

- **Source:** `meetings/transcripts/Caboodle Ticket Call on Oct 26.txt` (880 lines)
- **Attendees:** Constance Wolfe (client), Shahriar Hyder, Taslima Keya, Md Mashiul Azam Chowdhury (Ifti), Bijoy Nath, Kazi Towfiq Tasmin Ornov, Md. Tauhidur Rahman
- **Type:** Ticket call, copy and versioning clarifications

## Decisions
- **D-1026-1 (APPROVED):** Copy is available at both levels: whole promotion from the list page, and a single version from the version list. Copying one version creates a separate promotion.
- **D-1026-2 (APPROVED):** Version deletion and whole-promotion deletion are enabled. The version currently set as reporting must be replaced before it can be deleted.
- **D-1026-3 (APPROVED):** Promotion names may repeat across different years. The copy suffix is dropped so users keep their own naming convention.
- **D-1026-4 (APPROVED):** Ask Caboodle credits convert at $1 = 100 credits.
- **D-1026-5 (CLARIFIED):** Nothing is archived or hidden yet. Data stays as is until a separate archive database exists, targeted early 2027.
- **D-1026-6 (APPROVED):** Removing a row from the category review list must not remove it from the calendar or the brand report.

## Open questions
- Offboarding policy: how long brand data is retained after a broker disconnect.
- Root cause for promotions users report as disappearing; needs the activity log plus broker/banner names.
- Frozen header in the simple promo export needs XLSX because CSV cannot carry formatting.
- Whether inactive brands are migrated at all.

## Actions
| Action | Owner |
|---|---|
| Send the Noble files that fail to download (tomorrow morning) | Bijoy Nath |
| Investigate the Wegmans 2026/2027 rename case and the missing-promotion reports | Bijoy Nath |
| Add version-level copy plus version and promotion deletion this week | Bijoy Nath |
| Test category review removal behaviour against the brand report | Taslima Keya |
| Draft the offboarding policy and the user/organisation validation sheet | Md. Tauhidur Rahman |

## Jira keys
- CS-1795 — downloading files throws an error from the Noble environment
- CS-1729 — simple promotion used as the copy/version naming example
