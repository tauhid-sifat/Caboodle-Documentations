# CRM Module — Banners & Sales Pipeline

> Audience: Business Analysts (non-technical). Every claim cites the backend source file and line so it can be verified. Backend root: `/d/Projects/caboodle.backend`. Citations are written as `path.cs:line`.
>
> Cross-cutting facts assumed throughout (established elsewhere in the platform):
> - All entities inherit `AuditableEntity`, so records are **soft-deleted** (a `Deleted` flag is set, the row is not physically removed). Entity Framework (EF) queries auto-hide deleted rows; raw SQL (Dapper) queries must filter `"Deleted" = FALSE` by hand.
> - Request validators (`AbstractValidator`/`CustomValidator`) run automatically before the handler; a failure returns HTTP 400.
> - `IRepository<T>` = Entity Framework access; `IDapperRepository` = hand-written SQL.
> - `[MustHavePermission(action, resource, module)]` gates an endpoint on a specific permission. The base controller has **no** `[Authorize]`, so an endpoint with no permission attribute performs **no authorization check at the attribute level** (see "Who Can Access").
> - Data lives in a Postgres `"CRM"` schema.

---

## Purpose

This module supports a brand's field-sales and account-management workflow around **retail Banners** (store chains / sub-brands of a retailer) and a **Sales Pipeline** (a Kanban-style board of deals moving through stages). It lets a brand:

- Maintain the list of Banners under each retailer, including door counts and region (`BannersController.cs:14`, `Banner.cs:11-14`).
- Track the products (SKUs) authorized/active at each Banner, with active/discontinue dates and slotting fees (`BannerSKU.cs:11-17`).
- Log **activities** (calls, meetings, notes) against a Banner, with @-mention email notifications (`BannerActivity.cs`, `UpsertBannerActivityRequest.cs:128-134`).
- Record retailer-specific **promo rules** (allowances, promo length, off-shelf requirements, deal types) (`RetailerPromoRules.cs`).
- Run a **sales pipeline** of deals ("tasks") organized into **Plans** and moved across **Deal Stages** with drag-and-drop ordering (`PipeLinesController.cs`, `Pipeline.cs`).

---

## Domain Entities

### Banner side (`Modules.CRM.Domain/Banner/`)

| Entity | What it represents | Key fields (cited) |
|---|---|---|
| **Banner** | A retail chain / store group under a retailer that the brand sells into. | `RetailerID`, optional `RegionID`, `BannerName`, `DoorCount` (`Banner.cs:11-14`). |
| **BannerSKU** | One product's placement at one Banner (i.e., "this product is/was carried at this Banner"). | `BrandID`, `BannerID`, `ProductID`, optional `ActiveDate`, `DiscoDate` (discontinue date), `Slotting` (fee, decimal), `Status` (integer code) (`BannerSKU.cs:11-17`). |
| **BannerActivity** | A logged interaction (note/meeting/call) about a Banner. | `BannerID`, `BrandID`, optional `ContactID`, `BannerActivityTypeID`, `ActivityDate`, `Notes` (`BannerActivity.cs:6-11`). |
| **BannerActivityType** | Lookup list of activity categories (e.g., "Call", "Email"). Actual names are data, not in code. | `ActivityType` (`BannerActivityType.cs:6`). |
| **RetailerPromoRule** | Promo/trade-spend rules for a retailer+banner+region combination. | `RetailerID`, `BannerID`, `RegionID`, free-text `NewItemPolicies`, `AddTPRFees`, `PromoLength`, `MinimumAllowance`, `OffShelfRequirements`, and boolean deal-type flags `OI`, `MCB`, `Scan`, plus `Notes` (`RetailerPromoRules.cs:11-22`). |

**Banner vs BannerSKU vs RetailerPromoRules (clarification):**
- A **Banner** is the store chain itself (name + door count + which retailer/region it belongs to).
- A **BannerSKU** is the join between a Banner and a single product — the brand's assortment at that Banner, one row per product, carrying dates/slotting/status.
- A **RetailerPromoRule** is the promotional rulebook for a retailer/banner/region (what allowances, promo length, deal mechanics like OI/MCB/Scan apply). It is not tied to individual products.

### Pipeline side (`Modules.CRM.Domain/Pipeline/`)

| Entity | What it represents | Key fields (cited) |
|---|---|---|
| **PipelinePlan** | A named board/collection that groups pipeline deals for a brand (e.g., a campaign or a fiscal-period plan). | `BrandID`, `Title` (`PipelinePlan.cs:6-7`). |
| **Pipeline** ("task"/deal card) | A single deal/opportunity card on the board. Note: the UI and messages call this a **"Task"**. | optional `Name`, optional `PlanID`, `BrandID`, `PipelineDealStageID` (which column it sits in), optional `RetailerID`, `DisplayOrder` (position within the stage) (`Pipeline.cs:6-11`). |
| **PipelineDealStage** | A column/stage of the board (e.g., "Prospecting", "Won"). Stages can be **global** (shared) or **brand-specific**. | optional `BrandID` (null = global/shared stage), `DealStage` (name), `DisplayOrder` (column order) (`PipelineDealStage.cs:6-8`). |
| **PipelineActivity** | A logged activity/comment against a deal card, optionally linked to a Banner activity and a contact, with a timestamp. | `PipelineID`, optional `BannerActivityID`, `ContactID`, `DateTimeAt`, `Description` (`PipelineActivity.cs:6-10`). |
| **PipelineActivityFile** | A file attachment on a pipeline activity (chunked upload to storage). | `PipelineActivityID`, `Name`, `Extension`, `Size`, `URL` (`PipelineActivityFile.cs:6-10`). |

**Plan vs Pipeline vs Activity (clarification):**
- A **Plan** is the board (a container of deals for one brand).
- A **Pipeline** row is one deal card ("Task") on that board; it lives in exactly one Deal Stage at a time and has an ordered position (`DisplayOrder`) within that stage.
- An **Activity** is a dated note/comment on a deal card, which can carry file attachments and can be cross-linked to a Banner activity.

---

## Deal-Stage Lifecycle

### What the stages are

Deal stages are **data-driven, not hard-coded**. There are no fixed stage names (e.g., "Prospecting → Won") defined anywhere in the code — the migration only creates the `PipelineDealStages` table with a free-text `DealStage` column (`Database/Migrator/Migrations/20230814061003_BusinessTablesCreation.cs:339`). No SQL seed of predefined stage names was found. Stages come in two flavors:
- **Global stages** — `BrandID` is null; visible to every brand (`GetPipeLineDealStagesRequest.cs:44-46` filters `"BrandID" IS NULL OR "BrandID" = @brandID`).
- **Brand-specific stages** — created by/for one brand (`CreatePipeLineDealStageRequest.cs:65-72` sets `BrandID` to the current brand).

Unclear from code — where the initial/global stages are seeded and what their default names are (not present in the CRM module or migrations searched).

### The lifecycle of a deal card

1. **Create a deal card** — `POST /pipelines` (`PipeLinesController.cs:143`, handler `UpsertPipeLineRequest.cs:67`). On create, the new card is placed at the **bottom of its chosen stage**: `DisplayOrder` = (highest existing order in that stage) + 1, or 1 if the stage is empty (`UpsertPipeLineRequest.cs:78-88`).
2. **Reorder within the same stage** — `PUT /pipelines/reorder` (`PipeLinesController.cs:199`, handler `ReOrderPipeLineRequest.cs:68`). Moves a card up/down inside its current stage and shifts the cards it passes over accordingly (`ReOrderPipeLineRequest.cs:87-152`).
3. **Move to a different stage** ("change deal stage state") — `PUT /pipelines/change-deal-stage-state` (`PipeLinesController.cs:211`, handler `UpdatePipeLineDealStageStateRequest.cs:73`). This is the core stage-transition operation.
4. **Delete a deal card** — `DELETE /pipelines` (`PipeLinesController.cs:223`, handler `DeletePipeLineRequest.cs`). Soft-deletes the card and its activities, and closes the gap by decrementing `DisplayOrder` of later cards in the same stage (`DeletePipeLineRequest.cs` reorder + delete SQL).

### Stage-transition rules (change-deal-stage-state)

The request carries `PipelineID`, `PreviousDealStageID`, `NewDealStageID`, and target `Order` (`UpdatePipeLineDealStageStateRequest.cs:19-25`). Rules enforced:

- **All four fields are required** (validator, `UpdatePipeLineDealStageStateRequest.cs:33-51`).
- **Order must be positive** — `Order <= 0` is rejected (`UpdatePipeLineDealStageStateRequest.cs:116-117`).
- **Cannot "move" to the same stage** — `PreviousDealStageID` == `NewDealStageID` is rejected (`UpdatePipeLineDealStageStateRequest.cs:118-119`); reordering within a stage uses the separate reorder endpoint instead.
- **Both stages must exist and be visible to the brand** — each stage ID must be a non-deleted row whose `BrandID` is null (global) or equals the current brand; otherwise 404 (`UpdatePipeLineDealStageStateRequest.cs:122-141`).
- **The deal card must exist and not be deleted** — else 404 (`UpdatePipeLineDealStageStateRequest.cs:77-79`).
- **Target position is clamped** — if the requested `Order` is beyond the end of the destination stage, it is snapped to last+1; if the destination stage is empty, `Order` becomes 1 (`UpdatePipeLineDealStageStateRequest.cs:81-85`).
- **Reordering is transactional across three SQL updates** run together (`UpdatePipeLineDealStageStateRequest.cs:87-98`, query built in `:163-191`):
  1. Close the gap in the **old** stage — decrement `DisplayOrder` of cards after the moved card.
  2. Make room in the **new** stage — increment `DisplayOrder` of cards at/after the target position.
  3. Update the moved card's `PipelineDealStageID` and `DisplayOrder` to the new stage/position.

**There are no "allowed transition" restrictions** — a card may move from any stage to any other stage; the only constraints are existence, brand-visibility, and "not the same stage." (No transition matrix or status-guard logic exists in `UpdatePipeLineDealStageStateRequest.cs`.)

### Creating / listing stages

- **Create a stage** — `POST /pipelines/dealstages` (`PipeLinesController.cs:262`); new stage is brand-specific and appended at the end by `DisplayOrder` (`CreatePipeLineDealStageRequest.cs:49-73`). Note: this endpoint is **hidden from the API docs** (`[ApiExplorerSettings(IgnoreApi = true)]`, `PipeLinesController.cs:266`).
- **List stages** — `GET /pipelines/dealstages` (`PipeLinesController.cs:275`); returns global + brand stages ordered by `DisplayOrder`, paged (`GetPipeLineDealStagesRequest.cs:35-49`). Also hidden from docs (`PipeLinesController.cs:279`).
- Editing/deleting stages is **not** in the CRM controller. A separate **Admin** module handler updates deal stages (`Modules/Admin/Modules.Admin.Application/PipeLine/UpdatePipeLineDealStageRequest.cs`) — see Dependencies.

---

## Business Rules & Validation

**Banners**
- Creating/updating a Banner requires `RetailerID`, `BannerName`, and `DoorCount`, all non-empty (`UpsertBannerRequest.cs:29-39`). The retailer must exist and not be deleted (`UpsertBannerRequest.cs:71-75`). Banner name is trimmed (`UpsertBannerRequest.cs:93`).
- Banner create/update runs a background job (`IJobService`) — Unclear from code exactly what it does (likely a rename-propagation job; injected at `UpsertBannerRequest.cs:50,61`).

**Banner SKUs**
- Create requires `BannerID` and at least one `ProductID` (`CreateBannerSKURequest.cs:41-49`). Duplicate product placements are skipped; if **every** requested product already exists, nothing is added and a validation error is returned ("No new record has been added due to duplicate information.") (`CreateBannerSKURequest.cs:78-116`).
- A separate maintenance endpoint removes duplicate SKU rows (`DELETE /banners/sku/duplicates`, `BannersController.cs:314`).

**Banner Activities**
- Requires a `BannerID`; the banner must exist (`UpsertBannerActivityRequest.cs:38-42, 84`). Optional `ContactID` must resolve to a real contact (`:92`). @-mentioned users receive an email with a link to the activity (`UpsertBannerActivityRequest.cs:128-134, 150-164`).

**Pipeline deals ("tasks")**
- Create/update requires a non-empty `Title` and a `PipelineDealStageID` (`UpsertPipeLineRequest.cs:29-37`). The stage must be visible to the brand (`:113-124`); the referenced `Plan` must belong to the current brand (`:138-143`); an optional `RetailerID` must exist (`:128-136`).
- A deal is always brand-scoped: handlers repeatedly check `BrandID == currentUser.GetBrandID()` before acting (e.g., `DeletePipeLineRequest.cs`, `UpsertPipeLineRequest.cs:150`).

**Plans**
- Create/update requires a non-empty `Title` (`UpsertPlanRequest.cs:25-29`); update only allowed on a plan owned by the current brand (`UpsertPlanRequest.cs:56-59`).
- **Delete plans is blocked if the plan still contains deals** — you must remove the tasks first ("Please remove the task(s) before deleting the plan(s).") (`DeletePlansRequest.cs:57-59` and the partial-success message at `:52-56`).
- **`add-default` (`POST /pipelines/plans/add-default`)** is a **one-time data-backfill/migration utility**, not a normal user action: it iterates **all** pipelines across **all** brands, creates a "Default Plan" per brand, and re-assigns every existing pipeline to it (`CreateDefaultPlanRequest.cs:29-55`). See Gaps.

---

## Key Operations (endpoint summary)

**Banners** (`BannersController.cs`)
- `POST /banners` upsert banner; `DELETE /banners` delete banners; `POST /banners/for-retailer` and `/for-retailer/global` list banners; `GET /banners/for-admin` admin list.
- Activities: `POST|GET /banners/{bannerID}/activities`, `DELETE /banners/{bannerID}/activities/{activityID}`.
- SKUs: `POST|PATCH /banners/{bannerID}/skus`, `POST /banners/{bannerID}/get-skus`, `GET /banners/skus`, `GET /banners/skus/for-admin`, `POST /banners/skus/for-promo`, `DELETE /banners/skus/delete`, `DELETE /banners/sku/duplicates`.
- Promo rules: `POST /banners/promorules` (list), `/promorules/export`, `/promorules/import`, `/promorules/upsert`, `DELETE /banners/promorules`.
- `GET /banners/with-distributor-connection`.

**Pipeline** (`PipeLinesController.cs`)
- Plans: `GET|POST|DELETE /pipelines/plans`, `POST /pipelines/plans/add-default`.
- Deals: `GET /pipelines/{planID}/tasks`, `GET /pipelines/{id}`, `POST /pipelines` (upsert), `PUT /pipelines/reorder`, `PUT /pipelines/change-deal-stage-state`, `DELETE /pipelines`.
- Activities: `GET|POST /pipelines/{pipelineID}/activities`, `DELETE /pipelines/{pipelineID}/activities/{activityID}/delete`, `POST /pipelines/file-upload`, `DELETE /pipelines/file`, `GET /pipelines/mentions`.
- Stages: `POST|GET /pipelines/dealstages` (both hidden from API docs).

---

## Who Can Access

Base controllers carry **no `[Authorize]`** (`BaseApiController.cs:5-6`, `VersionedApiController.cs:3-4`). Therefore any endpoint **without** a `[MustHavePermission]` attribute has **no attribute-level authorization enforced** (flagged ⚠️ below). Most also require a `[BrandIDHeader]`, which selects the acting brand but is a context header, not a permission.

| Endpoint | Permission attribute | Notes |
|---|---|---|
| `GET /banners/for-admin` | `View / Banners / Banner` (`BannersController.cs:87`) | Only permission-gated Banner read. |
| `GET /banners/skus/for-admin` | `View / BannerSKUs / BannerSKU` (`BannersController.cs:236`) | Only permission-gated SKU read. |
| `POST /banners` (upsert) | ⚠️ none (`BannersController.cs:14`) | No permission attribute. |
| `DELETE /banners` | ⚠️ none (`BannersController.cs:24`) | |
| `POST /banners/for-retailer`, `/for-retailer/global` | ⚠️ none (`:34, :60`) | BrandIDHeader only. |
| `POST|GET|DELETE /banners/{bannerID}/activities...` | ⚠️ none (`:109, :129, :154`) | |
| Banner SKU write/list (non-admin): `PATCH`/`POST /{bannerID}/skus`, `get-skus`, `skus`, `skus/for-promo`, `skus/delete`, `sku/duplicates` | ⚠️ none (`:168, :188, :208, :260, :271, :282, :303, :314`) | |
| All `/banners/promorules*` (list/export/import/upsert/delete) | ⚠️ none (`:325, :353, :384, :394, :404`) | |
| `GET /banners/with-distributor-connection` | ⚠️ none (`:414`) | |
| **All Pipeline endpoints** (plans, tasks, activities, reorder, change-stage, dealstages, file upload/delete, mentions) | ⚠️ none — no `[MustHavePermission]` anywhere in `PipeLinesController.cs` | Entire controller relies only on `[BrandIDHeader]` + in-handler `BrandID` ownership checks. |

Per cross-cutting role rules: ADMIN has all permissions; BROKER/BROKERSUBUSER are limited to the Broker module; BRANDOWNER/BRANDSUBUSER permissions are seeded elsewhere. Because the write/most-read endpoints above have **no permission attribute**, access to them is effectively governed only by authentication + the brand context header, not by module permissions — see Gaps.

---

## Dependencies

- **Retailer / Region / Contact** entities (other CRM areas): Banners reference `RetailerID`/`RegionID`; activities reference `ContactID` (`Banner.cs:11-12`, `BannerActivity.cs:8`); validated against their repositories (`UpsertPipeLineRequest.cs:128-136`).
- **Products**: `BannerSKU.ProductID` links to the Product Specs module (`BannerSKU.cs:13`).
- **Admin module** owns deal-stage editing: `Modules/Admin/Modules.Admin.Application/PipeLine/UpdatePipeLineDealStageRequest.cs` (the CRM controller only creates/lists stages).
- **File storage / chunked upload** for pipeline activity attachments (`UploadActivityFileRequest.cs`, `PipelineActivityFile.cs`).
- **Mail service** for @-mention notifications on banner activities (`UpsertBannerActivityRequest.cs:164`).
- **Background job service** (`IJobService`) triggered on banner upsert (`UpsertBannerRequest.cs:50`).
- **Trade-spend / Promo tooling** consumes banner SKUs (`GET /banners/skus/for-promo`, `BannersController.cs:260`) and promo rules.

---

## Gaps, TODOs & Inconsistencies

1. **No authorization on the entire Pipeline API and most Banner writes.** No `[MustHavePermission]` on any Pipeline endpoint and on Banner create/delete/activities/SKUs/promo-rules; combined with no base-class `[Authorize]`, these rely solely on authentication + brand header + in-handler brand checks. Confirm this is intended (`PipeLinesController.cs` throughout; `BannersController.cs:14, 24, 109, 325`).
2. **Likely bug in Delete-Plans guard logic.** `GetDeletablePlanIDsAsync` selects plan IDs that **have** tasks (i.e., are *not* deletable) yet the method is named "deletable," and it only throws when **every** selected plan has tasks (`existingPlanIDs.Count == planIDs.Count`), so a mixed selection may proceed inconsistently (`DeletePlansRequest.cs` `:44-59`). Worth a functional review.
3. **`plans/add-default` is an all-tenant data migration exposed as a normal POST endpoint.** It rewrites pipelines for **every brand**, not just the caller's, and has no permission attribute (`CreateDefaultPlanRequest.cs:29-55`, `PipeLinesController.cs:47`). This is dangerous if callable in production.
4. **Deal-stage names/seed unknown.** No predefined stages or seed data found in the CRM module or migrations — stage names are entirely data-driven. Unclear from code — where global stages originate and their default set.
5. **No allowed-transition matrix.** A deal can jump from any stage to any other stage; there is no "you can't skip/regress stages" rule (`UpdatePipeLineDealStageStateRequest.cs:118-141` only checks existence and not-same-stage). Confirm this matches business expectations.
6. **`BannerSKU.Status` is an untyped integer** with no enum in the domain (`BannerSKU.cs:17`); the meaning of status codes is not defined in code — Unclear from code.
7. **`DoorCount` uses `NotEmpty()`**, which in FluentValidation rejects 0 — so a Banner with zero doors cannot be saved (`UpsertBannerRequest.cs:37-39`). Confirm 0 should be disallowed.
8. **Naming inconsistency:** the domain type is `Pipeline` but all user-facing messages call it a **"Task"** (`UpsertPipeLineRequest.cs:109`, `DeletePipeLineRequest.cs`), and the folder is `PipeLines` (mixed casing). Cosmetic but confusing across BA/dev conversations.
