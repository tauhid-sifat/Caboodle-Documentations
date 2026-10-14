---
type: Document
title: "Ask Caboodle — 2026-09-03"
---

# Ask Caboodle — 2026-09-03

- **Source:** `meetings/transcripts/Ask Caboodle on Sep 3.txt` (834 lines)
- **Attendees:** Constance Wolfe (client), Bijoy Nath, Md Mashiul Azam Chowdhury (FD), Md. Tauhidur Rahman
- **Type:** Ask Caboodle (AI) scoping session

## Decisions
- **D-0903-1 (APPROVED):** Two question classes: **information-type** (e.g., "what promos run today?", "how many stores for this retailer?" — served by a query builder over existing schema) vs **reporting-type** (generate reports + insights — separate, heavier work).
- **D-0903-2 (VALIDATED):** No traditional RAG: data is deterministic and system-internal; design is a **multi-agent system per module**, responses grounded only in Caboodle data.
- **D-0903-3 (APPROVED):** Answer-first UX: deliver the direct answer first (e.g., top promo-case retailers), then offer drill-down (full lists/charts) instead of dumping everything upfront.
- **D-0903-4 (CLARIFIED):** Permission-gated answers: users can only ask about reports/modules they pay for / have access to.
- **D-0903-5 (APPROVED):** Admin **"coming soon" overlay fix**: blocking overlay removed so admins can add/remove modules; Constance needs brief training on the module.

## Open questions
- Ask Caboodle scope document (Tawhid: "fix the scope of ASCA model") — what exactly is in scope for v1?
- Export gap: distributor-data full export unavailable (individual reports exportable, whole dataset not); brands should NOT get full export — where should export live?
- Heavy-load check on exporting mapped data (FD to assess).
- CS-1362 (Ask Caboodle AI) still has no deliverable — this session is the first scoping input.

## Actions
| Action | Owner |
|--------|-------|
| Define ASCA scope so dashboards/questions can be planned | Tawhid + Bijoy |
| Assess export-mapped-data load; plan filter-dependent export | FD |
| Constance to send recording; move invite; discuss Tawhid hours | Constance |
| Training on admin module control for Constance | Dev team |

## Jira keys
- None mentioned explicitly in transcript. Workstream: CS-1362 (Ask Caboodle AI).
