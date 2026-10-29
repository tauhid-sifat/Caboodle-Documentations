# Pipeline Wireframe Audit — `ideate-pipeline.html`

Audited against `design/DesignMD_Prompt.md` (36-section design-spec format).
Audited 2026-10-26. All line numbers refer to `design/wireframes/ideate-pipeline.html`.

> **Update 2026-10-26, pass 1 (ideate-pipeline.html):** a UX improvement pass was applied directly to this file. Fixed: P0-1 (status buckets now derived from `groupTasks`), P0-2 (migration map old2 → 3, AIT — UNFI Setup), P1-3 (search input is static HTML, focus kept), P1-4 (attachments now persist name/size metadata), P1-5 (chevron now toggles the notes panel), P1-6 (notes use a styled modal; validation errors are inline), P1-7 (due today is no longer overdue), P1-8 (reparenting excludes self + children), P1-9 (inline required-field errors). Also fixed: P2-10 (consistent escaping via `esc()`), P2-11 (done styling on calendar), P2-12 (btn-primary/btn-secondary classes), P2-16 (overdue banner in All Tasks), microcopy defects (priority labels, unified notes fallback, Fellow title, CJK leak, dev-note tooltip). Added: All Tasks cross-project view, localStorage persistence + Reset demo data, due-date sorting, task search hits in sidebar, drag-to-reschedule on the calendar (click-to-edit remains as the non-drag path), ESC/overlay-close + focus + `role="dialog"` on modals, keyboard access (`role`/`tabindex`/Enter+Space) on rows, checkboxes and chevrons, `aria-pressed` view toggle, seed dates relative to today, single-row parents, removed redundant status badges, scroll position preserved on re-render. Verified in-browser: zero console errors; quick-add, toggle, search, notes modal, calendar drag targets, and reload persistence all pass.

> **Update 2026-10-26, pass 2 (index.html):** the same UX treatment was applied to the **Task/Pipeline section of `design/wireframes/index.html`** (the broker dashboard wireframe, which is the real target per the user). Added there: localStorage persistence (projects, tasks, brand mappings, share members) + Reset demo data, evergreen seed dates (offsets from today), task search hits in the sidebar (search now covers task titles + notes) with static search input (focus hack removed), drag-to-reschedule on the calendar incl. drop-to-undated, inline validation instead of alert(), attachment metadata saved on save, `esc()` on all pipeline-rendered strings, priority labels High/Medium/Low, scroll preservation, keyboard access on rows/checkboxes/invites, `aria-pressed` on view/workspace toggles, `role="dialog"` + ESC/overlay close + field focus on all four pipeline modals. Kept intact: Share (header + per-project invite icons, editor/viewer roles), Personal/Brands workspace, KPI filters, Archive, status selects, done collapse. Verified in-browser: zero console errors; search focus, quick add, status change, share member add, calendar drag (Oct 21 → Nov 9), and reload persistence all pass.

**Verdict: Not ready for spec generation.** Two P0 bugs break the primary view. Fix those first, or the generated spec documents a list view that crashes on load and seed tasks in the wrong project.

---

## P0 — Blockers (fix before anything else)

### 1. List view crashes: `todos`, `inProgress`, `done` are never defined
- Lines 469–471 read `todos.length`, `inProgress.length`, `done.length`, but `renderGroupContent()` (427) only defines `groupTasks` (441). No globals or locals named `todos`/`inProgress`/`done` exist in this scope.
- Consequence: **every** list render throws `ReferenceError`. Init calls `selectGroup(groups[0].id)` (671), so the page loads dead:
  - Sidebar renders fine (renderGroups ran first).
  - Header title updates to the project name (436–437) but content stays on "No project selected".
  - Header buttons stay disabled because `selectGroup` aborts at the crash, before enabling them (420–422).
- Escape hatch that survives: the calendar path returns early (452–456), before the crash. So **Calendar renders, List never does**.
- Newly created projects (empty `groupTasks`) take the `if (!groupTasks.length)` branch (466) and also survive — only seeded/added-task projects crash.
- Likely intended fix: derive the three buckets from `groupTasks` by status, as the section colors already imply.

### 2. Seed migration routes UNFI tasks into "Broker Meetings & Follow-ups"
- Line 344: `const map={1:5,2:6,3:6,4:7,5:8,6:9};` with comment "old2 UNFI->6".
- Group ids: 1 AIT · 2–4 AIT sub-projects · 5 Q3 Category Reviews · 6 Broker Meetings & Follow-ups · 7 KeHE EDLP · 8 Distributor APL · 9 Marketing.
- Old "Group 2: UNFI" tasks (5 tasks, lines 311–315) land in **id 6 = Broker Meetings & Follow-ups**. Inferred intent: `AIT — UNFI Setup` (id 3) or the APL project. The comment even claims the wrong target. One-line fix in the map.

---

## P1 — Functional bugs

3. **Sidebar search loses focus every keystroke** — `oninput="renderGroups()"` (387) rewrites `list.innerHTML`, recreating the search input itself. One character typed, focus gone.
4. **Attachments are decorative.** File input + preview exist (236–237), but `saveTask()` hardcodes `files: []` for new tasks (598) and never updates `files` on edit (578–587); `editTask()` never restores the preview (519–525). Picked files are silently discarded.
5. **Task notes panel is unreachable.** `.task-notes` + `.open` CSS (111–113) and the panel div (500) are created, but no code ever toggles `.open`. The `t-expand` chevron (498) opens the edit modal instead — same as clicking the row body. Dead affordance with a misleading icon.
6. **Native `prompt()` and `alert()` bypass the modal system.** Project notes edit via `prompt()` (532); sub-project depth validation via `alert()` (650). Inconsistent with the styled modal system, unstyleable, and the prompt fallback writes different copy than the notes section default (see microcopy audit).
7. **Today counts as overdue.** `dueObj = new Date(due + 'T00:00:00')`, `overdue = dueObj < now` (481–483). A task due today is flagged overdue all day. Needs `< start-of-today`.
8. **Project reparenting validation gap.** Editing a top-level project lists all parents including itself (639–640 passes `null`, so no exclusion); a project can be re-parented to itself or into its own child's parent chain. Only the 1-level-depth rule is checked (650).
9. **Silent no-op on empty required fields.** `saveTask` (576–577) and `saveGroup` (645–646) return without message if the title is empty; the modal stays open with no feedback. No required-field marking exists.

---

## P2 — Consistency and quality

10. **Escaping is inconsistent.** Group notes are escaped (450: `replace(/</g,'&lt;')`), but task titles and notes are injected raw into HTML (490, 500). Same trust boundary, different treatment.
11. **Done tasks look identical to open ones on the calendar.** Line 375 adds class `done`, but no `.pipeline-cal-task.done` CSS exists.
12. **Token duplication via inline styles.** Modal footer buttons (241–242, 267–268), quick-add bar (459–463), and calendar nav buttons (367) re-declare colors/radii inline instead of reusing the classes defined for identical elements.
13. **Parent project name rendered twice** — `.group-parent` header row and `.group-item` row both show the name (398–399). Unusual two-row pattern; confirm intentional.
14. **No persistence.** All state is in-memory; no localStorage, no backend. Reload discards everything. For the spec: data lifecycle = session-only, persistence **Not specified in mockup**.
15. **No delete for tasks or projects anywhere.** DesignMD §4 flows: delete/confirmation flows are unevidenced.
16. **No feedback on mutation.** No toasts (§19 → not present); saves just re-render.
17. **No task-level search/filter/sort/pagination.** Search exists only for projects in the sidebar; the list has no filter chips, date range, or applied-filter UI (§11 largely not applicable).
18. **Modal dismissal is button-only.** No ESC, no overlay-click close, no focus management.

---

## Accessibility gaps (DesignMD §27)

- Interactive divs without keyboard access: `.group-item`, `.group-parent`, `.t-check`, `.t-body`, `.t-expand`, `.ns-hdr` — no `tabindex`, no `role`, no Enter/Space handling.
- `.t-check` is a visual checkbox: needs `role="checkbox"` + `aria-checked`.
- Modals: no `role="dialog"`, `aria-modal`, `aria-labelledby`; focus is not moved in or restored.
- View toggle: active state is visual only — needs `aria-pressed`.
- Icon-only controls `‹`, `›`, `✕` are text glyphs with no accessible name.
- Priority is encoded by color + border only; font sizes down to `0.6rem` (priority badge) and `0.65rem` (calendar tasks, counts) are likely sub-contrast and sub-readable.

---

## Microcopy audit (DesignMD §25 — verbatim capture)

All strings below are Observed, verbatim from the file.

| Component | Exact text |
|---|---|
| Sidebar h1 | `Pipeline` |
| Sidebar sub | `Projects organize your tasks` |
| Search placeholder | `Search projects` |
| Sidebar foot button | `New Project` |
| Header title (empty) | `Select a project` |
| Header sub (empty) | `Choose a project from the sidebar to view its tasks` |
| View toggle | `List` / `Calendar` |
| Header buttons | `Notes` · `Add Task` · `Edit` |
| Toggle tooltip | `Switch between list and calendar` |
| Notes button tooltip | `Project notes — top near Add Task as requested` |
| Main empty state | `No project selected` / `Pick a project from the sidebar or create a new one` |
| Notes section header | `Project Notes` + `Edit` |
| Notes default body | `No notes yet — click Notes in the header (next to Add Task) or Edit here to add context.` |
| Quick add placeholder | `Quick add task — press Enter` |
| Quick add button | `Add` |
| Tasks empty state | `No tasks yet` / `Type above and press Enter to add your first task` |
| Section headers | `To Do (n)` · `In Progress (n)` · `Done (n)` |
| Priority badge (raw value) | `high` / `med` / `low` |
| Status badge | `In Progress` / `To Do` |
| Task notes empty | `No notes` |
| Calendar header | `{Month YYYY} — {project name}`, `Hide done (n)`, `Today`, `‹`, `›` |
| Day names | `Sun Mon Tue Wed Thu Fri Sat` |
| Task modal title | `Add Task` / `Edit Task`; save button `Add` / `Save` |
| Task modal labels | `Title` · `Status` · `Priority` · `Assignee` · `Due Date` · `Notes` · `Attachments` |
| Task modal placeholders | `e.g., Follow up with Nugget buyer` · `Name` · `Add notes...` |
| Task modal options | Status: `To Do`/`In Progress`/`Done` · Priority: `Low`/`Medium`/`High` |
| Project modal title | `New Project` / `Edit Project`; save button `Create` / `Save` |
| Project modal labels | `Project Name` · `Parent Project (optional)` · `Description` |
| Parent select option | `No parent — top-level project` |
| Parent hint | `Leave as "No parent" for a top-level project. Select a parent to create a Sub-Project (1 level, like Jira sub-tasks).` |
| Description placeholder | `Optional description...` |
| Native dialog (unstyled) | prompt: `Edit group notes:` · alert: `Sub-projects can only be 1 level deep.` |
| `<title>` | `Pipeline Ideation — Fellow-style` |
| prompt() fallback body | `No notes yet. Click "Edit" to add group-level notes.` |

### Microcopy defects
- **Priority badge shows raw enum values** (`high`/`med`/`low`, line 494) while the modal uses `Low`/`Medium`/`High`. Two labels for one concept.
- **Two different default-notes strings** (notes section vs prompt fallback — see table above).
- **Dev annotation leaked into user-facing tooltip**: `Project notes — top near Add Task as requested` (170) is a build note, not UI copy.
- **CJK characters leaked into seed copy**: `Send pricing提案.` (318, "提案" = "proposal").
- **Competitor name in `<title>`**: `Pipeline Ideation — Fellow-style` (6). Conflicts with the DesignMD constraint "Do not reference or invent any other product." Must be renamed before the spec cites it.

---

## DesignMD 36-section readiness

| Readiness | Sections | Notes |
|---|---|---|
| Fully evidenced | 1, 2, 5, 7, 10, 15, 17, 20, 25, 28, 29, 31, 33, 34, 35, 36 | Inventory, buttons, badges, modals, copy all extractable |
| Partially evidenced | 3, 4, 6, 9, 12, 13, 14, 16, 21, 22, 24, 30 | Some behaviors broken or silent (list view crash, no delete flow, status sections ≠ table module, pagination only calendar nav, validation silent) |
| Not applicable | 11 (task filters/chips/date-range), 19 (toasts), 23 (roles/permissions) | Say "not applicable/not present," do not invent |
| Not specified | 26 (responsive — no media queries, fixed 320px sidebar), persistence/API, i18n, multi-user | Mark "Not specified in mockup" |

---

## Conflicts with the DesignMD's own constraints

- **Source-of-truth ambiguity**: the DesignMD says code wins over mockups; here the HTML is both. Spec must treat the single HTML file as both artifact and implementation.
- **Internal naming vs UI copy**: code says `group` everywhere (`groupId`, `groupModal`, `openGroupNotes`, `quickAddTask`); UI copy says Project/Task. Spec should use Project terminology and note the rename (HTML comments already say "renamed from Plans/Groups", 141, 247).
- **Dev-facing debris that must not enter the spec**: HTML comments with decision rationale (148, 342–345, 425, 445), the "as requested" tooltip, and the Fellow reference.

## Minimum fix list before running the DesignMD spec pass

1. Define the three status buckets in `renderGroupContent` (unblocks list view and init).
2. Correct the migration map for old group 2 (UNFI).
3. Fix sidebar search focus loss (render list only, or restore focus).
4. Either wire attachments and the notes-expand panel, or remove both from the UI before spec'ing them.
5. Rename `<title>`; replace native prompt/alert with modal flows; harmonize priority labels.
