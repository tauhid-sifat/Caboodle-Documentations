---
type: reference
title: Module catalog
module: general
status: current
last_verified: 2026-10-29
---

# MODULE CATALOG

**Source of truth:** `docs/feature-context.md` (code-verified inventory, 2026-10-28).

## Core modules (from feature-context.md)

| # | Module | Owns | Status (from code) |
|---|--------|------|-------------------|
| 2.1 | Identity & Authentication | Accounts, login, tokens, sign-up/verification, password reset, profile, legacy roles/sub-users, admin user management | Active |
| 2.2 | Organizations & Access Control | Orgs, memberships, org roles, invitations, access requests, domains, brand connections, per-brand module access, module catalog/settings, IAM audit, onboarding, Company area | Active |
| 2.3 | Brands & Brokers | Brand/broker records and legacy brand-to-broker links (superseded by orgs) | Active (legacy parts Deprecated) |
| 2.4 | CRM | Retailers, banners, banner SKUs, distributors, DCs, regions, contacts, stores, pipeline | Active (some legacy/partial pieces) |
| 2.5 | Product Specifications | Categories, products, price lists | Active |
| 2.6 | Trade Promotion Planning | Sandbox promotions/versions, Brand Approved, Simple Promotion, events/fees, calculation engine, quotas | Active |
| 2.7 | Promotional Calendars & Management | Brand/Broker calendars, notes, custom Promo Tabs, bulk status, exports | Active |
| 2.8 | Category Review & Brand Report | Broker category reviews, review calendar, brand reports, notifications/email logs, audit | Active |
| 2.9 | Market Overview & APL Reports | Market overview logs/reports, Distributor APL, Retail APL, Brand APL/activities, broker landing | Active |
| 2.10 | Data Uploads | KeHE, UNFI, SPINS, Distributor Sales, master data import/export, mappings, chunked imports | Active |
| 2.11 | Reports & Dashboards | Trade spend roll-up, monthly report, sales tracker, product report, brand/broker dashboards | Active |
| 2.12 | Intelligence (Ask Caboodle) | AI chat over Caboodle data (LLM-planned SQL, structured reports) | Active |
| 2.13 | File Repository | Brand/broker file explorer, share links, upload/download/preview | Active |
| 2.14 | DataHub | Entity resolution, store list/matching/geocoding, mapped/unmapped records, data sync, cleanup tools | Active |
| 2.15 | Platform Administration | Soft delete purge, email logs/SNS webhook, file key backfill, data cleanup tools, admin dashboard | Active (many parts Partial/Feature-flagged) |

## Legacy/high-level mapping (older naming)

| Module | Purpose | Status |
|--------|---------|--------|
| **Admin** | Roles, permissions, settings, user management, data mapping, CRM data upload | Covered by 2.1, 2.2, 2.15 |
| **Brand** | Brand entity management, home page, branding | Covered by 2.3, 2.5 |
| **Broker** | Broker/sub-broker management, broker dashboard (Market Overview, Promo Management, Category Review, Distributor APL) | Covered by 2.3, 2.7, 2.8, 2.9 |
| **CRM** | Distributors, Retailers, Banners, Regions, Contacts, Pipeline (Task Board) | Covered by 2.4 |
| **Dashboard** | Summary KPIs, cross-module reads | Covered by 2.11 |
| **DataHub** | Centralized data coordination, shared datasets | Covered by 2.14 |
| **DataUpload** | Bulk ingestion, mapping, validation (Import Wizard) | Covered by 2.10 |
| **FileRepository** | Document/file management via S3 | Covered by 2.13 |
| **ProductSpecs** | Categories, Products, Pricing | Covered by 2.5 |
| **Report** | Reports (Market Activities, Category Review, Retail, Sales Tracker, Trade Spend Rollup, Monthly, SPINS, Distributor) | Covered by 2.9, 2.11 |
| **Store** | Store domain elements | **Not implemented** (noted in feature-context; Store module unimplemented) |
| **TradeSpend** | Core trade promotions and planning | Covered by 2.6 |
| **TradeSpendSandbox** | Draft promos/scenarios | Covered by 2.6 |
| **PromotionalCalendar** | Calendar view of promotions | Covered by 2.7 |

> **Backlog counts:** See `jira-backlog-intelligence.md` for live counts from the 1,784-ticket Jira export.  
> **Detailed feature inventory:** See `docs/feature-context.md` for complete module/feature/sub-feature breakdown with paths, APIs, data models, flows, and gotchas.  
> Module-by-module business context: `wiki/business.md`. Session/provenance context: `CONTEXT.md`.
