# Store Report Management (SRM) | House Accounts - Direct-to-Store Program Tracking

**CS-1624** | New Requirement | Concept / Epic | Priority: TBD | Status: New

---

## Concept

Many Brands run a **direct-to-store program for smaller stores** and need a way to track **orders and communications** with those stores. Caboodle currently has Distributor Reports built around distributors/warehouses; this concept extends that model to store-level (House Accounts) tracking.

---

## Proposed Caboodle Solution

1. **House Accounts report** - Upload a brand's Store list into a **separate Distributor report** (very similar to the current Distributor Report), called **"House Accounts."**
   - This also supports the long-standing goal of making the old **UNFI & KeHE reports usable generically/agnostically** for any data source (House Accounts being the first non-distributor use).
   - Reference: `Distributor Reports > Sales Details`, where store names, addresses, and order details are provided via upload.
2. **Void report by store, not warehouse** - Convert the **Void Report** to be based on **stores instead of warehouses**, so users can visualize **gaps in orders** at the store level.
3. **Email Automation & Trigger API** - Install an email automation / Trigger API that lets users build **trigger logic** for emails (e.g., **30-day inactivity**, lifecycle/lifecycle-stage automation).
4. **Email templates** - Need a strategy for templates. Not necessarily a full template builder; options:
   - Utilize **Claude design** to generate template content, or
   - Let users **copy & paste a design into an editor**.

> **Inspiration model (confirmed from the Sales Details chart):** the current Distributor Report **Sales Details** grid is the template for the House Accounts store-level report. Columns observed:
> `Store | Address | City | State | Zip | Chain | Distribution Center | Product | UPC | Cases Shipped | Sales Dollars` with an **Export** button and pagination. The House Accounts report should mirror this store-level model (store name, address, city, state, zip, chain, distribution center, product, UPC, cases, sales dollars).

---

## Acceptance Criteria (draft)

### Scenario 1: House Accounts Report (Store-level Distributor Report)
- **Given** a brand uploads its store list
- **When** it is loaded as a "House Accounts" Distributor-style report
- **Then** store names, addresses, and order details are available via upload (mirroring Sales Details)
- **And** the report is source-agnostic (not tied to UNFI/KeHE specifically)

### Scenario 2: Void Report by Store
- **Given** the Void Report
- **When** it renders
- **Then** it is scoped to stores (not warehouses)
- **And** users can visualize order gaps per store

### Scenario 3: Email Trigger Automation
- **Given** the Trigger API is installed
- **When** a user defines logic (e.g., 30-day inactivity)
- **Then** the system sends the configured email automatically
- **And** lifecycle/trigger rules are user-buildable

### Scenario 4: Email Templates
- **Given** the template approach is chosen
- **When** a user creates an email
- **Then** they can produce/import a design (Claude-generated or copy/paste into editor) without requiring a full drag-drop builder

---

## Jira Reference (data/jira-tickets)
- **CS-449 / CS-452** - [BE] Reports | KEHE & UNFI Create **Store Void Report** Under Warehouse Report (direct match for the void-report-by-store idea).
- **CS-1276** - Current UNFI & KeHE Reports > Determine if we should use them **generically** (exact match for the agnostic-reporting note).
- **CS-1262** - Combine KeHE and UNFI Distributor Reports into a Unified Report (generic/single report direction).
- **CS-502 / CS-507** - SPINS Void Report: change dates to columns, **stores in rows**.
- **CS-1454** - Distributor Report | **Store** Void Report Filter Issues.
- **CS-1295** - Automated Target Lists based on warehouse data (warehouse -> store logic).
- **CS-1228** - Distributor Reports Filter UNFI & KeHE Needs New Filter Field for Banner (SPINS hierarchy: Retailer/Chain/Store).
- **CS-1061** - [BE] Sales By Store report in KeHE (store-level sales).
- **CS-1438** - Distributor Report Sales Details (order/store detail context).
- Email/Trigger: **CS-1377** (invitation email trigger), **CS-1432** (invite endpoint, server-side template selection), **CS-1281** (auto-flag logic), **CS-1294** (Market Insights email discussion).

---

## Related
- **CS-1593** - Admin > Store Report: eliminate/merge store duplicates (clean store data is a prerequisite for House Accounts).
- **CS-1597** - Retailer CRM store-level listing (store data reuse).
- **AGENTS.md - Store module** - orphan domain; CS-1624 motivates store-level data surfacing.

---

## Notes
- Confirm whether "House Accounts" is a new report type or a configured instance of the generic Distributor Report.
- The email Trigger API is a significant new capability; scope it as its own sub-ticket/epic if built (template strategy, trigger rule builder, Claude integration).
- Reconcile with CS-449/452 and CS-1276 rather than duplicating those efforts.
