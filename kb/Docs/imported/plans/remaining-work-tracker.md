---
type: Document
title: "Remaining work tracker — Caboodle-Documentations overhaul"
---

# Remaining work tracker — Caboodle-Documentations overhaul

> Created 2026-10-14. Source: plan `docs/plans/open-knowledge-implementation-plan.md` + contradiction check + D16–D20 findings.
> Status values: DONE / IN-REVIEW / BLOCKED-constance / BLOCKED-upstream / TODO / YOUR-ACTION.
> Jira posting: NOT YET — confirm, then post (see bottom).

## A. Specs & decisions (content)

| # | Task | Status | Blocker / evidence |
|---|---|---|---|
| A1 | Review 2 draft specs (corrupt-data report, resend-selected) | TRACKED CS-1778 | mandate split: resend APPROVED, report CLARIFIED |
| A2 | APL terminology memo for Constance | TRACKED CS-1779 | blocks A3; evidence: D17, D20, DA1/DA2/CS-1403/CS-1424 |
| A3 | Draft Retail APL export + store merge-tool UI specs | BLOCKED-constance | needs CS-1779 ruling first |
| A4 | CS-1361 D18-compliance revision | TRACKED CS-1780 | proposal: cut compose + assign-contacts, keep notes |
| A5 | D19 minors ruling (colors, audit log) | TRACKED CS-1781 | needs you/Constance ruling |
| A6 | Correct D20 status per-clause | DONE | fixed: report CLARIFIED, resend + APL export APPROVED |

## B. okn track (tool)

| # | Task | Status | Blocker / evidence |
|---|---|---|---|
| B1 | Watch okn releases for v0.14.0 (latest verified: v0.13.0, feed 2026-08-31) | BLOCKED-upstream | then re-verify flags → resume Wave 4 |
| B2 | Waves 4–6 (setup/validate/eval/search/MCP/publish/CI) | BLOCKED-upstream | needs B1 |
| B3 | `scripts/sync.sh` (fetch --sync → regenerate → check → index → stamp) | BLOCKED-upstream | needs B1 (non-okn half could be split out — say so) |

## C. Yours (only you can do these)

| # | Task | Status | Notes |
|---|---|---|---|
| C1 | Rotate Jira API token (plaintext in `scripts/.env`) + verdict on `api/ask.js` | YOUR-ACTION | steps in `scripts/SECURITY.md` |
| C2 | Push approval for future batches (master in sync as of 2026-10-14) | YOUR-ACTION | say "push" after each batch |

## Done (this session, for the record)

- Waves 1–3 + structural verify, index repair, unsorted placements, merge to master, push (22 commits).
- Jira knowledgebase re-synced + MCP-verified (1,780 tickets, CS-1…CS-1777).
- Jira MCP configured (official Atlassian remote, OAuth).
- Contradiction check: CS-1361 vs D18 (blocking), 4 unspecced clauses, D16 clarified.

## Standing instructions

- **Jira statuses:** keep new/unknown statuses as labeled boxes (count + name, no invented workflow semantics). On each sync, diff the status list vs the model in `wiki/jira-backlog-intelligence.md`; record additions/retirements with date. (2026-10-14: In Review added, Resolved retired, GTMS scheme split out.)

## Jira posting checklist (do NOT post without explicit "post" + format)

- **Jira statuses:** keep new/unknown statuses as labeled boxes (count + name, no invented workflow semantics). On each sync, diff the status list vs the model in `wiki/jira-backlog-intelligence.md`; record additions/retirements with date. (2026-10-14: In Review added, Resolved retired, GTMS scheme split out.)

When confirmed, create one CS ticket per TODO/IN-REVIEW row above (A1–A6 except A6-trivial, B3-split?) with summary + this file's row as description. Suggested subjects:
- "Docs: review draft specs (corrupt-data report, resend-selected)"
- "Docs: APL terminology ruling (Retail vs Distributor)"
- "Docs: CS-1361 D18-compliance revision"
- "Docs: D19 minors ruling (colors, audit log)"
- "Docs: D20 status correction (APPROVED→CLARIFIED)"
