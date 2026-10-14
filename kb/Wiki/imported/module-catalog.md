---
type: reference
title: Module catalog
module: general
status: current
last_verified: 2026-10-14
---

# MODULE CATALOG

| Module | Purpose | Status |
|--------|---------|--------|
| **Admin** | Roles, permissions, settings, user management, data mapping, CRM data upload | 67 backlog tickets — highest volume |
| **Brand** | Brand entity management, home page, branding | Stable |
| **Broker** | Broker/sub-broker management, broker dashboard (Market Overview, Promo Management, Category Review, Distributor APL) | Active dev — 33+ tickets |
| **CRM** | Distributors, Retailers, Banners, Regions, Contacts, Pipeline (Task Board) | Mostly stable, Retailers untested |
| **Dashboard** | Summary KPIs, cross-module reads | Stable, low detail |
| **DataHub** | Centralized data coordination, shared datasets | Internal |
| **DataUpload** | Bulk ingestion, mapping, validation (Import Wizard) | Active refactoring — 1GB+ handling |
| **FileRepository** | Document/file management via S3 | Buggy (download errors) |
| **ProductSpecs** | Categories, Products, Pricing | **Done & fully tested** |
| **Report** | 8+ reports (Market Activities, Category Review, Retail, Sales Tracker, Trade Spend Rollup, Monthly, SPINS, Distributor, Banner-to-DC) | Mixed — Distributor Report has 16 tickets |
| **Store** | Store domain elements (orphan — domain only, no controller/service layer) | **Not implemented** |
| **TradeSpend** | Core trade promotions and planning | Stable |
| **TradeSpendSandbox** | TSS — draft promos, what-if scenarios, 4-step wizard | Functional, ongoing QA — 37 tickets |
| **PromotionalCalendar** | Calendar view of promotions | Partial, untested |

> **Backlog counts:** figures above are from legacy notes. See `jira-backlog-intelligence.md` for live, evidence-based counts from the 1,784-ticket Jira export.

> Module-by-module business context: `wiki/business.md` ("What Caboodle Does"). Session/provenance context: `CONTEXT.md`.
