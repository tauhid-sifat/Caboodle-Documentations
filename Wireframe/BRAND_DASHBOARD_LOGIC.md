# Brand Dashboard — Logic & Calculations

> **Wireframe:** `Wireframe/brand-dashboard.html` (single-file static HTML, `max-width 1280px`, `gap 24px`, `card 16px/24px/shadow-sm`)  
> **Spec source:** user brief §1-6 + `AGENTS.md` + `index.md` + `BUSINESS.md` + `CONTEXT.md`  
> **Stack reference:** Dapper (reads) / EF Core (writes), `Brand-ID` header tenant isolation (`DEC-052`), `[MustHavePermission]` (`DEC-053`), `UserPreference` server storage (`DEC-047`/`DEC-012`)

---

## 1. Page Shell & Layout

| Token | Value |
|---|---|
| Page background | `#F5F6F8` / `gray-50` |
| Card background | `#FFFFFF` |
| Brand primary (teal) | `#14B8A6` → `#0D9488` active |
| Accent (SKU bars) | `#F5A623` / `amber-400` |
| Card radius | `16px` (`rounded-xl`) |
| Card shadow | `0 1px 3px rgba(0,0,0,0.07)` |
| Card padding | `24px` |
| Card gap | `24px` (was `22px` mixed — unified per fix) |
| Container | `max-width:1280px` centered, `padding:0 32px` desktop (`16px` mobile) |
| Top nav | `height:64px`, `white` + hairline `border #E5E7EB` + `shadow-sm` |

**Layout grid:**
- `Ask Cab` bar: full-width, sits directly on `page-bg` (outside cards)
- `kpi-row`: `grid 4fr` → `2fr` at `≤1024px` → `1fr` at `≤640px`, `gap:24px`
- `alert-banner`: full-width, `gap:24px` via parent `.page { gap:24px; flex-col }`
- Row 1 `grid-60-40`: `3fr 2fr` (= `60/40` exact, was `1.55fr/1fr ≈61/39`)
- Row 1.5 `pipeline-card`: full-width single card (inside page flex)
- Row 2 `grid-55-45`: `11fr 9fr` (= `55/45` exact, was `1.22fr/0.88fr ≈58/42`)
- Row 3 `Promotional Calendar`: full-width section, title **outside** card on `page-bg`, card holds tabs + legend + Gantt

All paired cards: `display:flex; flex-direction:column; height:100%; align-items:stretch` so heights equalize per row; bodies `flex:1` to fill.

---

## 2. Top Navigation

**Left → Right:**
- Logo: `cab` `#111827` + `oodle` `#14B8A6`, `1.55rem`, `font-weight:600`, lowercase
- Tabs: `Overview` (active `teal-50` + `teal-700` + `1px #99F6E4` pill), `Management`, `Promotional Planning`, `Reports`, `CRM` — each `16px` line icon + label, `gap:7px`, `7px 14px`, `rounded-full`
- Right: bell `20px` outline `stroke 1.8` + `8px` red dot `border 2px #fff`; avatar `32px` `teal` + initials `ZA` `0.72rem 700`; brand switcher `Zucchini Beanie Demo Brand` + `14px` chevron

**Wireframe behavior:** all tabs `href="#"` (or `href="/brand/42/overview"` in fixed variant) — placeholder routing. Real app: route groups `(brand)/[brandId]/(brand)` (`DEC-057`), `Brand-ID: 42` header sent on every request; header `sticky top:0 z:100`.

---

## 3. Ask Caboodle Bar

**UI:** `16px` card, `12px 16px`, search icon `18px teal`, input `0.88rem` transparent, hint `AI · 1000 row cap`

**Logic:**
- `onkeydown Enter` → modal/alert: *placeholder — LLM → `JSON QueryPlan` (never SQL) → deterministic compiler → `SELECT`-only parameterized SQL*
- Allow-list injection (fixed variant): `promotions`, `category_reviews`, `market_overview` = `ok`; `users`, `secrets` = `no` (strikethrough)
- Injects `AND brand_id = @TenantBrandId AND deleted = false` on every compiled query
- Caps: `1000` rows max (default `100`), `30s` timeout, read-only DB role, rate-limited
- Audit: immutable log per request (specced but absent — treat SRS as wish-list, `index.md DEC-062`)
- Domains answerable today: **2** (`promotions`, `reviews` / `market_overview` per `DEC-062`); other domains return *unsupported*

**Data shape:** no persistence; `input.value` is transient.

---

## 4. KPI Row — 4 Compact Horizontal Cards

### 4.1 Data contract

```json
[
  { "label":"Stores In Distribution", "value":"847", "sub":"Active + Commit · last 90 days", "trend":"+12 vs last month", "trendCls":"up", "icon":"teal", "fill":"var(--teal)", "pct":84, "link":"View distribution →", "hint":"REQ-024" },
  { "label":"Active Promotions", "value":"8", "sub":"Live in Trade Spend", "trend":"2 pending push", "trendCls":"warn", "icon":"blue", "fill":"#2563EB", "pct":62, "link":"Manage promos →", "hint":"DEC-055" },
  { "label":"Reviews Awaiting Response", "value":"3", "sub":"Brand Report · Notified/TBD", "trend":"Needs attention", "trendCls":"warn", "icon":"orange", "fill":"#EA580C", "pct":38, "link":"Open Brand Report →", "hint":"DEC-009" },
  { "label":"YTD Spend", "value":"$1.24M", "sub":"Net 23.8% · Budget $1.42M", "trend":"87% of budget", "trendCls":"neutral", "icon":"purple", "fill":"#7C3AED", "pct":87, "link":"View report →", "hint":"DEC-034" }
]
```

### 4.2 Formulas (wireframe disclosure panel)

| KPI | Formula (pseudo-SQL) | Source / Guard |
|---|---|---|
| **Stores In Distribution** | `COUNT(DISTINCT store_id) WHERE BannerSKU.Status IN ('Active','Commit') AND observation_date >= NOW() - 90d AND brand_id=@TenantBrandId AND deleted=false` | `REQ-024` — actual selected stores, **not** banner door count; fixes UNFI `700` aggregated trap (`DEC-006` grouped Independents require per-store chips `REQ-022`) |
| **Active Promotions** | `COUNT(*) WHERE PromotionEventStatus='Active' AND brand_id=@TenantBrandId AND Deleted=false AND SandboxPromotionID IS NOT NULL` | `REQ-040` — only **pushed-from-TSS** promos (live `TradeSpend` linked via `SandboxPromotionID`), multi-month pro-rated by day-count (`DEC-025`) |
| **Reviews Awaiting Response** | `COUNT(*) FROM BrandReport WHERE BrandResponse IN ('Notified','TBD') AND ReviewMonth >= DATE_TRUNC('month', NOW()) AND brand_id=@TenantBrandId` | `REQ-009`/`REQ-015` — `DEC-009` Brand Report ↔ Calendar sync; `Submission Due Date` → `Review Start Date` (`DEC-015`) 60-day advance notice |
| **YTD Spend** | `spendPct = SUM(actual_cost_net) / SUM(budget_net) * 100` → `87%`; progress `pct = YTD / annualBudget * 100` | `DEC-034` net-dollar basis (Denver Safeway `23.8%` verified); `DEC-035` lift = **velocity-based**, not units (SPINS has no lift); `BUSINESS.md` Trade Spend |

### 4.3 Rendering

- Trend pill: `up` `DCFCE7/#15803D`, `warn` `FFFBEB/#B45309` + `1px #FDE68A`, `neutral` `F3F4F6/#6B7280`
- Progress bar: `height:4px`, `background:#F3F4F6`, `fill width = pct%`, `background:fill` per KPI
- Hover: `border #BFDBFE`, `shadow 0 4px 12px rgba(0,0,0,0.08)`, `translateY(-1px)`
- Drill-through: `View … →` → `GET /api/brand/{brandId}/kpi/{key}?brand_id=42` with pre-applied filter (e.g., `status=Active`); pattern `REQ-027` (5-min refresh, skeleton loading)
- Definition disclosure: button `ⓘ KPI definitions & formulas` toggles `div.kpi-defs` table; footer note: *All KPIs filtered by `Brand-ID:42` + handler check (`DEC-052`), direct ID without brand → `403` (`DEC-049`)*

---

## 5. Data Health Alert (DataHub)

**UI:** `FFFBEB` + `1px #FDE68A` banner (or full `alert-card` table in fixed variant), `14px 16px`, dismiss `✕`

**Logic:**
- `12 unmapped records` from last `KeHE Brand Item Location` + `UNFI Inventory Details` sync (2h ago) — `DEC-048` **pull-only**, manual import preserved, credentials via `ThirdPartyCredential` (never logged)
- Excluded from all reports until mapped
- Expanded table columns: `Distributor | Raw value | Suggestion (score) | Alias state | Action`
- Suggestion engine: `normalize → exact/prefix/token_set` scoring, **cutoff `0.65`** (`DEC-058`); scores `<0.65` = *not auto-suggested* → `Create new`
- Alias rule: **always** enters as `Suggested` requiring approval; row resolves only when `retailer + customer + UPC` all `Mapped/ManuallyResolved`; auto-resolved rows **blocked** from auto-promotion during sync (`DEC-058`)
- Dismiss: `element.style.display='none'` (transient, not persisted)

---

## 6. Row 1 — Top SKUs (Left, 60%) + Top Promotions (Right, 40%)

### 6.1 Top SKUs — horizontal bar chart

**Data shape (spec exact):**
```json
[
  { "name": "Choc IC Sandwich", "value": 245 },
  { "name": "Strawberry Bomb Pop", "value": 248 },
  { "name": "Strawberry IC 16oz", "value": 250 }
]
```

**Calculation:**
```
max = 300          // fixed X-axis max
barWidthPct = value / max * 100
  Choc IC Sandwich  → 245/300 = 81.67%
  Strawberry Bomb Pop → 248/300 = 82.67%
  Strawberry IC 16oz → 250/300 = 83.33%
```

**Rendering:**
- Row: `grid 150px (label right-aligned) + 1fr (track) + [44px val in fixed variant]`, `gap:14px`, `gap:16px` between rows
- Track: `height:18px`, `background:#F3F4F6`, `rounded-full`; fill `background:#F5A623`, `rounded-full`, `transition width 0.6s ease`
- X-axis: `display:flex space-between`, `padding-left:164px` (150+14), `0,50,100,150,200,250,300`, `0.68rem #9CA3AF`, `border-top #F3F4F6`
- Title: `Top SKUs by volume` (spec cut off — assumed)
- Fixed-variant enhancement: right-aligned value label legible despite near-identical bars

### 6.2 Top Promotions — list with spend bars

**Data shape (spec exact):**
```json
[
  { "name": "Summer Scoop Bundle", "spend": 32000 },
  { "name": "Kroger Feature Event", "spend": 74000 },
  { "name": "UNFI Spring TPR", "spend": 61000 },
  { "name": "KeHE Summer Deal", "spend": 45000 },
  { "name": "Whole Foods Seasonal", "spend": 34000 }
]
```

**Calculation:**
```
maxSpend = max(spend) = 74000  // Kroger
barWidthPct = spend / maxSpend * 100
  Summer Scoop Bundle → 32000/74000 = 43.24%
  Kroger Feature Event → 74000/74000 = 100.00%
  UNFI Spring TPR → 61000/74000 = 82.43%
  KeHE Summer Deal → 45000/74000 = 60.81%
  Whole Foods Seasonal → 34000/74000 = 45.95%
formatted = spend >=1000 ? `$${Math.round(spend/1000)}K` : `$${spend}`
  → $32K, $74K, $61K, $45K, $34K
```

**Rendering:**
- Row: `grid 1fr (name) + 120px (track) + 54px (value)`, `gap:14px`, `gap:14px` between rows
- Track: `height:8px`, `background:#E5E7EB`; fill `linear-gradient 90deg #14B8A6→#2DD4BF`
- Header: `Top promotions` + `View all →` (`teal-600`), `href="/brand/42/reports/trade-spend?sort=spend_desc&brand_id=42"` (fixed variant: Dapper read note)
- Scale (fixed variant): `promo-scale` `$0 — $37K (½ max) — $74K max` on `border-top`

---

## 7. Trade Spend Sandbox Funnel (Full-Width Pipeline Card)

**Purpose:** Visualize `BUSINESS.md` Flow 1 `TSS (4-step wizard) → Push to Approved → Promotional Calendar → Broker Promo Management` and the `DEC-045` versioning / `DEC-055` destructive contract.

**Data (wireframe demo):**
```json
[
  { "cls":"draft",   "num":4, "lbl":"Draft in Sandbox", "sub":"In TSS stepper — not yet pushed. Edit fees/velocity/stores." },
  { "cls":"pending", "num":2, "lbl":"Pending Push",     "sub":"Ready for Approved. Pricing validated. Will archive version on push." },
  { "cls":"blocked", "num":1, "lbl":"Blocked",          "sub":"Missing pricing for 2 SKUs at Whole Foods — push will fail until fixed." }
]
```

**Logic:**
- **Draft:** in `TradeSpendSandbox` stepper (`Step 1 Retailers/Banners → Step 2 SKUs/Velocity/Stores → Step 3 Events Normal/EDLP Jan-Dec → Step 4 Fees equally per product within banner`)
- **Pending Push:** pricing validated (`System validates pricing exists` before status change), fees `distributed equally per product within banner`
- **Blocked:** missing `ProductSpecification` pricing → push rejected; error banner maps to `REQ-041` `IsSubmitted` alias bug (`DistributorsIDs` unjoined)
- **Push action:** `POST /api/trade-spend/push` with `Brand-ID:42` + `rowversion` (optimistic concurrency, `DEC-043` `TransitionRule[]`); handler `UpdateEventStatusAsync` transitions only in Sandbox; `IsSubmitted` managed on **live** side with `BROKER`/`BROKERSUBUSER` brand scoping (`DEC-055`)
- **Contract:** **destructive REPLACE** — *re-deletes and re-inserts* all live `events`/`fees` linked via `SandboxPromotionID`/`SandboxEventID`; every push archives an accessible version; `un-approve/retract` moves back to Sandbox and removes from broker view (`DEC-045`)
- **Permissions:** `Active→Discontinued` **Brand Owner only**; broker row locks `brand-locked` (`DEC-043`); guard `if (role !== BrandOwner) throw 403`
- **UI:** `grid 3fr`, `gap:16px`, steps `teal-50`/`amber-50`/`red-50`, `24px` white circular arrow `right:-12px` (hidden at `≤1024px`); version table `v1:2026-03-10, v2:2026-03-28, v3:2026-04-12 14:03 rowversion 0x0004A2` (fixed variant: modal with checkbox `I understand this replaces live data`)

---

## 8. Row 2 — Monthly Spend Trend (Left, ~55%) + CRM Plan Tasks (Right, ~45%)

### 8.1 Monthly Spend Trend — line chart (Actual vs Budget)

**Data shape (spec exact, budget added in improved wireframe):**
```json
[
  { "month": "Nov", "spend": 180000, "budget": 190000 },
  { "month": "Dec", "spend": 215000, "budget": 210000 },
  { "month": "Jan", "spend": 200000, "budget": 205000 },
  { "month": "Feb", "spend": 222000, "budget": 215000 },
  { "month": "Mar", "spend": 218000, "budget": 225000 },
  { "month": "Apr", "spend": 238000, "budget": 230000 }
]
```

**Scale & mapping:**
```
W=560, H=170, pad={l:52,r:16,t:12,b:26}  // (48 in original, 52 in fixed for a11y)
plotW = W - l - r = 492
plotH = H - t - b = 132
minY = 180000, maxY = 240000, step = 10000
x(i) = l + (i/(n-1)) * plotW          // n=6 → i=0..5
y(v) = t + (1 - (v - minY)/(maxY-minY)) * plotH
  Nov spend 180000 → y = 144 (bottom)
  Apr spend 238000 → y ≈ 15.4 (near top)
grid + y labels: for v = 180000..240000 step 10000 → 7 lines, label `$${v/1000}K`
x labels: months Nov,Dec,Jan,Feb,Mar,Apr at x(i), y=H-6
```

**Lines:**
- **Budget** (dashed): `stroke:#9CA3AF → #4B5563` (fixed for a11y), `stroke-width 2 → 2.2`, `stroke-dasharray 6 6`, `stroke-linecap round`
- **Actual** (solid): `stroke:#14B8A6 → #0F766E` (fixed), `stroke-width 2.5`, `stroke-linecap/join round`
- **Smoothing:** cubic Bézier via mid-points
  ```
  pts = [{x:x(i), y:y(spend)}]
  d = M pts[0].x pts[0].y
      for i=0..n-2:
        mx = (pts[i].x + pts[i+1].x)/2
        d += C mx pts[i].y, mx pts[i+1].y, pts[i+1].x pts[i+1].y
  // identical for budget pts using y(budget)
  ```
- **Dots:** `r=4.5` teal fill white stroke `2` (actual), `r=3.5→3.8` white fill gray stroke `2` (budget)

**Legend:** `Actual` solid `10×3px teal` + `Budget` dashed `16→18×2→3px gray` — `gap:16px`, `0.72rem`

**Foot badges:** `Net basis 23.8% (DEC-034)` `EFF6FF/#1D4ED8` + `Lift = velocity-based (DEC-035)` `F0FDF4/#166534`, plus `Y-axis $180K–$240K ($10K steps) · X Nov–Apr` helper

**Header:** `Monthly spend trend` + `Actual vs Budget (net)` subtitle + `Monthly report →` deep-link to `/brand/42/reports/monthly` (Monthly Report — Budget vs Actual after distributor import, `BUSINESS.md` Flow 1 step 7)

### 8.2 CRM Plan Tasks — interactive list

**Data shape (spec exact, fixed variant adds `id`, `createdBy`, `due`):**
```json
[
  { "id":1, "status": "IN_PROGRESS", "task": "Q2 KeHE promo plan review", "retailer": "KeHE", "createdBy":"You" },
  { "id":2, "status": "TO_DO",       "task": "Update Kroger banner SKU mapping", "retailer": "Kroger", "createdBy":"Kate" },
  { "id":3, "status": "COMPLETED",   "task": "UNFI pricing list submission", "retailer": "UNFI", "createdBy":"You" },
  { "id":4, "status": "IN_PROGRESS", "task": "New SKU setup — Sorbet line", "retailer": "Informed", "createdBy":"You" },
  { "id":5, "status": "TO_DO",       "task": "Retailer onboarding — Sprouts", "retailer": "Sprouts", "createdBy":"John" }
]
```

**Pill mapping (uppercased, `0.62rem 800`):**
- `IN_PROGRESS` → `In Progress` `E0F2FE/#0E7490` + `1px #BAE6FD` (fixed: `EFF6FF/#1E40AF`)
- `TO_DO` → `To-Do` `F3F4F6/#6B7280` + `1px #E5E7EB` (fixed: `F3F4F6/#374151`)
- `COMPLETED` → `Completed` `DCFCE7/#15803D` + `1px #BBF7D0` (fixed: `DCFCE7/#166534`)

In fixed variant pill adds `border` explicitly for a11y.

**Row:** `flex gap:10px` on `F9FAFB` `1px #F3F4F6` `rounded 10px` `10px 12px`; hover `border #E5E7EB`; `done` → `opacity:0.6` + `line-through #9CA3AF`

**Toolbar (fixed variant adds):**
- Filter pills: `All` / `In Progress` / `To-Do` / `Completed` — `active` `teal-50/#0D9488→#0F766E` + `#99F6E4`
- `Created by` select: `All / You / Kate / John` — proxy for responsible person (no assignment property exists, `DEC-032` `Created by` validated against Bubbies Mark & Dean)
- Logic: `filtered = status===filter ? … : all` + `createdBy===selected ? … : all` (AND-combined)
- Visibility: `visible = showDone ? filtered : filtered.filter(s!==COMPLETED)`; `hiddenDone = doneCount - visibleDone`
- Link: `Show completed (n) ↓` / `Hide completed ↑` toggles `showDone` boolean (Fellow-style `DEC-004` — completed hidden behind toggle, not permanent Done column)

**Quick-add:**
```
input#taskQuickAdd placeholder "Quick add task — press Enter"
on Enter or button click:
  crmTasks.unshift({ id: nextId++, status:'TO_DO', task: value.trim(), retailer:'—', createdBy:'You' })
  filter reset to 'all', clear input, re-render
```

**Check toggle:**
```
toggleTask(id):
  t.status = t.status==='COMPLETED' ? 'TO_DO' : 'COMPLETED'
  // fixed variant: uses 'TO_DO' not 'todo' to match enum case
```

**Row click:** `onclick="toggleTask(id)"` also on check button (stopPropagation on button)

**Persistence:** `UserPreference` entity `key/userId/module/value` server-side, per user per brand (`DEC-047`/`DEC-012`); `localStorage` explicitly rejected for cross-device.

**Header:** `CRM plan tasks` + `+ Add task` focuses quick-add; `Brand-ID 42` subtitle (fixed variant); `View all →` placeholder.

---

## 9. Row 3 — Promotional Calendar (Full Width, **Not Inside Card**)

**Section structure:** `<h2>Promotional Calendar</h2>` sits on `page-bg` (`1.25rem 800 #111827`), then white `cal-card` (`16px` + `shadow-sm`) holds tabs + legend + Gantt.

**Tabs inside card:**
- `📅 Promotional Calendar` active `teal-600→teal-700` text + `2px teal` underline, `14px 2px`, `gap:8px`, `margin-bottom:-1px`
- `📝 Notes` inactive `gray` (`#6B7280→#4B5563` fixed)
- Click: `switchCalTab('promo'|'notes')` toggles `active` class + `aria-selected` + `display` of `calPanePromo`/`calPaneNotes`

**Legend row (`12px 24px`, `FCFCFD`, `border-bottom #F3F4F6`):**
```
● Active              #3B82F6 → #2563EB (fixed)
● Cancelled           #EF4444 → #DC2626
● Pending             #F59E0B → #D97706
● Did not run         #9CA3AF → #6B7280
● Declined            #991B1B
● Retailer approved   #22C55E → #16A34A
● Completed           #111827
● EDLP (fixed)        #7C3AED
Budget dashed         12px repeating #9CA3AF 0 4px / transparent 4px 7px → 18px #4B5563 (fixed)
→ continues           chip.cont 2px 8px 0.65rem
```

**Gantt table:**
- Columns: `Banner Name` (`min-width 170px`, `sticky left:0 z:2`, `padding-left 24px`, `left-aligned`, `0.84rem 600`) + `12` months `JAN–DEC` (`center`, `0.68rem 600 uppercase #9CA3AF→#4B5563`, `letter-spacing 0.06em`)
- Body: `height:48px`, `border-bottom #F3F4F6`, `sticky first col` + `border-right #F3F4F6`; `tr:hover td → #F9FAFB`
- `min-width:900px→980px` + `overflow-x:auto`

**Data shape (spec exact, fixed variant uses date ranges for pro-ration):**
```json
{
  "months": ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"],
  "rows": [
    {
      "banner": "Fresh Direct",
      "promotions": [
        { "month": "MAR", "status": "pending", "dateRange": "3/19-4/2" },
        { "month": "APR", "status": "active", "dateRange": "6/15-6/29" },
        { "month": "MAY", "status": "active", "dateRange": "5/14-5/28" },
        { "month": "JUL", "status": "declined", "dateRange": "7/9-7/23" },
        { "month": "NOV", "status": "completed", "dateRange": "11/12-11/26" },
        { "span": ["FEB","MAR","APR"], "status":"active", "dateRange":"2/12-4/15", "label":"KeHE Spring Feature →" }
      ]
    }
  ]
}
```

**Chip rendering:**
- Base: `inline-flex gap:6px`, `5px 10px`, `rounded-full`, `0.72rem 600`, `max-width 150→158→168px`, `ellipsis`, `1px solid transparent`
- Dot: `7px` circle `flex-shrink:0`
- Color map (same as legend, with light tint `bg` + `1px` border):
  - `pending` `FFFBEB/#92400E/#FDE68A` + `F59E0B → D97706`
  - `active` `EFF6FF/#1D4ED8/#BFDBFE` + `3B82F6 → 2563EB`
  - `declined` `FEF2F2/#991B1B/#FECACA` + `991B1B`
  - `completed` `F3F4F6/#111827/#E5E7EB` + `111827`
  - `retailer_approved` `F0FDF4/#166534/#BBF7D0` + `22C55E → 16A34A`
  - `cancelled` `FEF2F2/#DC2626/#FECACA` + `EF4444 → DC2626`
  - `did_not_run` `F9FAFB/#6B7280→#374151/#E5E7EB` + `9CA3AF → 6B7280`
  - `edlp` (fixed) `F5F3FF/#5B21B6/#DDD6FE` + `7C3AED`
- Label: `MMM dateRange` e.g. `MAR 3/19-4/2` (`m.slice(0,3).toUpperCase() + ' ' + dateRange`); truncated with ellipsis
- Multi-month (fixed): `span: ["FEB","MAR","APR"]` → chip in **every** spanned month, first month plain, subsequent months `cont` class → `::after '→'` + tooltip with day counts

**Fixed-variant date logic (DEC-025 pro-ration, DEC-044 Option A):**
```js
total = daysBetween(start,end) // inclusive
dayCountInMonth(p, mIdx):
  mStart = new Date(2026,mIdx,1), mEnd = new Date(2026,mIdx+1,0)
  oStart = max(start,mStart), oEnd = min(end,mEnd)
  return oEnd<oStart ? 0 : round((oEnd-oStart)/86400000)+1
// Example: 90-day Jan-Mar promo → Jan 30d, Feb 28d, Mar 31d (Jan filter counts 30)
EDLP check: start==="2026-01-01" && end==="2026-12-31" → status='edlp' across all 12 cols, label "EDLP Pantry", tip "EDLP Jan-Dec · 365 days"
tooltip: "3/19-4/2 · 15 days — MAR:13d APR:2d" or "KeHE Spring Feature · 2/12-4/15 · 63 days — FEB:17d MAR:31d APR:15d"
```

**Notes tab:** `notes-empty` `48px 24px` `center #9CA3AF 0.85rem` — *No notes yet. … Removing from Brand Report also removes from Calendar — master CR list row survives* (`DEC-014`), *Internal vs external notes count as KPI, direct-edit overwrite no versioning* (`DEC-022`)

---

## 10. Global Logic & Cross-Cutting Concerns

**Tenancy:** Strict per-Brand isolation — `Brand-ID:42` header + `BrandValidationMiddleware` + **handler-level** brand filter (`DEC-052`); any handler omitting filter = cross-tenant leak (`RISK-001`). All new endpoints must carry brand check; controller-level trust is insufficient.

**AuthZ:** `RequireAuthorization()` globally + opt-in `[MustHavePermission]` on `22/38` controllers (`DEC-053`); 53 `RoleClaims` resolved per-request, JWT carries none; no coded `ADMIN` bypass.

**Persistence:** `EF Core` writes (transactional) + `Dapper` reads (heavy) (`DEC-051`); soft-delete `Deleted=true` except hard-delete paths (`sandbox events`, join rows, `TRUNCATE` promo rules); financial math on **read**, price `0` when missing.

**Async:** chunked S3 multipart + `Hangfire` poll `JobId` in `5000`-row batches; exports → background `CSV→S3` → presigned URL; only `sandbox→approved` push is synchronous; re-sync deletes prior same-brand/month/provider data (`DEC-056`).

**Filters:** `UserPreference` server-side `key/userId/module/value` reusable (`DEC-047`), starter modules `Retailers, Promo Planning (Sandbox+Approved), Pipeline` (`DEC-012`); `localStorage` rejected.

**Status machines:**
- `PromotionEventStatus` enum: `1 Active, 2 Cancelled, 3 Pending, 4 DidNotRun, 5 Declined, 6 RetailerApproved, 7 Completed` — **never written** by live module, only Sandbox `UpdateEventStatusAsync` (`AGENTS.md:10`)
- `IsSubmitted` boolean parallel flag on live events (`UpdateSubmissionStatusOfEventsRequest`, broker scope `BROKER`/`BROKERSUBUSER` to assigned brands)
- `SkuStatus` (Market Overview): `Pending→Approved→Commit→Active→Discontinued` (`Discontinued` terminal, broker cannot override — `DEC-005`); `NotActive/Pending` flexible; dead-ends `Pending→Declined`, `Pending→NotActive`

**Routes (fixed variant):** `(brand)/[brandId]/(brand)` — `/brand/42/overview`, `/brand/42/management` (Product Specs/Categories/Prices `Done` `DEC-067`), `/brand/42/trade-spend/sandbox`, `/brand/42/reports`, `/brand/42/crm` (`DEC-057`)

**Design system:** remove `Ant Design` **or** `PrimeReact` to fix bundle bloat (`DEC-061`); use `Inter`/`Space Grotesk`, `AG Grid` lazily.

---

## 11. Empty / Loading / Error States

| State | UI | Note |
|---|---|---|
| KPI loading | shimmer `skeleton` `linear-gradient 90deg #F3F4F6→#E5E7EB` `1.4s infinite` `8px` radius | `REQ-027` `GET /api/brand/42/kpi/*` 5-min refresh (brands 1hr) |
| No promotions | `1px dashed #E5E7EB` `12px` centered `No promotions yet — create one in Sandbox (DEC-045)` | Fixed variant |
| No tasks in filter | `No tasks in this filter. Clear filters` link | `showDone` toggle |
| Push blocked | `FEF2F2/#FECACA` `error-banner` with icon `Failed pricing` + `DistributorsIDs` unjoined alias fix/drop (`REQ-041`) | Destructive modal requires checkbox |
| Notes empty | `No notes yet…` + `DEC-014` sync note | — |
| Ask error | modal `JSON QueryPlan` example | `DEC-062` placeholder |

---

## 12. Calculations Summary (Cheat Sheet)

```
Top SKUs:           w = value / 300 *100%
Top Promos:         w = spend / max(spend) *100%, $fmt = round(spend/1000)+"K", max = 74000
KPI progress:       width = pct% (pct = 84/62/38/87 demo)
Trend Y:            y(v) = t + (1-(v-180000)/60000)*plotH, step 10000, 7 grid lines
Trend X:            x(i) = l + i/(5)*plotW, months Nov-Apr
Trend curve:        cubic Bézier via mid-x: M p0 → C mx p0.y, mx p1.y, p1
                    (same for budget dashed)
Gantt day-count:    dc(m) = overlap(p.start..p.end, monthStart..monthEnd) inclusive days
                    total = daysBetween(start,end) inclusive
EDLP:               Jan 1–Dec 31 → 365 days, status='edlp', shown in all 12 cols
CRM filter:         AND(statusFilter, createdByFilter), visible = showDone? filtered : filtered∖COMPLETED
Version:            rowversion optimistic check → 409 Conflict on stale push
```

---

*Generated from `Wireframe/brand-dashboard.html` + `AGENTS.md §1-17` + `BUSINESS.md` + `index.md`. Keep `RISK-004` secrets out of config, `DEC-060` .NET 6→9 deferred, single-instance no HA (`RISK-005`).*
