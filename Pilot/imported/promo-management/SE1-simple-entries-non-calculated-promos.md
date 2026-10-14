---
type: Document
module: promo-management
jira: [CS-1708]
status: backlog
last_verified: 2026-10-14
related_wiki: ../../wiki/promo-management-status.md
---

# Promotional Planning | Simple Entries (Non-Calculated Promotions)

**CS-1708** | User Story | Priority: High | Status: Backlog
**Internal code:** SE1
**Reporter:** Constance Wolfe
**Source:** Broker Promo Entry call, Jul 13 2026 (DEC-013, REQ-088)

---

## User Story

**As a** Broker (or a brand sub-user acting on behalf of a broker),
**I want** a Simple Entries section where I can add non-calculated promotions quickly, without filling in lift, velocity, store count, or revenue,
**So that** those promotions reach Promotional Management and the Promotional Calendar fast, without running the full calculation flow.

---

## Description

Jade Street, a brokerage with 25 brands and around 15 reps, needs to get roughly 200 promotions into Promotional Management. The full Trade Spend stepper is built for calculated promotions: lift, velocity, store count, allowances, and revenue. A broker who is not calculating any of that still has to complete every step, which is slow and unnecessary for their case.

A non-calculated quick-entry mode existed during the Yin Yang engagement but is no longer in the system (see CON-21). This story rebuilds it as a dedicated section.

**What a Simple Entry is**
- A promotion with no calculation. No lift, no velocity, no store count, no revenue math.
- Approved on creation, because there is nothing to sandbox or budget-test.
- Grouped under a promotion title, with one or more events underneath.
- Editable after creation, since there is no linked sandbox to edit from.

**Where it lives**
A new section in Promotional Planning, alongside Approved Promotions, Trade Spend Sandbox, and Promotional Calendar.

**How it flows**
Entries are stored in the same promotion tables used by the existing flow, so Promotional Management and the Promotional Calendar populate with no query changes and no duplicate data paths.

**Scope**
In scope: manual create, file upload with a template, Export for Promotional Planning, duplicate event, EDLP / all-year toggle, editing, and the calculated vs non-calculated flag.

Out of scope for this story (future): Add Calculations / Copy to Sandbox, and the brand-side visibility rules.

---

## Acceptance Criteria

### Scenario 1: Section placement
- **Given** I am in Promotional Planning
- **When** Simple Entries is enabled for my brand
- **Then** I see it alongside Approved Promotions, Trade Spend Sandbox, and Promotional Calendar
- **And** it lists only non-calculated entries

### Scenario 2: Manual create with calculations bypassed
- **Given** I am in the Simple Entries section
- **When** I click Add New Promotion
- **Then** I am asked for a promotion title
- **And** I select the retailer and banner
- **And** I select the products
- **And** I add at least one event with an event name, start date, and end date
- **And** I am not asked for lift, velocity, store count, or revenue metrics
- **When** I submit
- **Then** the promotion is created and approved

### Scenario 3: Duplicate event and change dates
- **Given** I have entered an event
- **When** I duplicate it
- **Then** a copy is added with the same event name
- **And** I can change its start and end dates without re-entering the name

### Scenario 4: EDLP / all-year toggle
- **Given** an event runs across the entire year
- **When** I enable the all-year toggle
- **Then** the event applies across all months without adding 12 duplicate events

### Scenario 5: File upload
- **Given** I have completed the Simple Entries template
- **When** I upload the file
- **Then** the promotions and events are created in bulk
- **And** rows are grouped under the promotion title

### Scenario 6: Export for Promotional Planning
- **Given** I am on the Retail report
- **When** I click Export for Promotional Planning
- **Then** the file contains retailer, banner, and UPC
- **And** door count is excluded
- **And** the event name, start date, end date, and fee or notes columns are present but empty
- **When** I fill the empty columns and upload the file
- **Then** the entries are created

### Scenario 7: Appears in Promotional Management and the Calendar
- **Given** a Simple Entry is created
- **Then** it appears in Promotional Management
- **And** it appears in the Promotional Calendar
- **And** no calculation columns show errors for it

### Scenario 8: Editable, with calculated vs non-calculated flag
- **Given** a promotion was created through Simple Entries
- **Then** it is marked as non-calculated and is editable
- **And** a promotion created through the calculated flow is marked as calculated and cannot be edited from here

### Scenario 9: Import validation
- **Given** I upload a file that contains invalid rows
- **Then** valid rows are imported
- **And** invalid rows are reported in an error file with a reason per row

---

## Design Notes

- Reuse the existing Trade Spend promotion and event tables so Promotional Management needs no new query and data flows through the same path.
- Four APIs, per the Jul 13 estimate: list, details, create, update.
- The section sits at brand level.
- The duplicate-event helper and the EDLP / all-year toggle are front-end conveniences.
- Because Simple Entries have no sandbox link, they must be editable directly; calculated promotions remain locked.

### Upload template columns
- Promotion Title
- Banner
- UPC
- Event Name
- Start Date
- End Date
- Fee or Notes

### Rules
- Banner maps to exactly one retailer, so retailer is derived from the banner.
- Product resolves from UPC.
- Dates are explicit start and end dates, not month only.
- The metrics step of the stepper is skipped.

---

## Dependencies
- Existing Trade Spend and Trade Spend Sandbox implementation, reused for storage and the flow into Promotional Management.
- Retail report export (APL), used to pre-fill the template.
- Import pipeline, reused for bulk upload.

---

## Open Questions
- Confirm the section label (Simple Entries is a placeholder name).
- Does the upload land directly in brand-approved, or still pass through sandbox?
- Which roles can create and edit after creation?
- Exact template header row and file name.
- Does the export button read Export for Promotional Planning or Export for Commercial Planning?
- Do Simple Entries appear in the Trade Spend Roll-up and other reports?
- On a partially invalid upload, import the valid rows or reject the whole file?
- How does this interact with actualization, versioning, and planned-versus-actual later?

---

## Related Tickets
- **CS-532** - add a SKU without going through the stepper again
- **CS-210** - old closed "Simple Stepper for Entries Trade Spend"
- **CS-1324** - only push brand-approved promotions to Promo Management
- **PM3 / CS-1615** - promo status and submission
- **REQ-088, DEC-013, CON-21** in `index.md`
