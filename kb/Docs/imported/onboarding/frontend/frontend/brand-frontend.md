---
type: Document
title: "Brand-Facing Frontend"
---

# Brand-Facing Frontend

This document describes the **brand-facing** area of the Caboodle web app for a Business Analyst. It covers everything under the `(brand)` route group — the screens a Brand user (or a Broker who has "entered" a specific brand) works in day-to-day: dashboards, CRM, product specs, data uploads, promo/trade-spend, reports, and the AI assistant.

All file references are frontend-relative (paths under `src/`) with `path:line`. Where the code does not make something clear, it is called out explicitly.

---

## Roles Served

Two brand roles exist as an enum: `BRANDOWNER` and `BRANDSUBUSER` (`src/enums/index.ts:204-205`). The full set also includes `BROKER` and `BROKERSUBUSER`.

The `(brand)` screens are **not exclusively for brand roles.** They are the "inside a brand" surfaces. Who reaches them:

- **BRANDOWNER / BRANDSUBUSER** — this is their entire app. On login they are auto-dropped into their brand (`src/components/WorkspaceContainer.tsx:47-57`, `src/components/header/HeaderComponent.tsx:161-162`).
- **BROKER / BROKERSUBUSER** — brokers manage many brands; when a broker picks a brand from the workspace switcher they navigate into these same `[brandID]` screens.

The only role-driven difference inside the brand area is:
- The **Users** menu/tile is hidden for broker roles (`src/components/sideBar/SideBarMenus.tsx:158,208`; `src/app/(brand)/[brandID]/dashboard/page.tsx:97`).
- The special brand slug `"all-brands"` swaps the sidebar to a broker-style menu (Market Overview, Promotional Management, Category Review, Distributor APL) instead of the normal brand menu (`SideBarMenus.tsx:59,217`).

---

## How Brand Scoping & Role Are Determined (cited)

**Authentication gate (server-side).** Every `(brand)` page is wrapped by `src/app/(brand)/layout.tsx:15`, which calls `serverSessionCheck()`. That helper (`src/helper/helper.ts:20-29`) runs `getServerSession` and redirects to `/` (login) if there is no session. This is the **only** server-side guard — it checks *authenticated*, not *which role* or *which brand*.

**The session does NOT carry the user's role.** The NextAuth session callback only populates `tenantId`, `imageUrl`, first/last name, and tokens (`src/app/api/auth/[...nextauth]/options.ts:112-122`). There is no `role` on the session.

**Role + brand list come from a backend API call, held in client state.** `HeaderComponent` calls the `getAllBrands` endpoint (`useGetAllBrandsForBroker`, `src/hooks/brand.ts:7-34`). On success (`HeaderComponent.tsx:49-52`) it writes to two Zustand stores:
- `setRoleGlobal(data.role)` → `useRoleStore` (`src/store/roleStore.ts`), persisted under localStorage key `cb-cmp-store-userRole`.
- `setCanAccessTradespend(data.canAccessTradespend)` and `setTotalBrand(data.brands)` → `useGlobalStore` (`src/store/globalStore.ts`), persisted under `cb-cmp-store`.

**Brand scoping = URL param + persisted store.** The active brand is the `[brandID]` URL segment combined with the `brand` object in `useGlobalStore`. Components read `brandID` from `useParams()` and/or `useGlobalStore(state => state.brand)` and pass `brand.id` into every service/hook call (e.g. `AddProduct.tsx:34,63,70`). Nothing on the frontend verifies that the logged-in user is actually allowed to see the `brandID` in the URL — that trust is placed in the backend.

**Role defaults to BRANDOWNER.** The role store initializes to `BRANDOWNER` (`roleStore.ts:11`) before the API responds, and it is persisted, so a stale/optimistic role can briefly drive UI before the real value loads.

---

## Screen Inventory (grouped by nested route group)

Base path for all rows: `src/app/(brand)/[brandID]/...` unless noted.

### Dashboard & AI
| Route | Purpose |
|---|---|
| `dashboard` | Brand landing page: brand logo plus two summary cards — "Banner Count for Item Status" and Trade Spend Roll Up. |
| `dashboard-ai` | AI-assisted dashboard view. |
| `ask-caboodle` | Chat with the AI assistant to explore data and generate visualizations (`ask-caboodle/page.tsx`). |
| `/profile` (no brandID) | Logged-in user's own profile: edit name/phone, change password, upload/remove avatar. |

### (crm) — Customer Relationship Management
| Route | Purpose |
|---|---|
| `(crm)/distributors/(distributor-list)` | List of distributors for the brand. |
| `(crm)/distributors/[distributorID]/...` | Distributor detail and its banners. |
| `(crm)/retailers/(retailer-list)` (+ `/all`) | List of retailers (and "all" variant). |
| `(crm)/retailers/[retailerID]/banners` | Banners belonging to a retailer. |
| `(crm)/banners/[bannerID]` | Banner detail. |
| `(crm)/regions` | Sales regions maintenance. |
| `(crm)/contacts` | Contact directory. |
| `(crm)/pipeline` (+ `[taskID]`) | Sales pipeline / plans board, drill into a task/plan. |

### (product-specs) — Product Catalog
| Route | Purpose |
|---|---|
| `(product-specs)/products/(product-list)` | Product (SKU) list. |
| `(product-specs)/products/add` & `[productID]/edit` & `[productID]` | Create, edit, and view a product spec. |
| `(product-specs)/categories/(category-list)` & `[categoryID]` | Product category list and detail. |
| `(product-specs)/pricing` | Price lists. |

### (data upload) — Syndicated / Distributor Data
| Route | Purpose |
|---|---|
| `(data upload)/spins` (+ `item-ranking-report`, `stores-insight-report`) | SPINS syndicated data upload and its reports. |
| `(data upload)/kehe` | KeHE distributor data upload. |
| `(data upload)/unfi` | UNFI distributor data upload. |
| `(data upload)/distributor-sales-report` | Distributor sales report. |
| `(data upload)/category-review.tsx` | Category review data (note: folder literally named `category-review.tsx`). |
| cross-tab-explorer | Listed in scope but no `page.tsx` found under `(brand)` — Unclear from code whether a brand route exists (component lives in `src/components/cross-tab-explorer`). |

### (promo) — Promotions & Trade Spend
| Route | Purpose |
|---|---|
| `(promo)/(trade-spend)/promo-planning/(list)`, `/create`, `[promoID]` | Trade-spend / promo plans: list, create, detail. |
| `(promo)/(trade-spend)/trade-spend-sandbox/(list)`, `/create`, `[promoID]` | "What-if" trade-spend sandbox. |
| `(promo)/(promotional-calendar)/promotional-calendar` | Promotional calendar view. |
| `(promo)/(promotional-calendar)/promotional-notes` | Promo notes. |

### (report) — Reporting
| Route | Purpose |
|---|---|
| `(report)/report` | Reports hub/landing. |
| `(report)/brand-market-overview-report` | "Broker Market Activities" overview. |
| `(report)/(category-review)/category-review-brand` & `category-review-calendar-brand` | Category review report + calendar variant. |
| `(report)/retail-report` | Retail reports. |
| `(report)/monthly-report` | Monthly report. |
| `(report)/banner-report` | "Trade Spend Roll Up" by banner. |
| `(report)/product-report` | "Promoted Case Sales Analysis". |
| `(report)/apl-report` & `apl-activity` | Authorized Product List report and activity. |
| `(report)/sales-tracker` | Sales tracker. |

### Other
| Route | Purpose |
|---|---|
| `(file-upload)/file-upload` | Files area (brand file repository / uploads). |

---

## Client-Side Validation & Computed Fields (cited)

**Product form** (`src/components/productSpecs/AddProduct.tsx`)
- Required (Ant Design `rules`) **only when** `isEditable` is true: Product Name (`:100-105`), Case UPC (`:118-123`), Unit UPC (`:131-136`), Case Pack (`:241-246`). All other fields (codes, dimensions, weights, pallet) are optional — many `required` rules are commented out.
- Read-only mode: when `isEditable=false` every input is `readOnly` and the Submit button is hidden (`:435`), turning the same form into a view-only screen.
- Optional numeric fields use a custom `InputNumber` (yields `number | null`); required string-ish fields use `Input`.
- **Behavioral note:** both create and edit call the same `addProduct` mutation, only differing by whether an `id` is included (`:56-72`) — there is a separate `updateProduct` hook wired up (`:53`) but `onFinish` never calls it. Flag for the team.

**Profile / password** (`src/app/(brand)/profile/page.tsx`)
- Change-password requires current, new, and confirm; a custom validator enforces new == confirm (`:365-374`).
- Email field is `readOnly` in edit mode (`:279`).
- Avatar upload restricted to `.png/.jpg/.jpeg` (`:143`).

**Trade-spend promo metrics** (`src/components/tradeSpend/TradeSpendCreateContents/PromoMetrics.tsx`)
- Percentage inputs are range-bounded in the UI: Promoted Case Allowance OI and MCB clamp to `min=1, max=100` (`:304,314,658,668`); Scan % clamps to `min=0, max=100` (`:344,698`).
- "Apply to All" bulk-edit lets a user push one set of metrics across selected banners/events/SKUs (`:433-532`); the Apply button is disabled until at least one filter is chosen (`:718`).
- Per-SKU price is **computed**, not entered: the effective price row (`perUnitPriceData`) is chosen by finding the most recent price whose `validFrom` is before the event start date (`:219-266`, `:471-508`). If none qualifies, it falls back to the earliest price and shifts the event `startDate` to that price's `validFrom`.
- EDLP (`isEDLP`) mode hides the OI/MCB/scan/TPR/fee inputs and shows only Everyday Allowance, Scan %, and Comment (`:298,536,652`).

**Sidebar / dashboard conditional UI**
- Trade-spend related menu items and the Promo Planning tile only render when `canAccessTradespend` is true (`SideBarMenus.tsx:84`; `dashboard/page.tsx:61`).
- Trade Spend Sandbox appears only for brands in the `BRAND_TO_IGNORE` allow-list or on staging (`SideBarMenus.tsx:90`; `dashboard/page.tsx:67`).
- Certain reports (Trade Spend Roll Up, Promoted Case Sales, SPINS/KeHE/UNFI, Distributor Sales) are gated by `BRAND_TO_IGNORE_ON_REPORT` / `IS_STAGING` flags (`SideBarMenus.tsx:127-139,190-205`).
- Users menu/tile hidden for broker roles (see Roles Served).

---

## Frontend-Only Enforcement

These are enforced/hidden **only in the browser**. There is no corresponding server-side page guard in this repo (the sole server guard is "is authenticated" in `layout.tsx`):

1. **Trade-spend access (`canAccessTradespend`).** The flag comes from the backend but the UI merely *hides* the menu item and dashboard tile (`SideBarMenus.tsx:84`, `dashboard/page.tsx:61`). The promo-planning route pages themselves contain **no** check for `canAccessTradespend` (confirmed: no matches for `canAccessTradespend`/`userRole`/`redirect` in `promo-planning/**/page.tsx`). A user who knows the URL can navigate straight to `/[brandID]/trade-spend...`; only the backend API can actually stop them.
2. **Users management.** Hidden for broker roles in the nav only — no route guard on a `/users` page.
3. **Brand/report allow-lists** (`BRAND_TO_IGNORE`, `BRAND_TO_IGNORE_ON_REPORT`, `IS_STAGING`) are hard-coded frontend constants deciding which brands see sandbox/certain reports. This is presentation logic, not security.
4. **Read-only vs editable product form** is driven by a React prop `isEditable`, not by the user's role or backend permission (`AddProduct.tsx:25,435`).

---

## Risks (FE/BE mismatches)

- **No page-level authorization anywhere in `(brand)`.** Every screen trusts (a) the `[brandID]` in the URL and (b) the role held in a **persisted, client-writable** Zustand store. There is no verification that the current user owns/serves the `brandID` they navigate to. If a backend endpoint is missing its own tenant/role check, direct-URL access (or editing localStorage) would expose another brand's data or a hidden feature. **This should be independently verified against the backend.**
- **Role lives in localStorage (`cb-cmp-store-userRole`) and defaults to `BRANDOWNER`.** Because it is persisted and optimistically defaulted (`roleStore.ts:11`), UI can render brand-owner affordances before the real role loads, and the value is user-editable in the browser. Never treat it as a trust boundary.
- **Trade-spend "enforced only in the UI."** As above, the entire promo-planning surface is gated purely by a hidden menu item; confirm the trade-spend backend endpoints enforce `canAccessTradespend` server-side.
- **Session has no role**, so any server component that wanted to make an authorization decision cannot do so from the session alone — it would need its own backend call. Today none of the brand pages attempt this.

---

## Gaps, TODOs & Inconsistencies

- **Product edit never uses its update hook.** `useUpdateProduct` is instantiated but `onFinish` always calls `addProduct` (`AddProduct.tsx:53-72`). Likely works because the create endpoint upserts on `id`, but it is a smell worth confirming.
- **Route naming inconsistencies (pre-existing).** A folder is literally named `category-review.tsx` (`(brand)/[brandID]/(data upload)/category-review.tsx/page.tsx`). Distributor detail route uses `[distributorID]/(distributorID)` nesting. These match the "known inconsistencies" noted in CLAUDE.md.
- **cross-tab-explorer** is named in the scope but no brand `page.tsx` was found for it; only the component folder exists. Unclear from code whether it is a live brand route.
- **Debug logging in production paths.** `console.log(params.brandID)` in `AppContainer.tsx:21` and role/pathname logs in `SideBarMenus.tsx:36,39` ship to the browser console.
- **Duplicated menu construction.** `SideBarMenus.tsx` and `dashboard/page.tsx` independently re-derive the same brand-vs-"all-brands" and role/tradespend visibility logic; they can drift out of sync.
- **Two overlapping stores for one identity concept.** Role sits in `roleStore` while `canAccessTradespend`/`brand` sit in `globalStore`; both are populated from the same single API response in `HeaderComponent`. If that header call hasn't run (e.g. deep-link before header mounts), downstream gating reads stale/default values.
