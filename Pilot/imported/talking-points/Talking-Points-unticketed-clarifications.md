---
type: Document
module: talking-points
jira: []
status: draft
last_verified: 2026-10-14
related_wiki: ../../wiki/client-decisions-open-questions.md
---

# Talking Points — Clarify Unticketed Requirements (for Constance)

**Purpose:** Get details from Constance on the requirements that have **no Jira ticket** so we can create well-scoped tickets.
**Prep note:** For each item, we list the requirement and the specific questions to ask. Where a related deliverable/ticket exists, it's referenced so we can avoid re-explaining the background.

---

## 1. Broker Dashboard

### 1.1 Dashboard — "My tasks / contact name" filter
- **Context:** We have a Broker Dashboard wireframe with a timeline + task board. Requirement: user-scoped view.
- **Questions:**
  - Does the user filter tasks by *their own created tasks* only, or also by *tasks assigned to them*?
  - Is the filter a saved preference (persists on login) or just an on-screen filter?
  - Should "My tasks" also roll up tasks created inside each brand environment (master roll-up), or only dashboard-level tasks?

### 1.2 Pipeline in Broker Dashboard
- **Context:** Brand-side CRM already has a Pipeline (Kanban). Requirement to add one at Broker level.
- **Questions:**
  - Same 3-column board (To Do / In Progress / Done) as the dashboard wireframe, or reuse the full brand Pipeline widget?
  - Do tasks created in broker Pipeline need to sync with the brand-side Pipeline, or are they broker-internal?
  - Who can see it — all broker users, or per-user scoped?

### 1.3 Dashboard — "Assign time and person" to tasks
- **Questions:**
  - Are due dates + assignee mandatory or optional on a task?
  - When a task is assigned to a user, does that user get an email? (Note: brand Pipeline currently emails on every update — we should confirm we DON'T repeat that here.)

### 1.4 Category Review — Calendar sort by Banner or Category?
- **Questions:**
  - Do you want the calendar rows sortable by banner and by category (click header to sort)?
  - Ascending only, or both directions? Should it persist across sessions?

### 1.5 Category Review — Review End Date: change the upload template?
- **Context:** List now shows Review End Date. Transcripts said we simplified dates to Review Start + Review End (+ Reset) and dropped Submission Due Date from the grid/calendar.
- **Questions:**
  - Does the CSV upload template need to be updated (column names) to match Review Start / Review End / Reset?
  - Is "Submission Due Date" fully removed from the template, or kept as an optional internal field on the Brand Report only?

### 1.6 Market Overview — Push updates to Brands via email
- **Context:** MO9 deliverable exists; no ticket. When a broker updates a Market Overview log, should brands get an email?
- **Questions:**
  - Which updates trigger an email (status change, comment, every edit)?
  - Who receives it (brand owner + sub-users)? Same per-brand grouping as Category Review emails?
  - Should there be a toggle to silence notifications for minor edits (like the Pipeline "don't email on every save" complaint)?

### 1.7 Promo Management — PM1–CS-1618 (unticketed; deliverables exist)
- **PM1 Submission button doesn't work:** Repro steps? Is it broken in live, or never built? What should the button do end-to-end?
- **CS-1614 Formatted export:** Export to what format (Excel/PDF/CSV)? "Formatted" = pre-styled so no post-formatting? Any column set/layout preference?
- **CS-1615 Status options in Submission button:** Confirm the exact status list to surface (from Brand promo calendar: Active/Cancelled/Pending/DidNotRun/Declined/RetailerApproved/Completed/Submitted). Tagged per logged-in user — explain what "tagged by user login" means for us (visibility scope?).
- **CS-1616 Pin/freeze filter options:** Pin = saved default filter applied on login? Should it be per-user (fixed filters) or per-brokerage? Which fields (year, brand, retailer)?
- **CS-1617 Uniform grid format:** The monthly columns are uneven widths — confirm we should standardize to equal-width months.
- **CS-1618 Event across months:** If a promo spans Jan–Mar, should it display on each month (read-only) or be draggable/movable between months? (Transcripts: Option A read-only vs Option C full drag — pick one.)

---

## 2. Brand Modules

### 2.1 Brand Dashboard — update similar to Broker Dashboard + brand-side Ask Caboodle
- **Questions:**
  - Which broker-dashboard elements transfer to the brand side (KPI cards, timeline, task board)?
  - Ask Caboodle on brand side — same AI assistant scope, or brand-specific data only?

### 2.2 Flags alerting user of upcoming tasks / promo submissions / CR deadlines
- **Questions:**
  - Where do flags appear (dashboard KPI cards, bell/notification icon, banner)?
  - What counts as "upcoming" (7/14/30 days)? Should flags be clickable and filter to the underlying list (like CR KPI cards)?

### 2.3 Pipeline enhancements (unticketed)
- **2.3.1 Hide Complete Tasks checkbox:** Confirm default = hidden with a "show completed" toggle.
- **2.3.2 Due dates on tasks:** Optional or required? Should due tasks surface on a calendar view?
- **2.3.3 Calendar view for deadlines:** A real month-grid of task deadlines, or just a date-sorted list? Where does it live (Pipeline tab or Dashboard)?
- **2.3.4 Assign to users:** Currently it adds an email address but not a real assignment — confirm we should bind a real user (with email notification on assign only, not every edit).
- **2.3.5 Don't email on every update:** Confirm: email only on (a) creation, (b) assignment, (c) status change — and NOT on text edits.

### 2.4 TSS — Remove/Modify Approved Promotions (unpublish)
- **Context:** Current SOP = copy approved promo in Sandbox, rename "Original version + date + initials", delete/re-push.
- **Questions:**
  - Do you want a formal "Unpublish" button on Approved Promotions, or keep the copy-edit-push SOP but make it easier?
  - If unpublish: should it keep the approved record intact (discontinued/archived) or truly delete?
  - Should history/audit trail of versions be preserved automatically?

### 2.5 TSS — Actualize promotions automation (plan → actual)
- **Context:** Data (SPINS, store insights) is already in the system; currently actualization is manual copy/paste from external report.
- **Questions:**
  - Automatically import actuals from in-system data, or keep a side-by-side Plan vs Actual view for manual adjustment?
  - Which fields actualize (lift, store count, velocity, revenue)?
  - Do we need plan-vs-actual variance reporting around this?

### 2.6 TSS — EDLP in stepper clarification
- **Questions:** When should a user enter EDLP in the Step wizard vs in the Edit Promo Details section? (Depends on whether they're entering both EDLP + TPR vs EDLP only?) Can you give the intended rule?

### 2.7 TSS — Promotional Year clarification
- **Question:** If today is 2026 but building a 2027 promo, must the user switch the year on the main TSS page first, or can they stay in 2026 and enter 2027 dates? (We need the expected UX.)

### 2.8 Product Specs — UPC in Pricing module
- **Context:** Deliverable `../brand/CS-NEW-brand-product-spec-upc-pricing.md` exists.
- **Questions:** Display UPC read-only alongside each price row (to disambiguate similar SKUs), or editable? Column position?

### 2.9 Retailer CRM — Store-level listing from Banner page
- **Context:** Add store-level detail page reachable from a Banner.
- **Questions:** What should the store page show (orders, contacts, address, activity)? Which roles can view? Is this related to the "STORE REPORT MGMT" House Accounts concept, or separate?

---

## 3. Reports

### 3.1 Distributor Report — exportable?
- **Question:** Should users be able to export the Distributor Report (all/filtered/current page)? Any format preference? (Note the export confusion from Banner SKU — "all data" vs "current data" — we'll clean that up too.)

### 3.2 Broker Market Overview — sort function broken (date-time)
- **Question:** Confirm the expected sort behavior (newest date first by default?). Is it a bug ticket only?

### 3.3 Broker Market Overview — needs summary report (lovable prototype)
- **Questions:** Which KPIs/summary go on it (submitted / upcoming / waiting-on counts)? Should it be a new report tab or a dashboard widget?

### 3.4 SPINS — Hide Market Insights
- **Question:** Is this a temporary hide (toggle) or permanent removal? For all brands or per-brand?

### 3.5 Sales Tracker — back-button region bug + new look
- **3.5.1 Bug:** After viewing a retailer's product details, back button returns to International region instead of the starting region. Confirm expected behavior = return to the region user started from.
- **3.5.2 New look:** Reference the Lovable prototype — confirm the desired layout/columns before we scope.

### 3.6 Rolling latest 12 months
- **Context:** CS-1274 covers distributor report updates.
- **Question:** Confirm default report window = rolling 12 months unless filtered otherwise. Does this apply to Distributor Report only, or SPINS/Monthly too?

---

## 4. Admin

### 4.1 Admin controls icons on Report page buttons
- **Question:** Which reports/buttons? Do you want admins to change the icon per report (e.g., Monthly Report export icon), and to what end (white-label per client)? Please point to an example.

### 4.2 Dashboard prototype flags (Admin)
- **Question:** Same as 2.2 — is the "flags" prototype intended for broker, brand, or both, and is it dashboard-level only?

### 4.3 Merge / eliminate store duplicates
- **Context:** CS-1419 covers duplicate removal for stores in CRM Data Upload.
- **Question:** Should merging also apply to the new Store-level report (House Accounts) data, or is CS-1419 sufficient?

---

## 5. STORE REPORT MGMT (whole tab is concept — no tickets)

### 5.1 "House Accounts" report
- **Context:** Direct-to-store programs; upload brand store list as a separate report like Distributor (Sales Details has store name/address/order details); could reuse old UNFI/KeHE reports.
- **Questions:**
  - Confirm the report is per-brand (House Accounts) fed by CSV upload of store-level orders?
  - Convert the void report to show stores (not warehouses) to visualize gaps — confirm intent.
  - Should it reuse the Distributor Report engine with a "House Accounts" flavor, as a separate module tab?

### 5.2 Email automation & trigger API
- **Questions:**
  - What triggers (30-day inactivity, lifecycle steps)? Which channels (email only)?
  - Where does it apply (store accounts, promo submissions, category review)?
  - Do we build a template builder, use Claude-generated designs, or just a paste-a-design editor? (You flagged uncertainty — we need your direction.)

---

## 6. Platform & Cross-Cutting

### 6.1 Big-data management
- **Question:** Scope = DB indexing/partitioning (CS-517 exists), or also query optimization, report performance on large datasets? Is there a concrete symptom (slow report on X rows)?

### 6.2 New-brand onboarding efficiencies
- **Questions:** What is painful today (manual data mapping, banner linking, distributor setup)? Should we formalize an onboarding checklist/wizard? Which steps must be automated first?

### 6.3 Caching
- **Context:** CS-512 exists ("check if we can further utilize caching").
- **Question:** Any specific slow screens/endpoints you want prioritized, or leave as investigation?

---

## Summary checklist for the call
- [ ] Broker Dashboard: my-tasks filter, pipeline, assign time/person, CR sort, upload template, MO email push, PM1–CS-1618 status options
- [ ] Brand: dashboard update + flags, pipeline (5 sub-items), TSS unpublish + actualize + EDLP rule + promo year, UPC in pricing, store-level page
- [ ] Reports: distributor export, MO sort + summary, SPINS hide, sales tracker bug + look, rolling 12-month scope
- [ ] Admin: icons on report buttons, store duplicate merge scope
- [ ] Store Report Mgmt: House Accounts + email automation (direction needed)
- [ ] Platform: big-data, onboarding efficiencies, caching priority
