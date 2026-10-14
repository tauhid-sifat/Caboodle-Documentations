---
type: Document
title: "Trade Spend Sandbox Module"
---

# Trade Spend Sandbox Module

> Audience: Business Analyst. Code-grounded; cites `path:line` in `caboodle.backend/`. Some handlers were fully traced in this pass; a few are listed from the controller with their internals marked "not yet traced" — those are honest gaps, not assumptions.

## Purpose (and how the Sandbox differs from live Trade Spend)

The Sandbox is a **what-if planning area** for promotions, separate from the live [Trade Spend](trade-spend.md) module. A planner can build and adjust promotions here without touching live plans, then move them across. Tellingly, the code uses **different names** for the same concepts: live uses `TradeSpendPromo`/`TradeSpendPromoEvent`; the sandbox uses **`Promotion`/`PromotionalEvent`**. The two modules are near-mirrors of each other, with two important differences: (1) the sandbox has explicit **event-status** endpoints (live does not), and (2) the sandbox deletes events with a **hard SQL delete** (live soft-deletes).

## Domain Entities

- **Promotion** (`Modules.TradeSpendSandbox.Domain/Promotion/Promotion.cs`) — the sandbox promotion header: name, `BrandID`, category IDs. Soft-deleted via `Deleted`.
- **PromotionalEvent** (`.../PromotionalEvent/PromotionalEvent.cs`) — a sandbox event with the same financial inputs as a live event (per-unit price, lift, allowances, avg weekly sales, SRP, ACV, number of stores, scan %), plus `PromotionType` (Regular / EdlpOnly) and a `Status`.
- **SandboxMonthlyReport** (`.../MonthlyReport/SandboxMonthlyReport.cs`) — the sandbox equivalent of the live monthly-report snapshot.

All inherit `AuditableEntity` (audit fields + soft-delete) — *except* that one delete path bypasses soft-delete (see below).

## Sandbox ↔ Live Relationship

Data can move **both directions**, each via a controller endpoint that delegates the actual copy to a shared service:
- **Live → Sandbox:** the live module's `push-to-sandbox` calls `CreatePromotionInSandboxAsync` on the shared data service (see [trade-spend.md](trade-spend.md)).
- **Sandbox → Live:** `TradeSpendsSandboxController.cs:59` exposes `POST {id}/push-to-tradespend` (`PushPromotionIntoTradeSpendAsync`). *Internals not traced in this pass — the copy logic lives in a shared service, consistent with the live-side pattern. Confirm whether it creates or updates live promos and how it sets the `SandboxEventID` back-link.*

The live event's `SandboxEventID` field is the durable link between a live event and its sandbox origin.

## Promotion / Event Status

Unlike live Trade Spend, the sandbox **does** manage event status: `TradeSpendsSandboxController.cs:74` and `:151` expose event-status update endpoints (`UpdateEventStatusAsync` / `UpdateEventsStatusAsync`, request `UpdateEventsStatusRequestPayload`). *The handler internals (which statuses, transition rules) were not traced in this pass — recommend a follow-up read of `UpdateEventsStatusRequest`.* The status enum is the shared `PromotionEventStatus` (Active, Cancelled, Pending, DidNotRun, Declined, RetailerApproved, Completed — `Enums.cs:191`).

## Business Rules & Validation (traced handlers)

- **Create/update EDLP-only promotion** (`UpsertEDLPOnlyPromotionRequest.cs`): name required (`:40-43`), at least one category (`:45-47`), at least one event (`:49-51`); name must be unique per brand on create and rename (`:98-125`); an event may not have more stores than the banner's door count (`:266-301`); an event marked Active whose SKU active-date falls after Jan 1 of the promo year is rejected (`:166-176`). Per-unit price is auto-populated from the brand price list (`:306`).
- **Rename promotion** (`UpdatePromotionRequest.cs`): ID and name required (`:22-38`); loads by ID with 404 if missing/deleted/wrong brand (`:60-64`); unique-name check on rename (`:66-70`).
- **Edit one event** (`UpdatePromotionalEventRequest.cs`): event name, start date, end date, month required (`:60-88`); overwrites all editable fields (`:116-131`). *Defects:* ownership check verifies only that the event's promotion ID matches the request, **not** the brand — a cross-tenant gap (`:111`); it also doesn't check the `Deleted` flag, so a soft-deleted event could be revived; and an injected Dapper repository is never used (dead dependency) (`:95,104`).
- **Bulk-set average weekly sales for a SKU** (`UpdateAverageWeeklySalesRequest.cs`): same 0-is-rejected validation quirk as live (`:39-43`).
- **Check promo-name availability** (`CheckPromotionNameAlreadyExistRequest.cs`): brand-scoped, case-insensitive, excludes soft-deleted (`:52`).
- **List promotions** (`GetPromotionsRequest.cs`): paged/searchable; **inner-joins events→products→banners, so a promotion with no non-deleted events/products/banners does not appear** (`:71-82`) — same surprising behavior as live.
- **Get promotion details** (`GetPromotionDetailsRequest.cs`): loads by ID with 404 if missing/deleted/wrong brand (`:53-57`), then builds the full detail via a shared builder.

## Key Operations

- **Delete promotional events** (`DeletePromotionalEventsRequest.cs`) — **⚠ HARD DELETE.** Events are physically removed with raw SQL `DELETE FROM "TradeSpendSandbox"."PromotionalEvents" WHERE "ID" = ANY(@EventIDs)` (`:102-111`), bypassing the module's soft-delete convention (data loss / no audit trail). Worse, **the delete is scoped only by event ID, not by promotion or brand** — a caller who owns one promo could delete events belonging to another promotion or brand by passing their IDs (`:104`). When an EDLP event is deleted, matching Regular events' everyday allowance is zeroed, but that reset only runs for events found within the owned promo, and there is no transaction wrapping the delete + reset (`:85-116`).
- **Other endpoints present on the controller (internals not traced this pass):** create/update regular promotion (`UpsertPromotionRequest`, `POST /`), duplicate promotion (`DuplicateSandboxPromotionRequest`, `POST duplicate`), delete promotions (`DeletePromotionsRequest`, `DELETE /`), event-status updates, list/detail filter-properties, and push-to-tradespend. These mirror the live module; a follow-up read is recommended to document their exact rules.

## Who Can Access

`TradeSpendsSandboxController` extends the same base as live and carries **no `[MustHavePermission]` and no `[Authorize]`** attributes on any endpoint (`TradeSpendsSandboxController.cs:8` onward). As with live Trade Spend, access is **not permission-gated**; tenant isolation is enforced in handlers via the current user's brand ID. See the [Role & Permission Matrix](../02-role-permission-matrix.md).

## Dependencies

- **Live Trade Spend** — bidirectional push; shared `PromotionEventStatus` enum.
- **Product Specs** — price lists for per-unit pricing.
- **CRM** — Banners (door counts), Retailers, Distributors, Products, Categories in queries.
- **Shared data service** — hosts the cross-module copy logic in both push directions.

## Gaps, TODOs & Inconsistencies

1. **Hard delete of events** (`DeletePromotionalEventsRequest.cs:102-111`) — inconsistent with the soft-delete convention used everywhere else; permanent data loss, no audit.
2. **Unscoped delete** — events deletable by ID across promotions/brands (same file, `:104`).
3. **Cross-tenant event edit** — `UpdatePromotionalEventRequest` checks promo-ID match but not brand (`:111`); also ignores the `Deleted` flag.
4. **No RBAC** on the sandbox surface (same as live).
5. **Naming divergence** (`Promotion` vs `TradeSpendPromo`) makes the two modules harder to reason about as one system.
6. **Untraced handlers** (regular upsert, duplicate, delete-promotions, event-status) — documented from the controller only; internals need a follow-up pass.
