---
type: Document
title: "Documentation Audit"
---

# Documentation Audit

*Comparison of existing `caboodle/docs/business/` documentation against actual code. Use this to know what to trust and what to verify.*

---

## Documents in `caboodle/docs/business/`

| File | Type | Code alignment | Notes |
|------|------|----------------|-------|
| `system-business-glossary.md` | Business glossary | **Mostly aligned** | Accurate high-level module descriptions. Missing: Admin, Dashboard, Report, FileRepository, Store orphan, Intelligence detail. Some rules stated without file citations. Superseded by [03-glossary.md](./03-glossary.md) for code-grounded definitions. |
| `ASK Cab.md` | AI feature overview | **Partially verified** | Intelligence module exists with ChatSession, QueryAuditLog. Full guardrail set not exhaustively audited. |
| `brand broker.md` | Domain context | **Not re-verified line-by-line** | Appears to be narrative context doc, not integration spec. |
| `prompt.md` | Prompt template | N/A | Meta document for doc generation. |
| `product-spec-master-pack-fe-integration.md` | FE integration guide | **Backend yes, frontend no** | `MasterPack` field exists on `ProductSpecification`. Neither frontend repo implements it (grep Jul 2026). |
| `store-list-fe-integration.md` | FE integration guide | **Aligned** | APIs match `StoreListEntry` handlers. Admin route `/stores` exists in `Caboddle Admin Web`. |
| `store-list-empty-banner-filter-fe-integration.md` | FE integration guide | **Aligned** | `EmptyBannerOnly` filter rule matches `GetStoreListRequest.cs` validator. |
| `mapped-records-fe-integration.md` | FE integration guide | **Aligned** | KeHE/UNFI mapped endpoints and admin `/mapped-data` page exist. |
| `retailer-matching-backfill-fe-integration.md` | FE integration guide | **Aligned** | Backfill handlers exist in DataHub. Admin hooks exist. |
| `unmapped-store-backfill-fe-integration.md` | FE integration guide | **Aligned** | Store backfill handlers exist. |
| `pr/PR Description.md` | PR template | N/A | Not business documentation. |

---

## Referenced but missing documents

These files are linked from existing integration docs but do **not** exist in the repository:

| Missing file | Likely intended content |
|--------------|------------------------|
| `entity-resolution-fe-integration.md` | Entity resolution UI integration (admin `/entity-resolution` exists) |
| `unmapped-distinct-values-fe-integration.md` | Unmapped value distinct query UI |
| `brand-data-cleanup-fe-integration.md` | Brand data cleanup UI (admin `/brand-data-cleanup` exists) |

---

## Claims in prior glossary vs code

| Prior claim (`system-business-glossary.md`) | Code verification |
|---------------------------------------------|-------------------|
| Brand is primary filter boundary | **Confirmed** — `BrandValidationMiddleware.cs` |
| Multi-tenant isolation by brand and role | **Confirmed** — middleware + handler role checks |
| UPC is key join point | **Confirmed** — import, mapping, product spec |
| MasterPack is optional/informational | **Confirmed** — field on `ProductSpecification` |
| Unmapped status computed from 3 dimensions | **Confirmed** — `UnmappedRecordBase.ComputeOverallStatus()` |
| Auto-resolved held from promotion | **Confirmed** — `CanPromoteToMappedDuringSync()` |
| Sandbox mirrors production TradeSpend | **Confirmed** — parallel domain entities |
| Sandbox is planning; approved reporting uses live | **Confirmed** — push to BAP workflow |
| AI is read-only with audit | **Partially confirmed** — `QueryAuditLog` exists; full SQL guardrails not exhaustively verified |
| Modules listed: Brand, CRM, ProductSpec, DataUpload, DataHub, Broker, TradeSpend, TradeSpendSandbox, Intelligence | **Incomplete list** — also Admin, Dashboard, Report, FileRepository, Shared, Store (orphan) |

---

## User prompt assumptions vs code

| Assumption in onboarding prompt | Code reality |
|---------------------------------|--------------|
| Modules include Store with Application | Store has **Domain only** — CRM owns Application |
| Frontend in same repo with route groups | Frontend in **separate repos** on `F:\` |
| Route group `(admin)` | Admin app uses `(mainApp)` |
| TradeSpendSandbox promo lifecycle "draft to approved" | No promo-level status — event-level `PromotionEventStatus` + push to BAP |

---

## What the new BA onboarding set adds

| New document | Value over prior docs |
|--------------|----------------------|
| `00-repository-map.md` | Verified module list, frontend repo locations, route groups |
| `01-backend-modules.md` | Per-module entities, rules with file citations, operations, access |
| `02-frontend-applications.md` | Complete screen inventory by role |
| `03-glossary.md` | Every key term with source file |
| `04-role-permission-matrix.md` | Actual permission seeding + brand-scoping layer |
| `05-entity-relationships.md` | Business-level ER narrative from domain models |
| `06-end-to-end-workflows.md` | Step-by-step with validation failures |
| `07-known-gaps-and-risks.md` | TODO, NotImplemented, frontend/backend mismatches |

---

## Recommended reading order for new BAs

1. [README.md](./README.md) — orientation
2. [00-repository-map.md](./00-repository-map.md) — what exists where
3. [03-glossary.md](./03-glossary.md) — learn the language
4. [05-entity-relationships.md](./05-entity-relationships.md) — how things connect
5. [04-role-permission-matrix.md](./04-role-permission-matrix.md) — who can do what
6. [06-end-to-end-workflows.md](./06-end-to-end-workflows.md) — how work flows through the system
7. [01-backend-modules.md](./01-backend-modules.md) — deep reference per module
8. [02-frontend-applications.md](./02-frontend-applications.md) — screens and UI risks
9. [07-known-gaps-and-risks.md](./07-known-gaps-and-risks.md) — pitfalls for requirements writing
10. [08-documentation-audit.md](./08-documentation-audit.md) — trust guide for older docs

---

## Maintenance guidance

When code changes, these documents should be updated by re-verifying:

1. `CaboodlePermissions.cs` and `ApplicationDbSeeder.cs` for role changes
2. Controller `MustHavePermission` attributes for access changes
3. Domain entities for new fields or relationships
4. Frontend `page.tsx` glob for new screens
5. Handler validators for new business rules

If a BA requirement references behavior not found in these docs, the requirement should cite the specific API endpoint or screen and ask engineering to verify — not assume.
