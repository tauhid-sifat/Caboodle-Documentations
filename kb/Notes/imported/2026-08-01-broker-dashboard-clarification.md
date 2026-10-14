---
type: Document
title: "Broker Dashboard Clarification (date approximate)"
---

# Broker Dashboard Clarification (date approximate)

- **Source:** `meetings/transcripts/Broker Dashboard meeting 2 Clarification.txt` (2953 lines)
- **Date note:** transcript carries no explicit date; filed here as early-August placeholder (topics feed into Aug 4 / Aug 17 / Aug 18 sessions). Correct if evidence found.
- **Attendees:** Constance Wolfe (client), dev team (per series pattern)
- **Type:** broker dashboard clarification (filters, statuses, sheet view, email semantics)

## Decisions
- **D-BD2-1 (APPROVED):** Category Review & Distributor APL use **infinite scroll**, not pagination.
- **D-BD2-2 (APPROVED):** Broker Dashboard = **KPI cards + calendars + task board** (re-scoped from "UI polish").
- **D-BD2-3 (APPROVED):** Simple task board (To Do / In Progress / Done), **NOT** the CRM Pipeline.
- **D-BD2-4 (VALIDATED):** Market Overview status hierarchy: Pending → Approved → Commit → Active → **Discontinued**; Discontinued is **terminal** (broker cannot override); NotActive/Pending flexible.
- **D-BD2-5 (VALIDATED):** UNFI / Independents = grouped mom-and-pop stores, **not real banners**; banner door count (e.g., 700) misleads KPIs.
- **D-BD2-6 (APPROVED):** Multi-brand log entry via **sheet view** (one retailer → grid of all brands' SKUs → one submit).
- **D-BD2-7 (CLARIFIED):** "Send to Contacts" = **broker-composed email** (CC/BCC), NOT auto system notifications.

## Open questions
- Store-count mechanism for UNFI Independents (store picker?) — unknown.
- Is "Submitted" a new status enum value or parallel `IsSubmitted` flag? — TBD.

## Actions
| Action | Owner |
|--------|-------|
| Re-sit with FD on open items | Bijoy |
| Region → retailer selection + discontinued-hierarchy demo | Dev team |

## Jira keys
- None found in extracted portion. Workstream: Broker Dashboard, Market Overview, APL.
