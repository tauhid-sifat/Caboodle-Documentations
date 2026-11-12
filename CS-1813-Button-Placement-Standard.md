# CS-1813 Button Placement Standard

A practical placement standard for the Caboodle web application, derived from the platform-wide audit in `CS-1813-Button-Placement-Audit.md`. Every rule below is backed by pages that already do it, pages that break it, or both.

Scope: page-level actions, listing toolbars, row actions, form actions, detail-page actions, tab actions, modal actions. Out of scope: button colour, size, radius and typography, except where colour carries hierarchy meaning (rule R4).

---

## 0. The one-line rule

**Search and scope controls on the far left, then Action, Export, Filter on the far right, all on one baseline, with exactly one primary button per row.**

This is the CS-1813 rule as agreed in the ticket comment of 3 November. Everything else in this document exists to make it hold on every page type.

Note: the ticket description lists a different order (Search, Filter, Export, Action). The comment is the later statement and is the one this standard implements. If the description is the intended order, R2 and the slot order below are reversed; that must be settled before implementation.

---

## 1. Vocabulary

| Term | Meaning |
|---|---|
| **Toolbar row** | The horizontal band directly below the page or card title that holds search, filters and page-level actions |
| **Action cluster** | The right-aligned group of buttons inside the toolbar row |
| **Scope control** | A control that changes the whole data set: year selector, reporting period, region, distributor. Behaves like search, not like a filter |
| **Primary action** | The one action the page exists to perform, e.g. `Add`, `Create`, `Submit` |
| **Destructive action** | Anything that removes or overwrites: `Delete`, `Remove`, `Force Delete` |
| **Workflow transition** | A state change on a record: `Submit`, `Revoke`, `Push to Approved` |

Slot order, left to right:

```
[ title ]   [ search ] [ scope ]    ........    [ S1 utility ] [ S2 destructive ] [ S3 secondary ] [ S4 action ] [ S5 export ] [ S6 filter ]
```

The six right-hand slots are fixed. Any page uses a subset of them, in this order, and S6 Filter is always right-most.

---

## 2. Page headers

### R1. One header surface, one baseline

**Rule.** A page has exactly one toolbar row. Title on the left, controls and actions on the right, all vertically centred on the same baseline. Cross-linking and navigation actions (`Go to Brand Report`, `Back`) sit in that same row, never in a second row above it.

**Rationale.** The audit found 53 of 61 inspected pages rendering a right-aligned page or card header action group, which proves the convention already holds. What breaks it is the second row: Products wraps `List view`, `Grid view`, sort, `Sort by` and `Filter` onto a row below `Force Delete / Upload / Delete / Add / Export`, so Filter visually belongs to a different group than the actions it filters. Similarly, Products Add puts `Back` at y = 88 and `Create` at y = 194.

**Do.**
- Market Overview and Market Overviews Report: title left, cluster right, one row.
- Category Review: heading left, single navigation action right.

**Don't.**
- Products: two action rows with Filter on the lower one.
- Products Add: Back at y = 88 and Create at y = 194.

**Exceptions.** None. A page that genuinely needs two bands should promote the second band to a tab toolbar (R11) so it is labelled as a different scope.

**Priority.** High.

### R2. The slot model: one order, any number of buttons

**Rule.** Every page-level control belongs to exactly one slot, and the slots always appear left to right in this order. A page may use any subset of slots; it may not reorder them. Extra buttons are added to their slot, never inserted wherever there is room.

| Slot | Belongs here | Examples observed |
|---|---|---|
| **S1 Utility** | Controls that change how the view is displayed: view toggles, sorting, refresh, expand, overflow trigger | `List view`, `Grid view`, `Sort by`, `Refresh`, `Expand My Drive`, `More actions` |
| **S2 Destructive** | Anything that removes or overwrites | `Delete`, `Remove`, `Force Delete`, `Delete selected`, `Remove from Calendar` |
| **S3 Secondary / record** | Actions on the current record that are not the page's main task, and workflow transitions | `Edit`, `Link Banner`, `Versions`, `Resume`, `Submit`, `Revoke`, `Push to Approved`, `Select Promo Options`, `View notes`, `Go to Brand Report` |
| **S4 Action** | The page's main task | `Add`, `Add New Note`, `Add Simple Promotion`, `Create`, `Upload`, `Import Actuals`, `Copy` |
| **S5 Export** | Takes data out of the page | `Export`, `Download` |
| **S6 Filter** | Narrows the current data set | `Filter`, `Range Filter`, `Reset` |

The four controls named in CS-1813 are simply S3/S4, S5 and S6. The order holds whether a page shows four buttons or eleven.

**Rationale.** This is the general form of the CS-1813 request. The audit found pages carrying up to eleven page-level controls (Products) next to pages carrying one (Distributors), and the placement of the extra controls is what makes the platform feel inconsistent, not the core three. Scoring all 61 inspected pages against the slot order gives 38 consistent, 16 with at least one break, and 7 with no page-level actions. The six order breaks are all a control appearing to the right of a lower-numbered slot: Market Overview (`Export` before `Add Log`), Distributor APL (`Upload` after `Export`), Products (`Delete` after `Upload`), Trade Spend Sandbox (`Resume` after `Add New Promotion`), Item Ranking Report and Stores Insight Report (`Remove` after `Export`).

**Do.** Promo Notes (`Add New Note > Export > Filter`), Promotional Calendar (`Submit > Revoke > Export > Filter`), Retailers (`Upload > Export`), Products if reordered (`Add > Export > Filter`, with `Force Delete`, `Upload`, `Delete` to the left).

**Don't.** Market Overview, Distributor APL, Products, Item Ranking Report, Stores Insight Report: in each case a slot-N control appears to the right of a slot-(N+1) control.

**Exceptions.** Calendar workflow pages put two state changes in S3 (`Submit > Revoke`). Report pages with no action use only S5 and S6. Drive-style pages (File Repository, File Upload) use S1 and S4 only.

**Adding a control that fits no slot.** Put it behind the overflow trigger in S1 and leave the tail intact. Do not invent a new position between existing slots. If the control genuinely needs a permanent slot, amend this table first.

**Priority.** High.

### R3. Search and scope controls go far left

**Rule.** A search field, and any control that scopes the data set (year, period, region), sits at the left edge of the toolbar row, before every button. If both exist, search is first, scope second.

**Rationale.** All 11 brand listing pages already put search at x = 65 (the card's left padding). Broker pages do not: 585, 818 and 862. Promo Notes replaces search with `Select year` at x = 856, immediately left of the action cluster, which is exactly the situation the client reported: the control that scopes the data set looks like part of the action group.

**Do.** Products, Categories, Contacts, Retailers, Pricing, Promo Planning, Simple Entries, Trade Spend Sandbox, Pipeline: search at x = 65.

**Don't.** Promo Notes (`Select year` at x = 856), Market Overview (x = 585), File Repository (x = 818), Brand Retail Item Status (x = 862).

**Exceptions.** A scope control that only affects one card in a multi-card page may sit in that card's own header. It must still be the left-most control of that header.

**Priority.** High. This is the rule that resolves CS-1813 on Promo Notes.

### R4. One primary per row

**Rule.** Exactly one button per row carries primary emphasis. Export is always secondary. Destructive actions are never primary.

**Rationale.** Market Overview and Products both show a solid green `Export` beside a solid blue `Add`, so two controls claim to be the next step. Monthly Report makes `Refresh` primary while `Import Actuals` is secondary.

**Do.** Product detail: `Edit` is the only emphasized button. Brand Dashboard: `Ask Caboodle` is the only emphasized button.

**Don't.** Market Overview (`Export` green plus `Add Log` blue), Products (`Add` blue plus `Export` green), Monthly Report (`Refresh` strong, `Import Actuals` weak).

**Exceptions.** A page whose purpose is two distinct tasks may have two primaries, but they must be separated into two groups with a visible divider or heading.

**Priority.** High.

### R5. Destructive actions sit in S2, never next to the primary

**Rule.** `Delete`, `Remove`, `Force Delete` occupy the destructive slot, immediately left of the secondary controls. They are never adjacent to the primary action and never inside the action-export-filter tail. When a page has more than four controls to the left of the action, the destructive controls move into the overflow menu in S1.

**Rationale.** Moving destructive controls out of the first position is not enough on its own: seven pages place a destructive button directly beside the primary create (`Delete > Add` on Categories, Contacts, Pricing; `Force Delete > Upload` on Products; `Remove > Add Simple Promotion`; `Delete > Add New Promotion`; `Delete selected > Add` on Pipeline). A single-slot gap, or an overflow menu, removes the mis-click risk without hiding the action.

**Do.** Trade spend detail: `Remove` after `Back` and left of the view actions. File and banner pages: destructive row actions inside the `More actions` menu.

**Don't.** Products, where `Force Delete` and `Delete` bracket `Upload`, with `Add` immediately after.

**Exceptions.** Row-level delete inside a kebab is already the safe pattern; keep it.

**Exceptions.** Row-level delete inside an overflow menu is already the safe pattern; keep it.

**Priority.** High.

---

## 3. Listing pages

### R6. The primary create action anchors the group

**Rule.** On a listing page the primary create action (`Add`, `Add New Note`, `Add Simple Promotion`) sits immediately left of `Export`, is the only primary-styled button in the group, and therefore always appears at the same distance from the right edge (two slots in).

**Rationale.** It is the page's purpose and the only action that does not depend on a selection. Anchoring it to the fixed tail means its position never changes, however many utilities or destructive actions the page carries to its left.

**Do.** Promo Notes, Stores Insight Report, Item Ranking Report: `Action > Export > ...` with the action in the anchor slot.

**Don't.** Products (Add is fourth of five), Item Ranking Report (`Upload` takes the anchor slot for data ingestion, not for the report).

**Exceptions.** Listings with no create capability (Banners/Products, Regions) show no group at all. That is correct, but should be visually explained by an explicit read-only hint rather than an empty space.

**Priority.** Medium.

### R7. Row actions stay in the final column

**Rule.** Row-level actions live in the last table column, icon-only, in the order Read (`View`) then `Edit` then destructive (`Delete`). Destructive row actions go into a kebab menu when there are three or more.

**Rationale.** Universal across the 21 list-style pages inspected; this is the one pattern that never drifted. Keeping it prevents the grid rework that a different choice would force.

**Do.** Market Overview (view and edit icons in the Action column), retail and APL grids.

**Exceptions.** Calendar cells, where the cell itself is the target.

**Priority.** Medium (codify, no change needed).

### R8. Bulk actions appear after selection

**Rule.** Bulk actions (`Delete selected`) appear only when at least one row is selected, at the left of the cluster, and the primary create action stays right-most.

**Rationale.** Pipeline currently shows `Delete selected` as the first header control with nothing selected, which reads as an always-available destructive action.

**Do.** Products shows `Delete` in a disabled state until a selection exists; that is the pattern to generalise, with the action placed after Filter and Export.

**Exceptions.** None.

**Priority.** Medium.

### R9. Filters open from the cluster, never from a separate row

**Rule.** `Filter` is a button in the cluster that opens a popover or drawer. It is not a row of inline controls and never sits on a second toolbar row.

**Rationale.** Products puts Filter on a second row with view toggles, which makes filtering look like a display preference.

**Priority.** Medium.

---

## 4. Forms

### R10. Back left, submit right, same baseline

**Rule.** Form pages use `Back` at the top left and the submit action at the top right, both on the same baseline. There is no Cancel button: `Back` is cancel, and leaving the page discards unsaved input after confirmation.

**Rationale.** This is already the platform pattern on all five inspected forms; it just needs alignment. Products Add and Edit place submit 106 px below Back; Simple Entries Create aligns them at y = 88.

**Do.** Simple Entries Create: `Back` and `Submit to Approved Promotions` on one line, plus an in-form toolbar for `Copy`, `Export`, `Import`.

**Don't.** Products Add and Edit: submit on a lower baseline.

**Exceptions.** Wizards (Create Promotion) keep step navigation in the header, but the step controls must sit on the same baseline as `Back`.

**Priority.** Medium.

### R11. Long forms get a repeated submit

**Rule.** A form taller than roughly two viewports (1,800 px) repeats the submit action at the end of the form, in the same visual style, aligned right.

**Rationale.** Create Promotion is 4,098 px tall; Products Add and Edit are close to 2,000 px. With the submit only in the header, users at the bottom of a long form must scroll back to act.

**Do.** No page does this today. This is the one new pattern the standard introduces.

**Exceptions.** Single-screen forms (Simple Entries Create, 900 px) do not need it.

**Priority.** Medium.

### R12. Submit labels use a verb plus object

**Rule.** Submit labels are `Create product`, `Update product`, `Submit promotion`. Not `Create`, `Update`, `Validate`, `Submit to Approved Promotions` mixed on the same screen.

**Rationale.** Simple Entries Create currently offers `Validate` and `Submit to Approved Promotions` with the same weight and no way to tell which one finishes the task.

**Priority.** Low.

---

## 5. Detail pages

### R13. Back left, contextual actions right, view toggles separated

**Rule.** Detail pages keep `Back` at top left. Contextual actions (`Edit`, `Link Banner`) sit at top right. Workflow transitions (`Push to Approved`, `Submit`) are visually distinct from view toggles (`Versions`, `Select Promo Options`) and come after them.

**Rationale.** Detail pages are already the most consistent page type (12 inspected, one shared layout). The weak point is Trade spend detail, which puts five controls of three different kinds in one undifferentiated cluster.

**Do.** Product detail: `Back` / `Go to Retail Report` / `Edit`.

**Priority.** Medium.

### R14. Destructive actions on detail pages are never primary and never first

**Rule.** `Remove` sits after the view actions, or in an overflow menu.

**Rationale.** Promotion detail and Trade spend detail both place `Remove` second, directly after `Back`.

**Priority.** Medium.

---

## 6. Tabs

### R15. Page-wide actions stay in the page header; tab-specific actions go to a tab toolbar

**Rule.** If an action applies to every tab, it stays in the page header. If it applies only to the active tab, it moves into a tab toolbar immediately below the tab strip, right-aligned, using the same cluster order as R2.

**Rationale.** Promotional Management changes the available actions per tab but keeps them in the page header, which works because the header is clearly the page's surface. Retail Reports uses two tabs with different toolbars and also keeps them in the header. Both are acceptable while the actions are few; the rule prevents a tab with six tab-specific actions from dumping them all into the page header.

**Do.** Promotional Management (tab actions in the header, same position across all five tabs).

**Priority.** Low.

### R16. The tab strip is left-aligned and never contains actions

**Rule.** Tabs are navigation, never actions. No action button may sit inside the tab strip.

**Rationale.** Consistent today; codify to prevent drift.

**Priority.** Low.

---

## 7. Modals and drawers

### R17. Footer: cancel left of confirm, both right-aligned

**Rule.** Modal and drawer footers place the dismiss action and the confirm action together at the bottom right, dismiss first, confirm second and primary-styled. Destructive confirms state the object by name: `Delete note "KEHE National Plan"`.

**Rationale.** No modal was opened during this audit, so this rule is proposed from the antd primitives the platform already uses (`ant-modal-footer`) rather than from observation. It must be confirmed against a modal before it is enforced.

**Do (to verify).** Any future modal opened during a read-only session.

**Priority.** Low, pending verification.

### R18. Do not use a modal for a one-field inline action

**Rule.** Actions that add a single row to a table (Promo Notes `Add New Note`) create an inline draft row at the top of the table and put focus in its first cell. No modal.

**Rationale.** This is what the platform actually does today, and it is faster than a modal for a table-shaped task. The problem observed is not the inline row, it is that the year scope is chosen away from the row.

**Priority.** Low (codify the existing behaviour).

---

## 8. Do and Don't, at a glance

**Do**

- Put search and year scope at the far left of the toolbar row (x = card padding).
- Keep one toolbar row, one baseline, one primary button.
- Assign every button to a slot and keep S1 to S6 in order.
- Keep Filter right-most and Export immediately left of it.
- Put `Back` top-left on every non-listing page.
- Put row actions in the final column, Read then Edit then Delete.
- Repeat the submit action on forms longer than two viewports.
- Use a tab toolbar when actions are tab-specific.
- Send unassigned controls to the overflow menu in S1.

**Don't**

- Insert a control between the fixed slots because there is space.
- Put `Export` or `Filter` to the left of the action.
- Place a destructive button immediately beside the primary action.
- Give `Export` a solid green primary style beside a blue `Add`.
- Put Filter on a second row with view toggles.
- Move search into the middle of the header on broker pages.
- Put `Select year` next to the action group.
- Mix `Validate`, `Submit to Approved Promotions` and `Create` in one header.
- Add sticky footers, floating buttons or kebab-only headers without a stated reason.

---

## 9. Decision framework

Answer in order. The first match wins.

1. **Is the control a navigation affordance (Back, breadcrumb, cross-link)?**
   Top left of the page header. Do not style it as a button. (`Go to ...` cross-links are not navigation affordances here: they are S3.)
2. **Is it search?**
   Far left of the toolbar row.
3. **Does it change the whole data set (year, period, region)?**
   Next to search, still on the left of the toolbar row. Treat it as a scope control, not a filter.
4. **Does it only change how the view is displayed (sort, view toggle, refresh, expand)?**
   S1, the left end of the right-hand group. The overflow trigger also lives here.
5. **Does it remove or overwrite data (Delete, Remove, Force Delete)?**
   S2. Never adjacent to S4.
6. **Does it act on the record or change its state (Edit, Versions, Submit, Revoke, Push to Approved, Link Banner)?**
   S3.
7. **Is it the page's main task (Add, Create, Upload on an upload page, Import)?**
   S4, primary style, the only primary on the row.
8. **Does it take data out (Export, Download)?**
   S5, secondary style.
9. **Does it narrow the current data set (Filter)?**
   S6, the right-most control in the row.
10. **Does it apply to one row only?**
    Final table column, icon only, Read then Edit then destructive.
11. **Does it apply to one tab only?**
    Tab toolbar below the tab strip, right-aligned, same slot order.
12. **Does it apply to the whole form?**
    Page header, top right, same baseline as Back.
13. **Fits no slot?**
    Put it behind the overflow trigger in S1 and amend the slot table before making it permanent.

---

## 10. Adoption plan

| Step | Action | Effort | Effect |
|---|---|---|---|
| 1 | Rewrite the Promo Notes toolbar: `Select year` to the far left, keep `Add New Note > Export > Filter` | Small | Closes the CS-1813 acceptance criteria |
| 2 | Fix the two wrong sequences: Market Overview (`Add Log` before `Export`), Distributor APL (`Upload`, `Add` before `Export`) | Small | Makes the tail order universal |
| 3 | Add the missing `Filter` to the six pages that stop at Action > Export, or document why filtering is absent | Small | Completes the group |
| 4 | Move search to the left edge on Market Overview, File Repository and Brand Retail Item Status | Small | Removes the largest left-right inconsistency |
| 5 | Extract a shared `PageToolbar` component with fixed slots: search, scope, utilities, destructive, action, export, filter | Medium | Prevents drift structurally |
| 6 | Move destructive actions out of the leading slot on the 8 affected pages | Medium | Removes the highest-risk inconsistency |
| 7 | Align form action baselines and add the repeated submit to the two long forms | Small | Completes the form pattern |
| 8 | Add the checklist to design review | Small | Keeps the standard alive |

The 16 pages flagged by the audit, with the reason:
slot order (BR-02, BR-04, PS-03, PM-10, DU-04, DU-05); missing Filter (CR-01, CR-06, CR-07, PS-03, PS-07, DU-04); search not at the left edge (BR-02, BR-05, BR-10, PM-06); destructive beside the primary (CR-01, CR-14, PS-01, PS-03, PS-07, PM-01, PM-10).
