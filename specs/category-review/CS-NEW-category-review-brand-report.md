# Category Review — Brand Report

**CS-NEW** | User Story | Priority: High | Status: Backlog
**Reporter:** Constance Wolfe | **Assignee:** Bijoy Chandra Nath
**Source:** Meeting transcripts (Jul 15 – Aug 10), `../../Wireframe/index.html`, `CS-NEW-category-review-user-workflow-flow.md`

---

## User Story

**As a** Broker user,
**I want** a Brand Report that acts as my Category Review workflow tracker — populated automatically when I notify brands (or add them manually, or when brands opt in themselves), with per-row statuses, notes, emails, and KPI filters,
**So that** I can manage every brand's participation in a review from one place, know what to do next, and communicate with brands without leaving Caboodle.

---

## Description

The **Brand Report** is the broker's operational hub for Category Review. It replaces the old "manually add to calendar" mechanism as the single source of truth, and stays in sync with the Category Review calendar.

**Key architecture decisions (from transcripts):**
- Brand Report ↔ **Calendar** are always in sync (remove from one = remove from the other).
- The Category Review **List** is separate (removing from calendar does NOT remove from the list).
- The calendar **populates from the Brand Report**, not from the list.
- Only brands that have been **included/assigned** appear on the report; by virtue of being there, the row defaults to **In Progress**.
- The **brand environment has NO Brand Report** — brands get the calendar + KPI cards only.
- Statuses are **dynamic**, configured by Caboodle admin (color + display order + default per entry mechanism).
- Emails go to **brand owners AND sub-users**, grouped per brand; sender is auto-BCC'd.

---

## Acceptance Criteria

### AC1: Three ways to populate the Brand Report
- **Given** I am on the Category Review list, when I select **exactly one** review row and choose **Notify Brand**, then I can select brands and, per brand, select owner **and** sub-users, compose an email, and send.
- **Then** each selected brand **automatically appears in the Brand Report** with **Brand Response = Notified**, **Meeting Status = In Progress**, and the review appears on that brand's calendar.
- **When** I want to add brands **without** email, the modal offers **Add to Brand Report** (vs Compose); brands are added with the admin-configured **manual** default status (NOT "Notified").
- **When** a **brand** adds a review to its own calendar and chooses **Notify Broker**, it **auto-populates the broker's Brand Report** and calendar as **Brand Response = Yes/Submitted**, **Meeting Status = In Progress**, with a flag (e.g., `created by`) marking it as brand-initiated.
- **And** when I select **zero or multiple** rows, the **Notify Brand** button is disabled (single-review emails only).

### AC2: Brand responses & workflow statuses
- **Given** a row is on the report, it defaults to **Meeting Status = In Progress**.
- **When** I progress a review, I can update **Brand Response** (Notified / Yes / Not Interested / TBD), **Submission Status** (Not Started / In Progress / Submitted / Approved / Rejected), **Meeting Status** (In Progress → Scheduled), **Next Action** (with optional date), **Waiting On** (brand/buyer/other), and **Review Results** (Accepted / Declined).
- **Then** a global **"Hide Not Interested"** toggle filters declined rows out while preserving the record, and I can remove a brand entirely if they drop out mid-review.

### AC3: Notes (internal vs external)
- **Given** a brand report row, I can add **internal notes** (brokerage-only) and **external notes** (visible to the brand).
- **Then** external notes appear on the brand side; the brand-side **Notes** KPI shows the count, and the calendar cell shows a notes indicator.
- **And** the recipients of the initial email are **auto-logged into internal notes** (send log).

### AC4: Email from the report (re-send)
- **Given** a row already has stored recipients, the **Email Brands** action pre-selects those same recipients by default.
- **When** I need to change recipients, I can add/remove users before sending.
- **Then** one email is sent **per brand** (all of that brand's recipients in a single email) while cross-brand recipients stay hidden, and each send is logged with a success/failed status.

### AC5: Brand Report ↔ Calendar sync
- **Given** a review is on the calendar, when I remove it **from the calendar**, it is also removed **from the Brand Report**, and vice-versa.
- **Then** a single brand can be removed from a multi-brand review without removing the whole review.
- **And** the original Category Review **list** row is **not** deleted.

### AC6: Calendar & KPIs
- **Given** the calendar populates from the Brand Report, it shows **Review Month and Reset Month** only (no submission date, no review-end auto-population).
- **Then** clicking a review shows Type, Region, Review Start, Review End, and notes.
- **And** the KPI cards (Status / Waiting On / Review Results / Notes / Due Date) act as **filters** on the view.

### AC7: Brand-side experience
- **Given** I am a Brand Owner / Brand Sub-User, I see KPI cards for **Status / Review Status**, **Waiting On**, **Review Results**, and **Notes**.
- **Then** clicking a KPI card filters the view, review details show the broker's status, and there is **no Brand Report tab** on the brand side (calendar + KPIs only).

### AC8: Admin configuration
- **Given** the admin section, Caboodle Admin can manage all Brand Report dropdowns dynamically — values, **colors**, and **display order** for each column (Brand Response, Meeting Status, Submission Status, Next Action, Waiting On, Review Results).
- **Then** a **default value per entry mechanism** is set: email → Brand Response = Notified / Submission = Submitted; manual add → a different (non-"Notified") default; brand-initiated → Brand Response = Yes / Meeting Status = In Progress.

### AC9: User-specific fixed filters (scoping)
- **Given** multiple users share a brokerage, each user can set **fixed filters** (retailers, brands, region).
- **When** I log in, my saved filters apply automatically and can be changed/cleared at any time.
- **Then** I only see data I'm responsible for; other users' views are unaffected. Applies across Category Review, Promotional Management, and other modules (system-wide).

### AC10: Export Brand Report
- **Given** I am on the Brand Report, I can **export** the currently visible data (respecting active filters/sort).
- **When** I click **Export**, I receive a CSV/Excel download containing all visible columns and rows.
- **Then** the export includes: Brand, Category, Retailer, Review Month, Brand Response, Submission Status, Meeting Status, Next Action, Waiting On, Review Results, Notes count, and any other visible columns.
- **And** the export respects the current filter state (e.g., if "Hide Not Interested" is on, those rows are excluded).
- **And** the export is logged in the audit log (see AC11).

### AC11: Audit log
- **Given** any change is made to a Brand Report row (status update, note added, email sent, brand added/removed, export triggered), an **audit log entry** is created.
- **When** I open the audit log for a row, I see: **timestamp**, **user**, **action type** (status change, note added, email sent, brand added, brand removed, export), **old value**, **new value**.
- **Then** the audit log is append-only (no edits or deletes).
- **And** the audit log is visible to broker users only (not brand-side).
- **And** the audit log can be filtered by user, action type, or date range.

---

## Functional Requirements

- **FR1:** Brand Report is broker-side only. List remains the master data source; report+calendar hold opted-in brands.
- **FR2:** Data flows into the report via three paths: (a) Notify Brand email, (b) manual add, (c) brand-side Notify Broker.
- **FR3:** All status columns are admin-configurable (values, colors, display order, per-mechanism defaults).
- **FR4:** Email supports brand owner + sub-users, per-brand grouping, auto-BCC sender, CC/BCC to external emails, rich text, and a persistent send log.
- **FR5:** Brand Report ↔ calendar sync; list unaffected; per-brand removal supported.
- **FR6:** Calendar is view/filter-only, showing Review Month + Reset Month.
- **FR7:** KPI cards (broker + brand) act as filters.
- **FR8:** User-specific fixed filters, applied on login.
- **FR9:** Export respects current filter state; generates CSV/Excel with all visible columns.
- **FR10:** Audit log captures all row-level changes (status, notes, email, add/remove, export) with timestamp, user, old/new values. Append-only, broker-only, filterable.

---

## Wireframe Mapping

| Transcript requirement | Wireframe element |
|---|---|
| Broker sends email → auto-populates report | Brand Report tab; Notify Brand flow (staging build) |
| Add without email | "Add to Brand Report" vs "Compose" actions in the selection modal |
| Color-coded statuses | Status badges with admin-configurable colors on report rows |
| KPI cards as filters | Report KPI row (Status / Waiting On / Results / Notes / Due Date) |
| Internal/external notes | Notes column with internal vs external fields |
| Calendar view-only | Calendar tab showing review month + reset month |
| Brand-side KPIs | Brand category review KPI cards (no Brand Report tab) |

---

## Related Tickets / Docs
- `CS-NEW-category-review-user-workflow-flow.md` — Mermaid workflow of the same flow
- `CS-1361-new-category-review-functionality.md` — Yearly grid, checkmark, cell contacts
- `CS-1296-category-review-calendar-rollup.md` — CSV upload → CategoryReview table
- `CS-NEW-category-review-email-notification.md` / `-cr2.md` — Email notification
- Meeting notes: `CR Brand Report & Ticket Review on Jul 30.txt`, `Ticket Call on Aug 10.txt`, `Category Review Tracker on Jul 24.txt`, `Review Broker Questions on Aug 4.txt`, `Ticket Call on Jul 27.txt`
