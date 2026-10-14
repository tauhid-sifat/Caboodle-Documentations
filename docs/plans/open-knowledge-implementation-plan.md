# Open Knowledge implementation plan — Caboodle-Documentations

> Status: APPROVED at Gate 2 (full ceremony). Untracked (no Jira). Scope: docs repo only. No deadline.
> Planner wrote this file only; no code changes made. Execution is a separate step.

## 1. Summary
Standardize this repo's structure (Wave 1, runs alone), then implement all five Open Knowledge capabilities (openknowledge.sh): setup/organize (A), agent collaboration (B), validation (C), search + local viewing (D), publish + MCP + CI (E). Target: opencode answers project questions with a cited file and line range, without crawling the repo.

## 2. Gate 1 decisions (locked)
1. Structure as drawn, incl. tickets/ → specs/.
2. AGENTS.md splits into wiki/ + ~100-line router.
3. Jira as Markdown AND SQLite (50-ticket pilot shown before full conversion).
4. `okn setup` copy mode (pilot specs/, review printed plan pre-write).
5. Index raw transcripts AND structured notes (override of original exclusion).
6. Local-only viewer (no internal host; nothing public).
7. Token rotation: yes (Jira token in scripts/.env; check api/ask.js refs).
- Test questions: 10 approved (see §9). Branch: plain branch off master. Phasing: Waves 1–6.

## 3. Context & findings (all re-verified)
- 2,049 files / ~47.7MB. `data/jira-tickets/` 1,780 (CS-1…CS-1777 + 18 GTMS). `tickets/` 74 (73 specs + INTERNAL_TRACKING.md). `meetings/` 16 transcripts; §17 covers 10, uncovered: Jul 20, Jul 27, Aug 10, Aug 19, Aug 24, Sep 3 (`AGENTS.md:5,428` "14 transcripts" claim stale).
- Specs contain ~427 `---` markers (frontmatter likely; wiki-agent confirms vs horizontal rules).
- Move-breakers: `scripts/post-jira.js:28` (TICKETS_DIR), `scripts/fetch-jira.js:10` (OUT_DIR), `scripts/replace-codes.js:12`, `scripts/README.md:3`, `AGENTS.md:5,6,301,346,406,421,428`, `CONTEXT.md`, `index.md:14-20`, `vercel.json:3`, `tickets/INTERNAL_TRACKING.md:5`, per-spec `## Jira Reference` lines.
- Root `.gitignore` (2 lines: `.vercel`, `.env*`) covers neither `data/` nor generated dirs. Secrets by filename only: `scripts/.env`, `api/ask.js:10-11`.
- Git: `master`, 1,658 tracked changes + 144 untracked, zero tags. Base branch: master (repo default; deviation from develop rule recorded here).
- okn NOT installed. Docs v0.14.0 verified: `setup` (copy→`imported/`+`.openknowledge/import.json`; in-place adopts whole dir; `--prompt` legacy, current `setup skill --harness opencode`), `review [path] --scope changed|full`, `check`, `search <key> "query"`, `view`, `publish [path] --target viewer|mcp`, `mcp` read-only stdio, `setup github Wiki`, telemetry off via `okn telemetry disable` / `DO_NOT_TRACK=1` / `OPENKNOWLEDGE_TELEMETRY=off`. Sources: https://openknowledge.sh/wiki/features/commands/setup.html, review.html, publish.html, https://openknowledge.sh/wiki/features/telemetry.html, https://openknowledge.sh/wiki/.
- Reusable spec format: `# Title` + `**CS-xxxx** | type | ...`, User Story, AC Given/When/Then, `## Jira Reference`.

## 4. Constraints, assumptions, risks, unknowns
- Local-only; internal publishing; telemetry disabled before first okn run; secrets never printed/committed; rotation required.
- Assumptions: okn install cmd confirmed at execution; per-agent models supported (unverified, fallback single model); `---` is frontmatter.
- Risks: dirty tree hides move damage → commit/stash + tag first; script constants → same-commit update; gitignore gaps → extend before generating; transcript indexing may bloat → Wave 5 precision check, drop transcripts if it falls.
- Unknowns: `OPENKNOWLEDGE_*` vars; eval/claims semantics.

## 5. Agent definitions (files created at execution, Wave 1 prep)
| Agent | Purpose | May write only to | Tools |
|---|---|---|---|
| structure-agent | git-mv restructure + reference fixes, moves only, no content edits | whole repo (moves only) | read, git mv, grep |
| security-agent | .env move, gitignore, telemetry off, rotation flag | .env, .env.example, .gitignore, scripts/ | read/edit (never output secrets) |
| wiki-agent | AGENTS.md → wiki/ + router, content verbatim | wiki/, AGENTS.md | read/edit, writing-for-agents |
| jira-agent | ticket md + SQLite, 50-ticket pilot first | jira/, data/jira.db, scripts/jira-to-md.* | read/edit, Jira MCP or fetch script |
| meetings-agent | notes per transcript, §17 → index | meetings/notes/, wiki/decisions.md | read/edit |
| specs-agent | frontmatter + wiki links on 74 specs | specs/ | read/edit |
| okn-agent | setup/check/search/view/mcp/publish flows | okn config, opencode.json | shell (okn only), read/edit config |
| qa-agent | test questions + independent verification, never edits content to pass | tests/ only | read, okn search/check |
| ci-agent | Actions, sync.sh, publish config | .github/, scripts/sync.sh, publish config | read/edit |
- Orchestration: disjoint scopes (re-route via user on overlap); ≤15-line handoff reports; no self-grading; one branch/commit per agent per wave; cheaper models for read-only agents if supported; retry limit 2 then escalate.
- Executor skills: `opencode` (subagent format, per-agent models, MCP syntax), `ponytail` (minimal diffs), `writing-for-agents` (AGENTS.md split), `writing-guidelines` (optional, curated pages), `code-review` (final validation), `report` (only on okn↔opencode incompatibility).

## 6. Target structure
```
AGENTS.md              # ~100-line router: rules + "for X, read Y" table
README.md
.env.example           # real .env is gitignored
wiki/                  # 17 AGENTS.md sections, BUSINESS.md, CONTEXT.md
specs/                 # 74 files ex-tickets/, same 9 subfolders
meetings/
  transcripts/         # raw, never edited
  notes/               # YYYY-MM-DD-topic.md structured notes
jira/                  # generated trimmed Markdown, one note per ticket (indexed)
docs/                  # architecture/, qa/, handover/, plans/, onboarding/ (ex-ba-onboarding/)
design/                # prototypes/, wireframes/ (not indexed)
api/                   # not indexed
data/                  # raw Jira JSON, generated (not indexed)
scripts/
tests/                 # knowledge test questions
```
Conventions: lowercase kebab-case, no spaces, ISO dates, minimal frontmatter (type, title, module, status, last_verified, jira keys).

## 7. Phases
### Wave 1 — structure (structure-agent, ALONE)
Scope: move map (current|new|reason|refs) → user approval → `git mv`, one commit per top-level folder + reference fixes. Unclassifiable → `_unsorted` list for user.
Steps: 0) commit/stash dirty tree, tag `pre-restructure`, branch `restructure` off master. 1) map. 2) approve. 3) execute. 4) qa-agent verifies.
Acceptance: file count 2,049 before=after; zero new broken links; scripts dry-run OK; .gitignore still covers .env.
Rollback: `git reset --hard pre-restructure`.
### Wave 2 — safety (security-agent ALONE; qa-agent drafts tests in parallel)
Steps: creds→.env, extend `.gitignore` (data/, jira/, generated), telemetry off, rotation list (Jira token + api/ask.js verdict).
Acceptance: no token outside .env (grep); .env untracked; rotation tickets/owners named.
Rollback: revert commit.
### Wave 3 — content (wiki, jira, meetings, specs parallel)
- wiki-agent: split + router; verify `---` = frontmatter.
- jira-agent: 50-ticket pilot → show user → full 1,780 (key, type, status, epic, module, assignee, updated, summary, description, comments, links) + SQLite.
- meetings-agent: notes for 6 uncovered first, then rest; §17 → index.
- specs-agent: frontmatter + wiki links.
Acceptance: router resolves all 17 sections; pilot approved; 16 notes exist; 74 specs carry frontmatter.
Rollback: per-agent commit revert.
### Wave 4 — build (okn-agent sequential)
A: install okn (docs-verified) → copy-mode pilot on specs/ (approve printed plan) → wiki/, meetings/, docs/, jira/. C: `okn check` fix loop + `last_verified` freshness rule + retrieval check. D: `okn search` per test question. E-MCP: register `okn mcp` in opencode.json (read-only).
Acceptance: `okn check` READY; 10/10 questions return correct file+line.
Rollback: remove bundle + config entry.
### Wave 5 — verify (qa-agent)
Full `okn check`, all test questions, e2e opencode answer with citation via MCP without crawl. Pass ≥8/10 file+line. Failures → owning agent → re-test.
### Cross-validation (final, qa-agent)
Full suite + e2e + single overall review. Reconcile every acceptance criterion.
### Wave 6 — ship (okn-agent + ci-agent parallel)
`okn view` (diffs approved pre-save); workflows doc (`setup skill`, `review`) if verified; `okn publish` local viewer; Actions (`setup github` if verified) with broken-link PR fail test; `scripts/sync.sh` (fetch→regenerate→check→index→stamp "Last synced").
Acceptance: viewer serves locally; PR gate fails on broken link; sync.sh dry-run OK.

## 8. Out of scope
design/, api/, data/ from index; public publishing; code repos; new features; editing raw transcripts.

## 9. Test questions (approved basis for tests/knowledge-questions.md)
1. SkuStatus terminal value+rule → wiki promo/market-overview. 2. Brands-assigned-to-brokers phrasing → terminology. 3. Category Review 3 interactions+triggers → category-review. 4. CS-1361 vs CS-1296 data flow → specs + jira/. 5. Promotion lifecycle + TSS push validation → flows. 6. Multi-brand sheet-view source meeting → notes + §17. 7. Highest ticket number + total → jira/ index. 8. Transcripts lacking §17 coverage → notes index. 9. Simple Entries bypass (D13) status → wiki + CS-1708. 10. Secrets locations + rotation rule → .env.example/docs (never values).

## 10. Final report shape
Table (agent, status, files changed, verification, open issues) + capability coverage table (A Setup / A Portability / B Precise context / B Workflows / C Link-structure-metadata / C Freshness-retrieval / D Search / D Viewing / E Publishing / E MCP / E CI: done/partial/blocked + evidence) + wave rerun notes.
