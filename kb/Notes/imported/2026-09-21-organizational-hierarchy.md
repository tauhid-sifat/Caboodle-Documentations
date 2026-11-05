---
type: Document
title: "Caboodle Organizational Hierarchy Discussion — 2026-09-21"
---

# Caboodle Organizational Hierarchy Discussion — 2026-09-21

- **Source:** `meetings/transcripts/Caboodle Organizational Hierarchy Discussion on Sep 21 (Meeting Notes).txt` (Fellow AI notes, not a verbatim transcript)
- **Attendees:** Constance Wolfe (client), Bijoy Nath, Md Mashiul Azam Chowdhury, Md. Tauhidur Rahman
- **Type:** Meeting notes (Fellow)

## Decisions
- Brands, not brokers, control which modules are enabled in their environment. Brokers may request activation but cannot enable modules directly.
- Brands control per-broker data visibility, choosing which broker sees each piece of data they create.
- Multi-broker support is required: the current system allows only one broker-role user per brokerage, which has already broken in production (Bates Street cited).

## Open questions
- How broker scope is defined: by region, by retailer, or both.
- What the super admin can override once organisations self-manage their users.
- Whether plan and module selection can happen at signup, removing manual Caboodle setup.

## Actions
| Action | Owner |
|---|---|
| Schedule follow-up working sessions to walk through the hierarchy design before build | Constance Wolfe |
| Extend the Claude artifact with retailer and region scoping steps and produce an end-to-end view | Bijoy Nath |
| Confirm the role and permission matrix per organisation type | Md. Tauhidur Rahman |

## Jira keys
- None quoted in the notes. Workstream: IAM / organization based access control.
