# CS-1813 Button Placement Audit

Platform-wide observation of button placement, positioning, alignment, hierarchy and ordering across the Caboodle web application.

- Spike: CS-1813 (caboodleservices.atlassian.net)
- Environment: https://caboodle-web-stg.caboodleservices.com (staging)
- Workspace used for the broker area: `484fd472-517b-4cdd-99dd-a414f6dc7248`
- Brand workspace used for the brand area: `e8c90677-0320-41e5-a37f-52a8014c2752` (Zucchini Beanie Demo Brand)
- Audit type: read-only UI inspection, no records created, edited or deleted
- Viewport: 1440 x 900 CSS pixels for every capture
- Date of inspection: 11 November 2026

---

## 1. Executive summary

The platform does not have a button placement standard today. Measured against a six-slot model that generalises the ticket's example (utility, destructive, secondary, action, export, filter), the platform is largely in order on the small pages and drifts where pages carry more buttons.

1. **38 of the 61 inspected pages already conform to the slot order.** Six break it, all in the same way: a lower-priority control placed to the right of a higher-priority one. Market Overview puts Export before the action, Distributor APL puts the action after Export, Products puts Delete between Upload and Add, Trade Spend Sandbox puts Resume after the primary, and the two SPINS reports put Remove after Export. The problem is not a missing convention, it is that extra buttons are inserted wherever there is room.
2. **Search and scope controls are the largest inconsistency.** All 11 brand listing pages put the search field at the far left of the toolbar (x = 65). Broker listings do not: Market Overview puts it at x = 585, File Repository at x = 818, Brand Retail Item Status at x = 862. Promo Notes has no search field and puts `Select year` at x = 856, immediately left of the action group.
3. **The reported confusion is about adjacency, not only order.** On `/promotional-notes` the year control sits inside the action group, one control to the left of `Add New Note`. The three buttons already match the agreed order; what fails is that the control which scopes the data set is nowhere near the left edge of the page. The same adjacency problem appears destructive-side on 7 pages, where a Delete or Remove button sits directly beside the primary action.

Three structural patterns are consistent and worth preserving: page-level actions are right-aligned; forms use Back at top-left plus the submit action at top-right; row-level actions live in the last table column. There are no sticky form footers, no modal footers observed, no floating action buttons, and no Save/Cancel pairs anywhere in the inspected scope.

Headline numbers:

| Measure | Value |
|---|---|
| Routes enumerated in the spike | 66 (the spike text says 87 but lists 66) |
| Routes inspected | 61 |
| Routes blocked | 5 |
| Tabs identified / inspected | 6 / 6 |
| Button instances documented | 1,510 |
| Distinct placement patterns observed | 9 of the 16 defined codes |
| Pages that break the slot order | 6 of 61 (on the other 38 with a group, slots are in order) |
| Pages with a destructive button beside the primary action | 7 |
| Pages missing Filter from the action row | 6 |
| Pages whose search or scope control is not at the far left | 4 |
| Cross-page inconsistencies identified | 10 genuine, 7 intentional differences, 4 usability gaps, 3 unverified items |
| Proposed standardization rules | 18 (12 core patterns documented here, 6 supporting rules in the standard) |

---

## 2. Scope and methodology

### 2.1 Source of scope

The Jira spike CS-1813 asks for a platform-wide audit to support one business rule. Two formulations exist in the ticket and they are not the same:

- The description (from the client, via Constance and Kate) lists: Search, Filter, Export, Action.
- The comment from Md. Tauhidur Rahman on 3 November states the agreed layout: **Search on the far left, and Action, Export, Filter on the far right, in that order, on every page**.

**This audit measures every page against the second formulation**, because it is the later statement and it is the one written as the platform standard. The four controls named in the ticket are one instance of a general rule, so they were expanded into a slot model that any page can be scored against:

```
[ Search / scope ]  ................  [ S1 utility ] [ S2 destructive ] [ S3 secondary ] [ S4 action ] [ S5 export ] [ S6 filter ]
```

- **S1 utility**: view toggles, sort, refresh, expand, overflow trigger
- **S2 destructive**: Delete, Remove, Force Delete, Delete selected
- **S3 secondary / record**: Edit, Versions, Submit, Revoke, Push to Approved, Link Banner, View notes
- **S4 action**: Add, Create, Upload, Import, Copy
- **S5 export**: Export, Download
- **S6 filter**: Filter, Range Filter, Reset

A page may use any subset of slots, in that order. S6 Filter is always right-most. This is what makes the rule hold on pages that carry eleven buttons as well as pages that carry one, which is the point the client made: the four controls were an example, not the whole requirement.

The discrepancy between the description and the comment is itself a finding worth resolving in the ticket before implementation starts: the two orders are reverses of each other for three of the four named controls. The slot model below follows the comment.

### 2.2 Method

Each route was opened as an authenticated user, in one browser tab, at a fixed 1440 x 900 viewport. For each route and each reachable tab the following was captured programmatically from the live DOM:

- The rendered page path, document title, page heading and on-screen heading stack.
- Every visible `button`, `[role=button]`, submit input, styled link button, `[role=tab]`, `[role=combobox]` and menu trigger.
- For each control: its label, tag, classes, disabled state, `aria-haspopup` value, bounding rectangle in document coordinates, whether any ancestor is `position: sticky` or `fixed`, and up to seven ancestor layout containers with their rectangles and justify-content.
- The main content region rectangle and any dialog rectangle.
- A full-page screenshot per route and per tab.

Classification was then derived from geometry and container context, and spot-checked against screenshots for representative pages (Market Overview, Products, Promo Notes, Product report, Distributor APL). Nothing was clicked except tabs and, in one case, an action button used to check whether it opens a modal (see section 9).

### 2.3 Deliberate exclusions

- No form was submitted, no record was created, no configuration changed.
- Dynamic routes were inspected only through records that already existed in the staging workspace.
- Routes that returned the application 404 page, or that need a record that does not exist, are marked **Blocked** rather than guessed at.

---

## 3. Route inspection coverage

### 3.1 Count reconciliation

The spike states "all 87 listed routes". The route list in the spike contains 66 route entries: 11 broker routes and 55 brand routes (4 general, 15 CRM, 8 product specification, 11 promotions, 11 reports, 6 data upload). This audit covers all 66 entries. Two pairs in the list are the same URL shape (`/promo-planning/[id]` and `/promo-planning/[promotionID]`, `/distributors/[deliveryMethodID]/banners` and `/distributors/[distributorID]/banners`); each pair was inspected with two different existing records so that layout differences between instances would surface.

### 3.2 Coverage

| Status | Count |
|---|---|
| Inspected | 61 |
| Partially inspected | 0 |
| Blocked | 5 |
| Not applicable | 0 |
| **Total** | **66** |

Blocked routes:

| ID | Route | Reason |
|---|---|---|
| BR-11 | `/brand-report-status-options` | Returns the application 404 page in this workspace. |
| GD-01 | `/{brandID}/` | Brand root returns 404; the brand workspace always resolves to `/dashboard`. |
| CR-10 | `/{brandID}/banners` | Returns the application 404 page; banners are reached through retailers and distributors, and through `/banners/products`. |
| CR-11 | `/{brandID}/banners/[bannerID]` | No record on the listing exposes a banner detail URL in this workspace, and creating one is out of scope. |
| CR-15 | `/{brandID}/pipeline/[taskID]` | The Pipeline list is empty in this workspace, so no task id exists to open. |

Tabs: 6 tabs were identified across the platform and all 6 were inspected (Promotional Management 4, Retail Reports 2). No other inspected route renders a tab set. Several pages use a segmented navigation instead (Categories / Products / Pricing, Products / Activities); those were treated as sub-navigation and each segment was opened as its own route where it has its own URL, otherwise the segment content was captured on the parent route.

Per-area coverage:

| Area | Routes | Inspected | Blocked |
|---|---|---|---|
| Broker | 11 | 10 | 1 |
| Brand / General | 4 | 3 | 1 |
| Brand / CRM | 15 | 12 | 3 |
| Brand / Product specs | 8 | 8 | 0 |
| Brand / Promotions | 11 | 11 | 0 |
| Brand / Reports | 11 | 11 | 0 |
| Brand / Data upload | 6 | 6 | 0 |

The full per-route record is in `CS-1813-Route-Inspection-Matrix.csv`.

---

## 4. Button placement classification

### 4.1 Codes used in this audit

The spike defines 16 codes. Nine were observed. The rest are absent from the platform, which is itself a finding.

| Code | Meaning | Instances | Where it actually appears |
|---|---|---|---|
| BP-01 | Page header, top-right | 288 | Card header or page header action clusters on 47 pages |
| BP-02 | Page header, top-left | 74 | Back buttons on detail, form and report pages |
| BP-03 | Page header, adjacent to title | 43 | Actions sitting between the heading and the right cluster (Promo Notes, Pricing, Simple Entries) |
| BP-04 | Above content, right-aligned | 174 | Card-level toolbars below the page header |
| BP-05 | Above content, left-aligned | 21 | Card-level left controls |
| BP-06 | Table toolbar | 400 | Grid toolbars, sort and column controls |
| BP-07 | Table/row level | 378 | Row action icons, per-row Edit, View, Delete |
| BP-08 | Form footer, right-aligned | 0 | Not present anywhere |
| BP-09 | Form footer, left-aligned | 0 | Not present anywhere |
| BP-10 | Modal footer | 0 | No modal opened during the audit |
| BP-11 | Sticky footer | 0 | No sticky action bar observed |
| BP-12 | Tab header / tab toolbar | 57 | Promotional Management, Retail Reports |
| BP-13 | Inline content action | 75 | Card bodies, calendar cells, chat composer |
| BP-14 | Overflow menu | 0 assigned (23 kebabs seen) | Kebab triggers were classified inside their own row or header group; they appear only on File Repository, Distributor banners, Retailer banners and File upload |
| BP-15 | Floating action | 0 | Not present |
| BP-16 | Other / custom | 0 (app chrome excluded) | Global header actions were excluded from page-level counts |

### 4.2 What the classification reveals

- **Right alignment is the one true convention.** Wherever a page has actions, they sit at the right edge of the page header or the card header. The only left-aligned header buttons are Back, and page titles.
- **Toolbar and row levels carry the most buttons.** 778 of 1,510 instances are table-level or row-level, which is where the placement question becomes a discoverability question rather than a styling question.
- **There is no form footer pattern.** Every form submits from the page header. Long forms (Add Product, 1,947 px tall; Edit Product, 1,986 px tall; Create Promotion, 4,098 px tall) keep the submit button at the top, so the primary action scrolls out of view.
- **No sticky action surfaces exist.** 340 buttons sit inside sticky containers, but those are grid headers and frozen columns, not action bars.

---

## 5. Findings by platform area

### 5.1 Broker area

The broker workspace presents module cards on the dashboard and then module-specific pages.

- **Dashboard (BR-01).** No page-level actions. The whole page is a card grid where each card is itself the action. Consistent and intentional.
- **Market Overview (BR-02).** Card header reads: title at left, `Search market overviews` at x = 585, then `Export` (green), `Add Log` (blue), `Remove Log` (disabled), `Filter` (outline) at the right. The group starts with Export instead of the action, so the sequence is `Export > Action > Filter`, and two competing emphases (green and blue) sit on one row. Search is not at the left edge.
- **Market Overview Report (BR-03).** `Export` then `Filter`, both right-aligned. No primary action.
- **Distributor APL (BR-04).** `Remove` first, then `Export`, `Upload`, `Add`, `Filter`. The two data actions (`Upload`, `Add`) come after Export, so the group reads `Export > Action > Filter`. A destructive action also occupies the leading slot.
- **Brand Retail Item Status (BR-05).** `Export` then `Filter`. Search sits at x = 862, inside the right half of the toolbar.
- **Promotional Management (BR-06).** Four calendar tabs (five captured states, including the default), all inspected. Tab-level toolbar carries `Submit`, `Revoke`, `Export`, `Filter` at the right; the tab strip itself is left-aligned under the card title. Actions change per tab but stay in the same right-aligned position, which is correct.
- **Brand Report (BR-07).** `Go to Category Review` and `Go to Brand Report` style navigation actions at top right of the page header, treated as primary.
- **Category Review and Category Review Calendar (BR-08, BR-09).** Consistent: heading left, one navigation action right, filters in the table toolbar.
- **File Repository (BR-10).** Drive-style header with `Expand My Drive`, `New folder`, `Upload`, and search at x = 818. This is the only page that uses a file-manager metaphor rather than a table toolbar, and its placement followed that metaphor rather than the platform convention.

Direction of travel for the broker area: the toolbar row is the right home for these actions, but the order inside the cluster and the search position are inconsistent between the five listing pages.

### 5.2 Brand area, general

- **Brand Dashboard (GD-02).** One action, `Ask Caboodle`, top right. Correct and minimal.
- **AI Assistant (GD-03).** No header actions; the composer is the action surface. Conversation actions (`New Chat`, `Delete conversation`) live in a left rail. Different pattern, justified by the interaction model.
- **Ask Caboodle (GD-04).** Back at top-left, `New Chat` at top-right, plus inline card actions. Acceptable.

### 5.3 Brand area, CRM

- **Contacts (CR-01).** `Delete`, `Add`, `Export` in that order, with search at the far left. The order is correct; the risk is that `Delete` sits directly beside `Add` with no gap control, and there is no Filter.
- **Distributors (CR-02).** Only `Add` in the header; search far left.
- **Distributor detail and banners (CR-03, CR-04, CR-05).** Back top-left, contextual actions (`Link Banner`) top-right. Consistent across the three.
- **Retailers and Retailers (all) (CR-06, CR-07).** `Sort by`, `Upload`, `Export` with search far left. No primary action in the header; the primary is per-row.
- **Retailer banners (CR-08, CR-09).** Back left, `Link Banner` right. Consistent.
- **Banners / Products (CR-12) and Regions (CR-13).** No header actions at all. The pages are read-only views, so the absence is defensible, but it means two adjacent routes look inert while their neighbours have toolbar actions.
- **Pipeline (CR-14).** `Delete selected` then `Add`. Bulk action to the left of the primary create, which is the reverse of the requested order.

### 5.4 Brand area, product specifications

- **Products (PS-03).** The busiest toolbar on the platform: `Force Delete`, `Upload`, `Delete`, `Add` (blue), `Export` (green) on the first toolbar row, then `List view`, `Grid view`, sort, `Sort by`, `Filter` wrapped onto a second row. Search is at the far left of the first row. A destructive action is first, `Add` is fourth, and Filter is on a different visual row from the actions it belongs with. Under the agreed order this page should read `Add > Export > Filter` on the right, with the destructive and utility controls to their left.
- **Categories (PS-01).** `Delete` then `Add`. Same destructive-first pattern, shorter group.
- **Pricing (PS-07).** `Delete`, `Add`, `Export`, search far left. The `Action > Export` tail matches the agreed order; Filter is absent.
- **Product detail (PS-04).** Back left, `Go to Retail Report`, `Edit` right. Good separation of navigation, cross-linking and the edit action.
- **Category detail (PS-02).** Back left, `List view`, `Filter` right. Filter is presented as a primary-styled toggle in the header, which is a styling misuse rather than a placement error.
- **Add Product (PS-06) and Edit Product (PS-05).** Back at top-left (y = 88), `Create` / `Update` at top-right (y = 194). The submit action is 106 px below the Back button, so the two ends of the same task do not share a baseline.
- **File upload (PS-08).** Drive-style header, same as File Repository.

### 5.5 Brand area, promotions

- **Promo Notes (PM-06).** The page from the client report. Visible order: `Select year` (x = 856), `Add New Note` (blue), `Export` (green), `Filter`. The three buttons already read in the agreed order; what fails is that `Select year` is a date input sitting immediately before the action group instead of at the left edge of the row, so the control that scopes the data set looks like the first step of the action sequence. That adjacency, not the button order, is what produced the reported mistake.
- **Promo Planning (PM-01).** `Remove` then `Add Simple Promotion`. Search far left, year search second field.
- **Promotional Calendar (PM-05).** `Submit`, `Revoke`, `Export`, `Filter`. Submit and Revoke are both strong; they are workflow states of the calendar, which justifies their prominence but not their position relative to Filter and Export.
- **Simple Entries (PM-07).** No header action cluster; actions sit inside the selected entry card.
- **Create Simple Promotion (PM-08).** `Back` left, `Validate` and `Submit to Approved Promotions` right at y = 88, then a content toolbar with `Copy`, `Export`, `Import` at y = 200. Two action rows, both right-aligned, with the submit above the import/export row.
- **Promo Planning Create (PM-02).** Wizard layout: `Clear Draft`, `Previous`, `Next Step` at top right, step indicator at the top left. Step navigation in the header is the right pattern for a 4,098 px wizard, but it means the primary action lives in the header while the step content is 3 screens long.
- **Promotion detail (PM-03, PM-04).** Back, `Remove`, `Select Promo Options` in the header. Same layout on both instances.
- **Trade Spend Sandbox (PM-10).** `Delete`, `Add New Promotion`, `Resume` with `Resume` as a separate emphasized control at the far right.
- **Trade spend detail (PM-11).** Back, `Edit version name`, `Versions`, `Push to Approved`, `Select Promo Options`. Five header actions, one of which (`Push to Approved`) is a workflow transition placed with the same weight as a view toggle.

### 5.6 Brand area, reports

Reports split into two families with different behaviour.

- **Report pages with a toolbar (RP-03, RP-08, RP-09).** `Export` then `Filter`, right-aligned, no primary action. Clean and repeatable.
- **Report pages with only a Back (RP-02, RP-05, RP-06, RP-07, RP-10, RP-11).** Navigation only, no actions, because the report is read-only. Defensible.
- **Monthly Report (RP-03).** `Back`, `Refresh`, `Import Actuals`. Import is the only emphasized action and it is a write operation placed next to a refresh. Refresh has no business being in the primary slot.
- **Product report (RP-04).** No header actions at all; the report renders a chart and grid with in-grid controls. The absence of Export on a report that visibly supports filtering is a discoverability gap.
- **Banner report (RP-02) and Retail Reports (RP-05).** Tabbed reports; tab strip left under the title, actions right. Consistent.

### 5.7 Brand area, data upload

- **KeHE, UNFI, SPINS (DU-01 to DU-03).** Drive-style upload surface, `Back` top left, `Upload` top right of the drop zone, table actions inline. The three pages are identical in layout, which is good.
- **Item Ranking Report (DU-04).** `Upload`, `Export`, `Remove` in the header, Upload first. Upload on a report page is odd placement: it belongs to the data ingestion task, not to the report reading task.
- **Stores Insight Report (DU-05).** `Upload`, `Export`, `Remove`, `Filter`, all four in one cluster, no grouping.
- **Distributor Sales Report (DU-06).** `Back` plus `Refresh`. Two navigation/utility actions with equal weight.

---

## 6. Findings by page type

### 6.1 Listing pages (18 routes, plus 3 broker grids)

Observed pattern across listings:

- Title at the top left of a card, in a card header row.
- Search field at the far left of the row beneath the title (brand pages) or somewhere in the middle of the header row (broker pages).
- Action cluster hard right.
- Filter either inside the cluster (most pages) or on a second row (Products).
- Row actions in the final column, icon only, 2 to 3 actions per row. The record listings show no overflow menu; the file and banner pages do, through a `More actions` kebab (23 instances across File Repository, Distributor banners, Retailer banners and File upload).
- Pagination bottom right, page-size selector to its right.

Deviations that matter: Broker search position (3 different x values), Products wrapping into two toolbar rows, and 7 pages placing a destructive button directly beside the primary action.

### 6.2 Detail pages (13 routes)

Strongly consistent: `Back` at top left (y = 88, x = 38), contextual actions at top right, tabs if any directly below the title. Both promotion detail instances and both banner detail instances matched exactly, which suggests a shared layout component.

Weakness: destructive actions (`Remove`) appear in the same cluster as view actions, with identical styling.

### 6.3 Form pages (4 routes)

- No footer. Submit action in the header at top right.
- `Back` doubles as cancel. There is no Cancel button anywhere in the platform.
- Submit sits 106 px lower than Back on Products Add/Edit, on the same baseline on Simple Entries Create.
- The longest form (Create Promotion, 4,098 px) keeps `Next Step` in the header only.
- The primary label describes the effect, not the action: `Create`, `Update`, `Validate`, `Submit to Approved Promotions`, `Push to Approved`. Inconsistent verb pattern on otherwise identical placement.

### 6.4 Report pages (13 routes)

Two sub-patterns: reports with a toolbar (`Export`, `Filter`) and reports with navigation only. Filter is always the last control in the cluster. Reports never have an Add action, except Item Ranking Report which has `Upload`.

### 6.5 Calendar pages (4 routes)

Tab or period navigation at the left, workflow actions at the right (`Submit`, `Revoke`), then `Export`, then `Filter`. The workflow pair is visually dominant, which is correct, and the tail of the group (`Submit > Export > Filter`) is already in the agreed order.

---

## 7. Cross-page inconsistencies

Each item below is evidence-backed. Where a difference is defensible it is labelled **Intentional**.

Result of the page-level check against the slot model: **38 pages consistent, 16 pages with at least one break, 7 with no page-level actions to compare, 5 blocked.** Findings by type: 6 pages break the slot order, 6 listings are missing Filter entirely, 4 place search or a scope control away from the left edge, and 7 put a destructive button directly beside the primary action. The per-page reasons are recorded in the `Consistency status` column of `CS-1813-Route-Inspection-Matrix.csv`.

### 7.1 Genuine inconsistencies

**I-1. Six pages put a control to the right of a lower-priority one.**
Scored against the slot model (utility, destructive, secondary, action, export, filter), the breaks are: Market Overview (`Export` before `Add Log`), Distributor APL (`Upload` after `Export`), Products (`Delete` after `Upload`), Trade Spend Sandbox (`Resume` after `Add New Promotion`), Item Ranking Report and Stores Insight Report (`Remove` after `Export`). Each is a control appearing out of slot, not a missing control. The same comparison shows 38 pages already conform, so the model is enforceable rather than aspirational.

**I-2. Six listings have no Filter at all.**
Contacts, Retailers, Retailers (all), Products, Pricing and Item Ranking Report all show `Action > Export` and stop there. Filtering exists on some of these pages through other affordances, so the row is incomplete rather than the function missing. A user cannot tell whether a listing has a filter until they look for it.

**I-3. Search is in three different horizontal bands, and one scope control is inside the action group.**
Brand listings: x = 65 (far left, 11 pages). Market Overview: x = 585. File Repository: x = 818. Brand Retail Item Status: x = 862. Promo Notes has no search field and places `Select year` at x = 856, immediately left of the action group, which is the arrangement the client reported.

**I-4. A destructive button sits directly beside the primary action on 7 pages.**
CR-01, CR-14, PS-01, PS-03, PS-07, PM-01 and PM-10 all place `Delete`, `Remove`, `Force Delete` or `Delete selected` in the slot immediately before `Add` or `Add New Promotion`, with nothing between them. The slot model puts destructive in S2 and the primary in S4, so a single mis-click lands on the destructive control instead of the create control. Products is the worst case: `Force Delete` and `Delete` bracket `Upload`, with `Add` immediately after.

**I-5. Two competing emphasis colours in one cluster.**
`Export` is rendered as a solid green button on 8 pages while `Add` is a solid blue button on the same row (BR-02, PS-03, PM-06 and others). Two primary-styled buttons compete on the same toolbar.

**I-6. Submit and Back do not share a baseline on forms.**
Back at y = 88, submit at y = 194 on Products Add/Edit. On Simple Entries Create they share y = 88. Same task type, two vertical alignments.

**I-7. Filter sometimes leaves the cluster.**
On Products, `Filter` wraps to a second toolbar row along with the view toggles and sort controls, while `Add`, `Export`, `Upload`, `Delete` and `Force Delete` stay on the first row.

**I-8. Workflow transitions share styling with view controls.**
`Push to Approved` (PM-11) and `Submit to Approved Promotions` (PM-08) are styled like ordinary secondary buttons next to `Versions` and `Validate`.

**I-9. Utility actions occupy primary slots.**
`Refresh` is a primary-styled button on Monthly Report and Distributor Sales Report; `Upload` leads the cluster on Item Ranking Report and Stores Insight Report.

**I-10. Empty-header pages next to action-heavy pages.**
Banners/Products and Regions have no header actions while their siblings in the same module have three or four. A user moving between them cannot predict whether actions exist.

### 7.2 Intentional, contextual differences (do not "fix")

| Difference | Why it is correct |
|---|---|
| Back at top-left on detail, form and report pages | Standard navigation affordance, separate from task actions |
| Row actions in the last column | Table convention, keeps the row scannable |
| Calendar cell actions inline | The date is the target; a toolbar would break the mental model |
| File Repository and File Upload using a drive header | The interaction is file management, not record listing |
| AI Assistant putting conversation actions in a left rail | The conversation is the content; the rail is the index |
| Step navigation in the header of Create Promotion | 4,098 px wizard; the header is the only always-visible surface |
| Reports with no actions | Read-only output; adding actions would imply capabilities that do not exist |

### 7.3 Potential usability improvements (not inconsistencies)

- The primary action is reliably the right-most element on listings, which is good, but on Products it is not the right-most and not the first. Normalising that alone would fix six pages.
- Destructive actions could move behind an overflow menu on listings where they currently sit first.
- A single emphasis colour per row would remove the green/blue competition.
- Two very long forms would benefit from a repeated submit at the bottom, which is a new pattern rather than a fix to an existing one.

### 7.4 Unverified observations

- Modal and drawer footers were not observed. The one attempt (`Add New Note` on Promo Notes) did not open a modal: it appended an inline draft row at the top of the table. No modal was opened elsewhere during the audit, so no modal footer pattern can be stated as fact.
- The audit ran in a broker account with admin scope. A brand-only user may see fewer actions on some pages; that was not tested.
- Empty states (Pipeline, Banners/Products) were inspected only in their empty form.

---

## 8. Screenshot references

Evidence is stored per area and route. Every capture in `CS-1813/evidence/` corresponds to a row in the route matrix by path.

```
CS-1813/evidence/
  Broker/
    Dashboard/default.jpg
    Market-overview/default.jpg
    Market-overview-report/default.jpg
    Distributor-apl/default.jpg
    Retail-apl/default.jpg
    Promotional-management/default.jpg + tab-1..tab-4.jpg
    Brand-report/default.jpg
    Category-review/default.jpg
    Category-review-calendar/default.jpg
    File-repository/default.jpg
  Brand/
    Dashboard/, Dashboard-ai/, Ask-caboodle/
    Contacts/, Distributors/, Distributors-Detail/, Distributors-Detail-Banners/, Distributors-DeliveryMethod-Banners/
    Retailers/, Retailers-All/, Retailers-Detail-Banners/, Retailers-All-Detail-Banners/
    Categories/, Categories-Detail/, Products/, Products-Detail/, Products-Add/, Products-Edit/, Pricing/, File-upload/
    Promo-planning/, Promo-planning-Create/, Promo-planning-Detail/, Promo-planning-Detail-B/, Promotional-calendar/,
    Promotional-notes/ (+ modal-add-note.jpg), Simple-entries/, Simple-entries-Create/, Simple-entries-Detail/,
    Trade-spend-sandbox/, Trade-spend-sandbox-Detail/
    Report/, Banner-report/, Monthly-report/, Product-report/, Retail-report/ (+ tab-1, tab-2),
    Sales-tracker/, Brand-market-overview-report/, Apl-report/, Apl-activity/,
    Category-review-brand/, Category-review-calendar-brand/
    Kehe/, Unfi/, Spins/, Spins-Item-ranking-report/, Spins-Stores-insight-report/, Distributor-sales-report/
```

Key evidence for the ticket:

| Observation | Screenshot |
|---|---|
| The reported Promo Notes layout (`Select year` adjacent to the action) | `CS-1813/evidence/Brand/Promotional-notes/default.jpg` |
| Inline draft row instead of a modal | `CS-1813/evidence/Brand/Promotional-notes/modal-add-note.jpg` |
| Destructive action leading a cluster | `CS-1813/evidence/Brand/Products/default.jpg` |
| Two competing emphasis colours | `CS-1813/evidence/Broker/Market-overview/default.jpg` |
| Form submit offset from Back | `CS-1813/evidence/Brand/Products-Add/default.jpg` |
| Workflow buttons mixed with view toggles | `CS-1813/evidence/Brand/Trade-spend-sandbox-Detail/default.jpg` |

Raw per-control geometry for every route and tab is in `CS-1813/raw/pages/`, and input/select positions are in `CS-1813/raw/controls/`. Those files carry the coordinates quoted in this report.

---

## 9. Exceptions and limitations

1. **Route count.** The spike says 87 routes and lists 66. All 66 were audited. If the intended list is longer, those routes need to be supplied.
2. **Five blocked routes** (section 3.2). All five are documented rather than skipped silently.
3. **One brand workspace.** The brand area was inspected in Zucchini Beanie Demo Brand. Layout is shared across brands, but per-tenant feature flags were not tested.
4. **No modal captured.** One action button was clicked to test whether it opens a modal. It did not: it added an unsaved draft row inline. The page was reloaded without saving and the row disappeared. No business data was written. No other modal was opened, so the modal section of the standard is proposed from platform conventions (antd) rather than from observation.
5. **Button count cap.** Each capture recorded up to 80 visible controls per page. Two calendar and grid pages (Promotional Management, Data Upload grids) hit that cap; their counts in the inventory are therefore lower bounds.
6. **Classification thresholds.** A control is treated as right-aligned when its right edge is within 28 px of its nearest layout container; as page-header when it sits above y = 340. Pages whose toolbar is unusually tall (Products, with its second toolbar row) can therefore be classified one band lower than a human would. Coordinates are included in the inventory so any classification can be re-checked.
7. **Screenshots are viewport-plus-scroll to 1,600 px.** Pages longer than that (Create Promotion, 4,098 px) are captured from the top only; controls below 1,600 px are still present in the raw JSON but not visible in the image.
8. **Slot scoring ignores non-page controls.** Of the 475 controls captured in the header band, 250 were excluded from the order check because they are not page actions: `Back` links, icon-only triggers, tab labels, rendered column-sort menu items and year values inside pickers. The 38/16 split refers to the remaining page-level controls. Those excluded labels are still present in the inventory, so the exclusion can be re-checked.

---

## 10. Recommended standardization rules

The full implementation-ready version is in `CS-1813-Button-Placement-Standard.md`, which defines 18 rules: R1 to R12 below are the core patterns, and R13 to R18 in the standard cover detail pages, tabs and modals. Summary of the core rules, each grounded in what was observed:

| # | Rule | Priority |
|---|---|---|
| R1 | One header surface per page: title left, actions right, on one baseline | High |
| R2 | Slot model: utility, destructive, secondary, action, export, filter, in that fixed order, any subset | High |
| R3 | Search and year scope controls move to the far left of the toolbar row, before all buttons | High |
| R4 | Exactly one primary-styled action per row; Export is secondary | High |
| R5 | Destructive actions sit in S2, never directly beside the primary action; overflow when the group gets long | High |
| R6 | Listings keep the primary create action within the right-hand group, immediately left of Export | Medium |
| R7 | Row actions stay in the final column, Read then Edit then Delete | Medium |
| R8 | Bulk actions appear only after a selection exists, at the left of the cluster | Medium |
| R9 | Forms keep Back top-left, submit top-right, and add a repeated submit at the end of forms longer than two viewports | Medium |
| R10 | Detail pages keep Back top-left and contextual actions top-right; workflow transitions are visually distinct from view toggles | Medium |
| R11 | Tab-level actions stay in the page header when they apply to all tabs; tab-specific actions go in a tab toolbar aligned right | Low |
| R12 | No new placement patterns: no sticky footers, no floating actions, no duplicate action rows without a stated reason | Low |

Where the standard must not be applied blindly: drive-style pages (File Repository, File Upload), calendar cells, the AI chat composer, and wizard step navigation are all cases where a different placement is the correct answer.

---

## 11. Prioritized implementation recommendations

**Priority 1, fix the reported problem (small, contained):**

1. `/promotional-notes`: move `Select year` out of the action group to the far left of the toolbar row, and keep `Add New Note` → `Export` → `Filter` as it is. The button order already matches the agreed standard; the year control is the defect. This satisfies the CS-1813 acceptance criteria on the page the client reported.
2. Correct the six slot-order breaks: Market Overview (`Add Log` before `Export`), Distributor APL (`Upload`, `Add` before `Export`), Products (`Delete` before `Upload`), Trade Spend Sandbox (`Resume` before `Add New Promotion`), Item Ranking Report and Stores Insight Report (`Remove` before `Export`).
3. Add the missing `Filter` control to the six pages that stop at Action > Export (Contacts, Retailers, Retailers all, Products, Pricing, Item Ranking Report) or confirm in writing that filtering is intentionally absent there.

**Priority 2, fix the left side of the toolbar (this is where the platform is least consistent):**

4. Move search to the left edge on Market Overview, File Repository and Brand Retail Item Status, matching the brand listing convention at x = 65.
5. Keep any second scope control (year, period) immediately after search on the left, never inside the action group.

**Priority 3, remove the highest-risk inconsistencies:**

6. Separate destructive controls from the primary action on CR-01, CR-14, PS-01, PS-03, PS-07, PM-01 and PM-10: move them one slot left (or into overflow) so nothing destructive sits directly beside `Add`.
7. Reduce emphasis to one primary per row. Export becomes secondary everywhere; the green solid style is retired or reserved for a single defined meaning.
8. Stop the toolbar from wrapping on Products; fix the group to one row and move view/sort controls to the utility slot, separate from the action group.

**Priority 4, structural consistency:**

9. Align form submit buttons to the same baseline as Back, and add a repeated submit at the end of forms over two viewports.
10. Give Banners/Products and Regions a consistent empty header (either an explicit read-only affordance or the same toolbar as their siblings).

**Priority 5, documentation and prevention:**

11. Publish the standard, add it to the design review checklist, and add a shared header component with fixed slots so future pages cannot drift.

No UI change was made during this spike. These are recommendations for follow-up tickets.

---

## Appendix A: page-level header action order as observed

`>` separates controls left to right in the top action row.

| ID | Page | Observed order | Slot check (S1 utility, S2 destructive, S3 secondary, S4 action, S5 export, S6 filter) |
|---|---|---|---|
| BR-02 | Market Overviews | Export > Add Log > Remove Log > Filter | **Break**: S5 before S4 |
| BR-03 | Market Overviews Report | Export > Filter | In order (S5, S6) |
| BR-04 | Distributor APL | Remove > Export > Upload > Add > Filter | **Break**: S3/S4 after S5 |
| BR-05 | Brand Retail Item Status | Export > Filter | In order (S5, S6) |
| BR-08 | Category Review | Go to Brand Report | In order (S3 only) |
| CR-01 | Contacts | Delete > Add > Export | In order (S2, S4, S5); destructive adjacent to primary |
| CR-02 | Distributors | Add | In order (S4 only) |
| CR-06 | Retailers | Sort by > Upload > Export | In order (S1, S4, S5); no S6 |
| CR-07 | Retailers (all) | Sort by > Upload > Export | In order (S1, S4, S5); no S6 |
| CR-14 | Pipeline | Delete selected > Add | In order (S2, S4); destructive adjacent to primary |
| PS-01 | Categories | Delete > Add | In order (S2, S4); destructive adjacent to primary |
| PS-03 | Products | Force Delete > Upload > Delete > Add > Export | **Break**: S2 after S4; destructive adjacent to primary; no S6 |
| PS-04 | Product detail | Back > Go to Retail Report > Edit | In order (S3 only) |
| PS-07 | Pricing | Delete > Add > Export | In order (S2, S4, S5); destructive adjacent to primary; no S6 |
| PS-08 | File upload | Expand My Drive > New folder > Upload | In order (S1, S3, S4) |
| PM-01 | Promo Planning | Remove > Add Simple Promotion | In order (S2, S4); destructive adjacent to primary |
| PM-05 | Promotional Calendar | Submit > Revoke > Export > Filter | In order (S3, S3, S5, S6) |
| PM-06 | Promo Notes | Add New Note > Export > Filter | In order (S4, S5, S6); scope control misplaced |
| PM-08 | Create Simple Promotion | Back > Validate > Submit to Approved Promotions | In order (S3 only) |
| PM-10 | Trade Spend Sandbox | Delete > Add New Promotion > Resume | **Break**: S3 after S4; destructive adjacent to primary |
| PM-11 | Trade spend detail | Back > Edit version name > Versions > Push to Approved > Select Promo Options | In order (S3 only) |
| RP-03 | Item Monthly Report | Back > Refresh > Import Actuals | In order (S1, S4) |
| RP-08 | APL Report | Export > Filter | In order (S5, S6) |
| RP-09 | APL Activity | Export > Filter | In order (S5, S6) |
| DU-04 | Item Ranking Report | Upload > Export > Remove | **Break**: S2 after S5; no S6 |
| DU-05 | Stores Insight Report | Upload > Export > Remove > Filter | **Break**: S2 after S5 |

## Appendix B: observed search / scope control positions

| Page | Control | x (px) | Width |
|---|---|---|---|
| Categories | Search category or product | 65 | 320 |
| Contacts | Search contacts | 65 | 320 |
| Distributors | Search distributors | 65 | 320 |
| Pipeline | Search plans | 65 | 238 |
| Pricing | Search prices | 65 | 416 |
| Products | Search products | 65 | 320 |
| Promo Planning | Search promos | 65 | 400 |
| Promo Planning | Search promos by year | 522 | 300 |
| Retailers | Search retailers | 65 | 384 |
| Retailers (all) | Search retailers | 65 | 384 |
| Simple Entries | Search by name | 65 | 400 |
| Trade Spend Sandbox | Search promos | 65 | 400 |
| Promotional Notes | Select year | 856 | 127 |
| File Repository (broker) | Search files | 818 | 172 |
| Market Overview (broker) | Search market overviews | 585 | 288 |
| Brand Retail Item Status (broker) | Search brand retail items | 862 | 288 |
