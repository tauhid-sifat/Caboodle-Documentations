# Ask Three-Pane Redesign Plan

## Summary
Rebuild the Ask chat view Crisp-style: left Sessions panel (search, week groups, switching), center composer with empty-state logo plus Try-asking cards, right Prompt Gallery with category pills and 6 starter prompts. Multi-session persisted in localStorage; mobile collapses to composer-first with pane toggles.

## Context & findings
- Current `view-askchat` in `Wireframe/index.html`: 240px history sidebar (`THIS CHAT` + `SAVED`) + message log + bottom input. Single `ASK.chat` array persisted as `caboodleAskChat`; saved library as `caboodleAskLib`. Router `showView()`; answers via `askShow()` → `askChatPush()` → `askChatRender()`; KB planning + regex fallback untouched by this work.
- Reuse: message bubble/table/export renderers, KB + executor, plan-mode proxy, curated columns, sticky headers. New: session store, gallery data, empty-state art, responsive toggles.

## Constraints, assumptions, risks, unknowns
- Constraints: zero dependencies; offline-first (all panes render without proxy); 390px mobile clean; no backend changes.
- Assumptions: auto-titles = first question truncated to 40 chars; week groups = This Week / Last Week / Older by message date; gallery starter prompts map 1:1 to existing demo questions.
- Risks: localStorage growth (sessions x messages with tables) -> cap 10 sessions x 20 messages, tables re-rendered from stored head/rows(100); sidebar toggle state vs router views -> toggles only affect panes inside `view-askchat`.
- Unknowns: none load-bearing.

## Workspace setup
- Base `master` (repo has no `develop`); no branch, no worktree, consistent with all POC work so far.

## Phase 1 - Shell + center composer
- Scope: `Wireframe/index.html` only. Three-column grid shell; center: empty-state (logo, "New session" heading, disclaimer line), big composer (input + Send, Enter handling via existing `askChatSend()`), Try-asking card grid (6 cards firing existing questions); answers render below composer as today.
- Steps: 1) shell markup + CSS, 2) composer wiring, 3) Try-asking cards, 4) empty-state show/hide logic.
- Acceptance criteria:
  - [ ] Empty chat shows logo, disclaimer, and 6 clickable Try-asking cards; clicking one asks it.
  - [ ] Composer Send and Enter both ask; answer renders below with table + Save/Export.
  - [ ] Existing history, KB planning, fallback, export all behave as before.

## Phase 2 - Sessions + gallery + mobile
- Scope: `Wireframe/index.html` only. Session store (`caboodleAskSessions`: id/title/created/messages) with New/switch/search/week groups; gallery panel (My Prompts = saved library, Gallery = 6 starters, search, category pills Merchant/Inventory/General); mobile toggles for panes.
- Steps: 1) session CRUD + persistence + migration of current `caboodleAskChat`, 2) gallery render + pills + search, 3) mobile toggle buttons + media queries, 4) cross-check.
- Acceptance criteria:
  - [ ] Two sessions with distinct questions switch without losing messages; reload restores both.
  - [ ] Session search filters by title/question text; groups show This Week/Last Week/Older correctly.
  - [ ] Gallery pills filter the 6 starters; My Prompts lists saved items and re-runs them.
  - [ ] At 390px: composer visible by default, panes open via toggles, no page-level horizontal scroll.

## Cross-Validation Phase (final)
- Live Vercel URL: all panes, session switch/search/persist, gallery run, all 8 demo questions + greetings, export, mobile 390px, zero console errors. Single overall review. No secrets.

## Out of scope
Prompt authoring/editing UI, session sharing, server-side persistence (`UserPreference`), charts (separate plan), voice input, backend changes.

## Rollback note
`git revert` the redesign commit(s) on `master` and push; prior single-pane chat code is fully replaced in-file, so rollback restores it wholesale.
