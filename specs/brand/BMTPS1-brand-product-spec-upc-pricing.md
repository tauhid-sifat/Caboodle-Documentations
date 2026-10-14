---
module: brand
jira: [CS-1596]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/module-catalog.md
---

# Brand Modules | Product Spec | Add Product UPC to Pricing Module

**CS-1596** | New Requirement | User Story | Priority: TBD | Status: New
**Reporter:** Constance Wolfe

---

## User Story

**As a** Brand user managing Product Specifications,
**I want** UPC codes available in the Pricing Module,
**So that** I can associate pricing data directly with UPC-scoped product variants.

---

## Description

Currently the **Pricing Module** within Product Specs may not expose UPC-level granularity for pricing. The client needs to walk through the exact requirements (e.g., whether pricing should be entered/edited per UPC, and how it relates to the existing product-level pricing). This ticket supersedes the prior placeholder `CS-NEW-brand-product-spec-upc-pricing.md`.

Key open points to confirm with the client:
- Should pricing be UPC-scoped (one price per UPC/variant) rather than product-level?
- How does UPC-level pricing interact with Trade Spend calculations (pricing flows to Trade Spend per CS-1235/CS-1337)?
- Does this tie into the Product Specs tab reorganization (CS-1386: Categories > Products > Pricing)?

---

## Acceptance Criteria

### Scenario 1: UPC Available in Pricing Module
- **Given** a product with one or more UPCs
- **When** the user opens the Pricing Module for that product
- **Then** UPC-scoped entries are available so pricing can be associated per UPC

### Scenario 2: Pricing Persists and Flows Downstream
- **Given** UPC-level pricing is entered
- **When** it is saved
- **Then** the pricing is stored against the correct UPC
- **And** it flows through to dependent modules (e.g., Trade Spend) without breaking existing flows

---

## Jira Reference (data/jira-tickets)
- **CS-1051** - Product Specs - Pricing - Can't update (existing pricing-edit defect).
- **CS-1235** - Pricing updates in Product Specs not flowing thru Trade Spend (downstream impact).
- **CS-1337** - Pricing updates in Product Specs correctly flow through to Trade Spend calculations (target behavior).
- **CS-1386** - Product Specs: Reorganize Tabs to Categories > Products > Pricing (structural context).
- **CS-1400** - Updating Spec UPC Code causing Error (UPC-edit defect to avoid regressing).
- **CS-1083 / CS-1088** - UPC-based grouping/filtering of product data (related UPC handling).

---

## Related
- **CS-NEW-brand-product-spec-upc-pricing.md** — prior placeholder (retired; superseded by this ticket).

---

## Notes
- ProductSpecs module is marked "Done & fully tested" per AGENTS.md — confirm whether UPC-in-pricing is a net-new gap or a configuration.
- Coordinate with the client walkthrough referenced in the original placeholder.
