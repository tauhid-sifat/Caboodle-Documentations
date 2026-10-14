---
type: Document
title: "Product Specs Module"
---

# Product Specs Module

> Business-analyst onboarding notes for the Caboodle backend **Product Specs** module.
> Plain English. Every claim cites a source file and line (paths are relative to the backend repo root `/d/Projects/caboodle.backend`). Where the code does not make something clear, it is flagged as **"Unclear from code."**

---

## Purpose

Product Specs is the brand's **product catalog**. It holds three things:

1. **Categories** — simple named groupings a brand uses to organize its products (`caboodle/src/Modules/ProductSpec/Modules.ProductSpecs.Domain/Category/Category.cs:5`).
2. **Products / Product Specifications (SKUs)** — the detailed spec sheet for each sellable item: name, UPC, case pack, dimensions, weights, distributor codes, etc. (`caboodle/src/Modules/ProductSpec/Modules.ProductSpecs.Domain/ProductSpec/ProductSpec.cs:5`).
3. **Price Lists** — the price of a given product from a given distributor, optionally starting on a given date (`caboodle/src/Modules/ProductSpec/Modules.ProductSpecs.Domain/PriceList/PriceList.cs:4`).

Everything is scoped to one **Brand**. The active brand is taken from a `BrandID` request header (`caboodle/src/BuildingBlocks/Infrastructure/OpenApi/BrandIdHeaderAttribute.cs:8`) and from the signed-in user's brand (`_currentUser.GetBrandID()`, used throughout the handlers).

---

## Domain Entities

All three entities inherit `AuditableEntity`, meaning each row carries CreatedBy/On, LastModifiedBy/On, and a `Deleted` soft-delete flag (referenced e.g. `caboodle/src/Modules/ProductSpec/Modules.ProductSpecs.Application/PriceList/UpsertPriceListRequest.cs:154` and the `Deleted` filtering throughout). **Cross-cutting fact:** for EF (`IRepository<T>`) reads the `Deleted` flag is auto-filtered; for raw SQL (`IDapperRepository`) it is filtered only where the query explicitly says `"Deleted" = FALSE`.

### Category
`caboodle/src/Modules/ProductSpec/Modules.ProductSpecs.Domain/Category/Category.cs:12-14`
| Field | Meaning |
|---|---|
| `BrandID` | Owning brand |
| `Name` | Category name (required) |
| `ImageURL` | Optional image |

A category is deliberately lightweight — just a label + image.

### Product Specification (the "Product" / "SKU")
`caboodle/src/Modules/ProductSpec/Modules.ProductSpecs.Domain/ProductSpec/ProductSpec.cs:12-38`

What defines a product/SKU:
| Field | Meaning |
|---|---|
| `BrandID` | Owning brand (line 13) |
| `CategoryID` (nullable) | Which category it belongs to (line 12) |
| `Name` | Product name, required (line 14) |
| `BrandCode` | Brand's own product code (line 15) |
| `Description` | Free text (line 16) |
| `CaseUPC` (number, nullable) | UPC of the case (line 17) |
| `UPCNumber` | Unit UPC — required, the key identifier (line 18) |
| `Size` + `UOM` | Pack size and unit of measure (lines 19-20) |
| `CasePack` | How many units per case (line 21) |
| `ItemHeight/Width/Length` | Individual item dimensions (lines 22-24) |
| `IndvCaseHeight/Width/Length` | Case dimensions (lines 25-27) |
| `PalletTie`, `PalletHigh`, `PalletCount` | Pallet configuration (lines 28-30) |
| `GrossWeight`, `NetWeight` | Weights (lines 31-32) |
| `KeHECode`, `UNFICode`, `UNFIEastCode`, `UNFIWestCode` | Distributor-specific item codes (lines 33, 34, 37, 38) |
| `Miscellaneous` | Free text (line 35) |
| `ImageURL` | Product image (line 36) |

Note: nearly every field except `Name` and `UPCNumber` is optional (nullable) at the database level.

### PriceList
`caboodle/src/Modules/ProductSpec/Modules.ProductSpecs.Domain/PriceList/PriceList.cs:11-18`
| Field | Meaning |
|---|---|
| `BrandID` | Owning brand |
| `ProductID` | Which product this price is for |
| `Name` | Copy of the product name at time of pricing (denormalized) |
| `DistributorID` (nullable) | Which distributor / delivery method the price is from |
| `CategoryID` (nullable) | Copy of the product's category |
| `CasePrice` (nullable) | Case-level price |
| `PerUnitPrice` (nullable) | Per-unit price |
| `ValidFrom` (nullable) | Date the price becomes effective |

**A PriceList row = "product X costs this much from distributor Y starting on date Z."** There is **no `ValidTo` / end date** — see Gaps.

---

## Business Rules & Validation

Validators (`AbstractValidator`/`CustomValidator`) run automatically before the handler; a failure returns HTTP 400.

### Category rules
- **Name is required** (`Categories/UpsertCategoryRequest.cs:26-30`).
- **Name must be unique within the brand**, case-insensitive, on both create and update (`Categories/UpsertCategoryRequest.cs:62-74`). Note: the "already exists" error is thrown as a 404 rather than a 409/400 (`:65`, `:73`) — cosmetic inconsistency.
- A category **cannot be deleted** while any non-deleted price list OR product still references it (`Categories/DeleteCategoriesRequest.cs:80-121`).

### Product rules
- **Required fields: Name, CasePack, CategoryID, UPCNumber** (`ProductSpecifications/UpsertProductSpecRequest.cs:56-78`). So although `CategoryID` is nullable in the database, the create/update API always demands one.
- **UPC uniqueness within the brand.** Before creating a product — or before changing an existing product's UPC — the system checks no other non-deleted product in the brand already has that UPC, else it errors "Product with same UPC already exists!" (`UpsertProductSpecRequest.cs:176`, `:193-196`, `:330-338`; matching rule in `Specifications/GetProductUsingUPCNumberSpec.cs:9`).
- **UPC is normalized/cleaned**: trimmed and stripped of `$`, `,`, `%`, and `-` characters before saving (`UpsertProductSpecRequest.cs:317-328`). The uniqueness check compares the raw request value, but the stored value is the cleaned one (see Gaps).
- On update, the selected category must exist, belong to the brand, and not be deleted (`UpsertProductSpecRequest.cs:203-212`); the product itself is validated the same way (`:186-189`).
- **Per-unit price cannot be negative** on any price operation (`UpsertPriceListRequest.cs:153-159`, `CreatePriceListRequest.cs:150-156`, import `ExportImport/ImportPriceListRequest.cs:140-143`).

### Price List rules & effective-dating
- **Required: DistributorID and ProductID** (`UpsertPriceListRequest.cs:32-42`); the create-many variant requires DistributorID + at least one product (`CreatePriceListRequest.cs:32-44`).
- **Uniqueness key = Product + Distributor + ValidFrom (compared by date only).** You cannot have two prices for the same product/distributor with the same `ValidFrom` date; rows with no `ValidFrom` also collide with each other (`UpsertPriceListRequest.cs:180-201`, `CreatePriceListRequest.cs:170-178`, import `:264-272`). This is how the system supports multiple prices over time: **different `ValidFrom` dates = separate price rows.**
- **Editing the effective date creates a NEW row, not an in-place edit.** In upsert, if you change `ValidFrom` on an existing price, the code treats it as a brand-new price record (checks for duplicates, then inserts) instead of updating the existing one (`UpsertPriceListRequest.cs:91-100`, `:117`). If `ValidFrom` is unchanged, only the price is updated in place.
- When a price changes, the system pushes the new per-unit price into related promo/trade-spend events (`UpsertPriceListRequest.cs:125-145`, `CreatePriceListRequest.cs:117-125`). Where no `ValidFrom` is given it uses `DateTime.MaxValue` as the effective date for that propagation (`UpsertPriceListRequest.cs:131`, `:143`).
- **Auto-generated price lists on product save:** when a product is created, or when its category changes, the system automatically creates empty (price-less) PriceList rows for every eligible "leaf" distributor of the brand that doesn't already have one for that product/category (`UpsertProductSpecRequest.cs:139-145`, `:281-315`, distributor query `:341-368`). If the category changed, the old category's price rows for that product are soft-deleted (`:147-163`, `:224-227`).

---

## Key Operations (what the user does + what actually happens)

### Categories (`CategoriesController.cs`)
| User action | Endpoint | What actually happens |
|---|---|---|
| List my categories | `GET /categories` (:11) | Paged, searchable, sorted list for the brand |
| View one | `GET /categories/{id}` (:56) | Single category |
| Admin: list all | `GET /categories/for-admin` (:70) | Cross-brand list (permissioned) |
| Create / edit | `POST /categories` (:91) | Upsert; enforces unique name in brand |
| Import | `POST /categories/import` (:102) | Bulk-create categories from an uploaded file |
| Export | `GET /categories/export` (:34) | Downloads category list as a file |
| Link products to a category | `PATCH /categories/{id}/link-product` (:113) | Sets the given products' `CategoryID` to this category (`AddProductsWithCategoryRequest.cs:82-89`) |
| Remove products from a category | `PATCH /categories/{id}/remove-product` (:128) | Detaches products from the category |
| Delete | `DELETE /categories` (:143) | Soft-deletes only categories not referenced by products/prices |

### Products (`ProductSpecsController.cs`)
| User action | Endpoint | What actually happens |
|---|---|---|
| List my products | `POST /productspecs` (:13) | Paged list; filter by name/UPC, case pack, categories |
| Filter options | `GET /productspecs/filters` (:38) | Distinct case packs + categories for filter UI |
| Admin: list all | `GET /productspecs/for-admin` (:49) | Cross-brand list (permissioned) |
| View one w/ pricing | `GET /productspecs/{productID}` (:72) | Product details + its price rows (`ProductDetailsWithPricingDTO`, DTOs `:235`) |
| Products for a banner SKU | `GET /productspecs/for-bannerSku/{bannerID}` (:86) | Product picklist for banner assignment |
| Create / edit | `POST /productspecs/upsert` (:150) | Upsert; UPC uniqueness, auto-generates distributor price rows, propagates name changes by UPC to shared data (`UpsertProductSpecRequest.cs:130-137`), and enqueues creation of Banner SKUs on new products (`:275-276`) |
| Import | `POST /productspecs/import` (:139) | Bulk product import from file |
| Export / sample file | `POST /productspecs/export` (:100), `GET /export-sample-file` (:125) | Downloads |
| Delete (safe) | `DELETE /productspecs` (:161) | Soft delete, blocked if referenced (see Gaps re: the reference checks) |
| Force delete | `DELETE /productspecs/force-delete` (:172) | **Hard delete** — physically removes the product AND its rows in DistributorAPLs, MarketOverviews, BannerSKUs, PriceList, TradeSpend promo events, and Sandbox events (`ForceDeleteProductSpecRequest.cs:100-107`) |

### Price Lists (`PriceListsController.cs`)
| User action | Endpoint | What actually happens |
|---|---|---|
| Create/edit one price | `POST /pricelists/upsert` (:9) | Upsert a single product/distributor price; date-change = new row |
| Create prices for many products | `POST /pricelists/create` (:20) | One distributor + a list of products; skips duplicates, reports partial success (`CreatePriceListRequest.cs:133-147`) |
| List prices | `POST /pricelists` (:31) | Paged/filterable (product, distributor, price range, start date) |
| List grouped by distributor | `POST /pricelists/by-distributor` (:59) | Distributor + product count |
| Admin: all prices | `GET /pricelists/for-admin` (:87) | Cross-brand (permissioned) |
| View one | `GET /pricelists/{id}` (:108) | Single price |
| Import | `POST /pricelists/import` (:133) | Matches products & distributors by **name**; returns a CSV of failed rows with reasons (`ImportPriceListRequest.cs:189-194`) |
| Export / sample file | `POST /pricelists/export` (:144), `GET /export-sample-file` (:171) | Downloads |
| Delete | `DELETE /pricelists` (:122) | Soft-delete selected price rows |

---

## Who Can Access

**Cross-cutting fact:** The base controller (`VersionedApiController` → `BaseApiController`, `caboodle/src/Hosts/API/Controllers/BaseApiController.cs`) has **`[ApiController]` but no `[Authorize]`** and no default permission. Authorization is enforced only where a `[MustHavePermission(action, resource, module)]` attribute is present (which maps to `Permissions.{Module}.{Resource}.{Action}`). Endpoints without it have **no explicit permission gate in this module.**

| Endpoint | Permission attribute | Notes |
|---|---|---|
| `GET /categories/for-admin` | `View / Categories / Category` (`CategoriesController.cs:71`) | Admin-style, cross-brand |
| `GET /productspecs/for-admin` | `View / ProductsSpec / ProductSpec` (`ProductSpecsController.cs:50`) | Admin-style, cross-brand |
| `GET /pricelists/for-admin` | `View / PriceLists / PriceList` (`PriceListsController.cs:88`) | Admin-style, cross-brand |
| **All other Category endpoints** (list, get, upsert, import, export, link/remove product, delete) | **None** — no `[MustHavePermission]` | Brand-scoped via `BrandID` header + current user's brand only |
| **All other Product endpoints** (list, filters, get-by-id, for-bannerSku, export, sample, import, upsert, delete, force-delete) | **None** | Same — no permission attribute; **force-delete (hard delete) has no permission gate** |
| **All other PriceList endpoints** (upsert, create, list, by-distributor, get, delete, import, export, sample) | **None** | Same |

> **Unclear from code (within this module):** Whether a *global* authentication filter/middleware still requires a logged-in user for the non-attributed endpoints. The controllers rely on `_currentUser.GetBrandID()`, which implies an authenticated user, but no `[Authorize]` is visible here. Confirm in the API host's global filter/startup configuration. Per the cross-cutting role model: ADMIN has all permissions; BROKER/BROKERSUBUSER are limited to the Broker module (so the three `for-admin` endpoints are effectively ADMIN/brand-permission holders only); BRANDOWNER/BRANDSUBUSER permissions are seeded elsewhere.

---

## Dependencies

- **CRM module — Distributors:** price lists reference distributors; auto-generated price rows and price imports read `CRM.Distributors` / `CRM.DistributorBrands` (`UpsertProductSpecRequest.cs:341-368`, `ImportPriceListRequest.cs:200-212`, distributor validation `UpsertPriceListRequest.cs:170-175`).
- **CRM — Banner SKUs:** creating a product enqueues Banner SKU creation (`UpsertProductSpecRequest.cs:275-276`); products linked to banner SKUs cannot be soft-deleted.
- **Trade Spend / Promo:** price changes propagate to promo events via `ISharedDataService.UpdatePromoEventsPerUnitPrice` (`UpsertPriceListRequest.cs:127`, `CreatePriceListRequest.cs:119`); force-delete also purges TradeSpend and Sandbox event rows.
- **Shared data hub:** product name changes propagate by UPC to other modules (`UpsertProductSpecRequest.cs:135`).
- **Broker module:** force-delete removes `Broker.DistributorAPLs` and `Broker.MarketOverviews` rows (`ForceDeleteProductSpecRequest.cs:101-102`).
- **Background jobs:** Hangfire (`IJobService`, `IBackgroundJobDispatcher`) for name propagation and banner-SKU creation.

---

## Gaps, TODOs & Inconsistencies

1. **Safe-delete reference check is broken (likely a bug).** In `DeleteProductsSpecRequest.cs`, all three "is this product referenced?" checks — meant to check Banner SKUs, Price Lists, and APL — actually query the **same `CRM.BannerSKUs` table** (`:66-71`, `:84-89`, `:102-107`). The Price List and APL checks are copy-paste duplicates and do not check their intended tables. A product referenced only in a price list or APL may therefore be soft-deletable when it shouldn't be. **Recommend confirming with engineering.**
2. **No price end-date.** `PriceList` has `ValidFrom` but no `ValidTo`; the system models a price history as multiple `ValidFrom`-dated rows and never explicitly closes a price (`PriceList.cs:18`). How "current price" is chosen among multiple dated rows is **Unclear from code** in this module (likely resolved by the reporting/promo layer).
3. **`CasePrice` on the domain is never set by the write APIs.** `PriceList.CasePrice` exists (`PriceList.cs:16`) but neither upsert/create/import sets it — they set only `PerUnitPrice`. The DTOs instead expose a `CaseCost` field (`DTOs/PriceListDTO.cs:18`, `:39`) which is **Unclear from code** how/where it is computed (not in these handlers).
4. **UPC uniqueness vs. UPC cleaning mismatch.** The stored UPC is stripped of `$ , % -` (`UpsertProductSpecRequest.cs:317-328`), but the duplicate check compares the **raw** request value against stored (cleaned) values (`:176`, `:332`). Two UPCs that differ only by punctuation could both pass the check yet collide after cleaning. **Recommend confirming.**
5. **"Already exists" errors thrown as 404.** Duplicate-category-name errors use `Throw404Exception` (`UpsertCategoryRequest.cs:65`, `:73`) rather than a conflict/validation status — a client-facing status-code inconsistency.
6. **Force-delete is a hard, cross-module cascade with no permission gate** (`ProductSpecsController.cs:172` has no `[MustHavePermission]`; handler physically deletes across 7 tables, `ForceDeleteProductSpecRequest.cs:100-107`). High-impact operation; access control should be verified.
7. **`CheckAlreadyExistsAsync` loads the entire brand price list into memory** and filters in C# (`UpsertPriceListRequest.cs:183-201`; similar full-table loads in `CreatePriceListRequest.cs:80-81` and `ImportPriceListRequest.cs:85-87`). Potential performance concern at scale — noted, not fixed.
8. **`for-admin` endpoints ignore the `BrandID` header** (no `[BrandIDHeader]`, take `brandID` as an optional query param) — intentional for cross-brand admin views, but worth noting the differing scoping model.
