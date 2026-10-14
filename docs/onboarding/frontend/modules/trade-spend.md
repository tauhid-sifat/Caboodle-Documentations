# Trade Spend Module (Live Promotions)

> Audience: Business Analyst. Plain-language, code-grounded. Every rule cites `path:line` in the backend repo (`caboodle.backend/`). Where the code is ambiguous, it says so.

## Purpose

Trade Spend is the core promotional-planning engine. A brand plans **promotions** ("promos") for the year — for example, a temporary price reduction (TPR) at a particular retailer/banner on a particular product — and the system tracks the money involved (allowances, lump-sum fees, projected promoted units/cases, revenue, and spend). This is the **live** side; a separate **Sandbox** module (see [trade-spend-sandbox.md](trade-spend-sandbox.md)) is used for what-if planning, and promos can be pushed between the two.

A promotion is a header record (name, categories, brand) with many **events** underneath it. Each event is one planned promotional activity for a specific month/period, retailer, banner, and product, carrying its own financial inputs.

## Domain Entities

- **TradeSpendPromo** (`Modules.TradeSpend.Domain/TradeSpend/TradeSpendPromo.cs`) — the promotion header. Key business fields: name, the brand it belongs to (`BrandID`), and the list of category IDs it covers. Soft-deleted via the shared `Deleted` flag (see the cross-cutting note below).
- **TradeSpendPromoEvent** (`.../TradeSpend/TradeSpendPromoEvent.cs`) — one promotional event under a promo. Carries the financial inputs a planner enters: per-unit price, event lift %, average weekly sales (velocity), everyday allowance, promoted unit scan allowance, promoted case allowance (OI and MCB), lump-sum proposed (the "TPR fee"), unit SRP, banner ACV, number of stores, scan percentage, a `Status` (see lifecycle), an `IsSubmitted` flag, a free-text `SubmissionNo`, and a `SandboxEventID` link back to a sandbox event if it originated there.
- **TradeSpendPromoNote** (`.../TradeSpend/TradeSpendPromoNote.cs`) — free-text notes attached to the "Promos at a Glance" view.
- **BrandApprovedMonthlyReport** (`.../MonthlyReport/BrandApprovedMonthlyReport.cs`) — a stored monthly-report snapshot/approval record used by the monthly-report features.

*Cross-cutting:* all four inherit `AuditableEntity`, so every record keeps who/when created and modified, and "delete" normally means the `Deleted` flag is set (soft delete), not physical removal. Reads through EF automatically hide soft-deleted rows; raw-SQL reads filter `Deleted = FALSE` explicitly.

## Promo Event Status Lifecycle

The status values live in `BuildingBlocks/Core/Shared/Enums/Enums.cs:191` (`PromotionEventStatus`): **Active (1), Cancelled (2), Pending (3), DidNotRun (4), Declined (5), RetailerApproved (6), Completed (7)**.

**Critical finding — this module never *sets* the status.** Across all 15 command/query handlers examined, no live-TradeSpend handler ever writes `TradeSpendPromoEvent.Status`. It is only:
- **Read** to decide which events are financially calculated — only events in **Active, Pending, RetailerApproved, or Completed** are included in spend/revenue math; all others are returned untouched with no computed spend (`DTOBuilder/TradeSpendDTOBuilder.cs:60-95`).
- **Copied verbatim** when a promotion is duplicated (`DuplicateTradeSpendRequest.cs:195`).

So the status transitions (e.g. who moves an event to *RetailerApproved* or *Completed*) are **not performed by any handler in this module** — they must be set elsewhere. *Unclear from code which handler sets `Status`; this should be confirmed with engineering, because the approval lifecycle a BA would expect is not implemented in the live TradeSpend command handlers.*

By contrast, the **`IsSubmitted`** flag (broker submission) *is* managed here — see "Submit / un-submit events" below.

## Business Rules & Validation

- A promotion must have a non-empty **name**, at least one **category**, and at least one **event** (`UpsertTradeSpendPromoRequest.cs:41-53`).
- Each event must specify month, event name, start date, end date, retailer, banner, product, and category (`UpsertTradeSpendPromoRequest.cs:325-349`). The EDLP-only variant additionally requires a **distributor** and uses **year** instead of month (`UpsertEDLPOnlyPromotionRequest.cs:332-355`).
- **Promo name must be unique per brand** (case-insensitive, ignoring soft-deleted promos), checked on create and on rename (`UpsertTradeSpendPromoRequest.cs:105,114`; `GetTradeSpendPromoNameExistRequest` → `TradeSpendDTOBuilder.cs:14-35`).
- **An event's number of stores may not exceed the banner's door count** (`UpsertTradeSpendPromoRequest.cs:315-320`).
- **Per-unit price is auto-derived server-side**, not taken from the user: the system looks up the brand's price list for the matching category+distributor+product effective on/before the event start date, and takes the most recent price; **if none is found the price defaults to 0** (`UpsertTradeSpendPromoRequest.cs:362-372`).
- Editing average weekly sales rejects a value of **0** because the field is validated as "not empty" on a non-nullable number — a legitimate 0 velocity cannot be saved through that endpoint (`UpdateAverageWeeklySalesRequest.cs:39-43`). *Likely-unintended; flag.*

## Key Operations

- **Create/update a regular promotion + events** (`UpsertTradeSpendPromoRequest`) — one call saves the header and all its events. New events are inserted, existing ones (matched by event ID) updated. All financial fields are stored exactly as entered (no server-side math except the derived per-unit price).
- **Create/update an EDLP-only promotion** (`UpsertEDLPOnlyPromotionRequest`) — same pattern for "Every Day Low Price" promos, whose events span a full calendar year (Jan 1–Dec 31). *Known bug:* when editing a Regular-type event inside an EDLP upsert, the code rebuilds the event's dates from the year (snapping to Jan 1–Dec 31) instead of honoring the entered dates (`UpsertEDLPOnlyPromotionRequest.cs:269-270`).
- **Rename a promotion** (`UpdateTradeSpendPromoRequest`) — header name only.
- **Edit a single event** (`UpdateTradeSpendPromoEventRequest`) — overwrites the event's fields. Ownership is enforced only by matching the parent promo ID, not the brand (`:107-110`).
- **Bulk-set average weekly sales for one SKU across a promo** (`UpdateAverageWeeklySalesRequest`).
- **Submit / un-submit events** (`UpdateSubmissionStatusOfEventsRequest`) — the real "submission" action: sets `IsSubmitted` true/false on all events matching the chosen filters (month/retailer/distributor/banner/category/year). **Role-aware:** if the caller is a BROKER or BROKERSUBUSER, results are restricted to brands linked to that broker via `Brand.BrandBrokers` (`:105-115`). *Known defect:* the distributor filter references a table alias that is never joined, so passing `DistributorIDs` would produce failing SQL (`:183` vs unused join `:191-218`).
- **Duplicate a promotion into a new year** (`DuplicateTradeSpendRequest`) — clones header + events, re-basing dates into the target year. **Carries over both `IsSubmitted` and `Status`, and the `SandboxEventID` link** — copies are *not* reset to a fresh/unsubmitted state (`:191,195,155`). The year guard only checks the first event's year, not all events (`:76-77`).
- **Push a promotion to the Sandbox** (`PushPromotionToSandboxRequest`) — delegates to a shared service; the actual copy logic lives outside this module (`:63`).
- **Delete promotions** (`DeleteTradeSpendPromotionsRequest`) — **soft delete** (sets `Deleted`), cascading the flag to child events. *No brand-ownership check* — a caller who knows the IDs could delete another brand's promos (`:46-67`). **Flag as a tenant-isolation risk.**
- **Delete events within a promo** (`DeleteTradeSpendPromoEventsRequest`) — soft delete; this one *does* verify the parent promo's brand ownership (`:46-50`).
- **Get one promotion with full financials** (`GetTradeSpendPromoRequest`) — the big read; see "Financial calculations."
- **List promotions** (`GetTradeSpendPromosRequest`) — paged/searchable list. *Surprising behavior:* the list query inner-joins events→products→banners, so **a promotion with no non-deleted events/products/banners silently disappears from the list** (`:74-85`).
- **Promos at a Glance** — a cross-promotion view with its own list, export, and notes (create/read/delete) endpoints.
- **Monthly Report** — refresh, filter options, multi-year, grand totals, an Excel export (background job), a backfill operation, and an "actuals" template + chunked import.

### Financial calculations (read-side only)

All money math happens when reading a promo (`GetTradeSpendPromoRequest` → `TradeSpendDTOBuilder.cs`), never on write:
- **Non-promo (baseline) cases** = round((stores × weeks-not-on-promo × avg weekly sales) ÷ case pack) (`:555-557`).
- **Promo cases**, **promo revenue** (with and without allowance), and **TPR spend** are computed via helper calculators using case cost, total case allowance, lift, weeks, stores, and velocity (`:708-736`).
- **TPR fees** = sum of each event's lump-sum-proposed (`:761-806`).
- **Points of Distribution (POD)** = max number of stores × number of distinct SKUs (`:331`).
- **SKU lifecycle bounds revenue:** events before a SKU's Active Date are date-clamped, and events entirely outside the SKU's active/discontinued window earn $0 (`:179-205,495-545`).

## Who Can Access

The `TradeSpendsController` (`Hosts/API/Controllers/Modules/TradeSpend/TradeSpendsController.cs`) and its base classes carry **no `[MustHavePermission]` and no `[Authorize]` attribute** on any endpoint (verified across the whole controller). This means these endpoints are **not gated by any specific permission** — any caller who passes the app's baseline authentication can reach them, and **tenant isolation is enforced inside the handlers** via the current user's brand ID (`GetBrandID()`), not by RBAC. See the [Role & Permission Matrix](../02-role-permission-matrix.md) for whether unauthenticated access is possible (the fallback authorization policy is null, `PermissionPolicyProvider.cs:30`). **This is a notable access-control gap for a BA to be aware of:** the trade-spend surface has no role/permission restrictions in code.

The only role-sensitive behavior is data-scoping: brokers see only their linked brands' events in the submission-status operation (`UpdateSubmissionStatusOfEventsRequest.cs:105-115`).

## Dependencies

- **Product Specs** (price lists) — read to derive per-unit price for events.
- **CRM** — reads Banners (door counts), Retailers, Distributors, BannerSKUs, Products, Categories in event queries; reads `Brand.BrandBrokers` for broker scoping.
- **Trade Spend Sandbox** — push-to-sandbox and the `SandboxEventID` linkage.
- **Shared import/job infrastructure** — monthly-report actuals use the same S3 + Hangfire chunked-import pipeline as Data Upload.

## Gaps, TODOs & Inconsistencies

1. **No RBAC on the entire trade-spend surface** — no permission attributes; access control is only the baseline auth + in-handler brand scoping.
2. **Status lifecycle is not implemented here** — no handler sets `PromotionEventStatus`; the approval flow (RetailerApproved/Completed/etc.) a BA expects is absent from these handlers. *Confirm with engineering where status is set.*
3. **Delete promotions has no brand-ownership check** (`DeleteTradeSpendPromotionsRequest.cs:46-67`) — cross-tenant delete risk.
4. **Broken distributor filter** in bulk submission (`UpdateSubmissionStatusOfEventsRequest.cs:183`).
5. **EDLP upsert snaps Regular-event dates to the whole year** (`UpsertEDLPOnlyPromotionRequest.cs:269-270`).
6. **Average-weekly-sales of 0 is rejected** by validation (`UpdateAverageWeeklySalesRequest.cs:39-43`).
7. **Duplicated promos inherit submission/status/sandbox links** rather than resetting (`DuplicateTradeSpendRequest.cs:155,191,195`).
8. **List/detail views hide promos or events whose related master records were deleted** (inner joins) — "event not found" can actually mean "a related retailer/banner/product was deleted" (`GetTradeSpendPromoEventRequest`, `GetTradeSpendPromosRequest`).
