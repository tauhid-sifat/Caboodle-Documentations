---
module: broker-dashboard
jira: [CS-1305]
status: ready-for-dev
last_verified: 2026-10-14
related_wiki: ../../wiki/broker-dashboard.md
---

# Broker Dashboard — Full Specification

**CS-1305** | User Story | Priority: High | Status: Ready for Dev

---

## 1. Page Route & Access

- **Route:** `/dashboard` (inside `(broker)` route group)
- **Roles:** `BROKER`, `BROKERSUBUSER`
- **Auth:** Requires valid JWT + broker brand assignments (`BrandBroker` links)

---

## 2. Layout Structure (Exact)

```
DashboardPage (server component)
├── DashboardHeader (client)
│   ├── BrokerLogo (from /api/broker/branding)
│   ├── BrandSwitcher (if >1 brand assigned)
│   ├── NotificationBell (unread count from /api/notifications/count)
│   └── UserMenu
├── KPIRow (client) — 4 cards, Suspense boundaries
├── MainGrid (client) — 2 columns: Timeline (60%) | TaskBoard (40%)
│   ├── Timeline (client) — virtualized list, 14-day window
│   └── TaskBoard (client) — 3-column Kanban, drag-drop
└── QuickActions (client) — 4 tiles, static
```

---

## 3. KPI Cards — Exact Definitions

| # | Card | Label | Value Source | API Endpoint | Refresh |
|---|------|-------|--------------|--------------|---------|
| 1 | Stores In | `storesIn` | `GET /api/broker/kpi/stores-in` | `MarketOverviewRepository.countDistinctStores(brokerId, statuses=[Active,Commit], days=90)` | 5 min |
| 2 | Reviews Due | `reviewsDue` | `GET /api/broker/kpi/reviews-due` | `CategoryReviewRepository.countDue(brokerId, days=7)` | 5 min |
| 3 | Active Promos | `activePromos` | `GET /api/broker/kpi/active-promos` | `TradeSpendPromoEventRepository.countActive(brokerBrandIds, today)` | 5 min |
| 4 | Brands Represented | `brandsRepresented` | `GET /api/broker/kpi/brands` | `BrandBrokerRepository.countByBroker(brokerId)` | 1 hr |

**Each card component:**
```tsx
interface KPICardProps {
  label: string;
  value: number | string;
  trend?: { value: number; label: string }; // e.g., { value: 12, label: "vs last month" }
  href: string; // deep link to filtered list
  icon: ReactNode;
  loading?: boolean;
}
```

**Click behavior:** Navigate to list page with pre-applied filter (e.g., `/market-overview?status=Active,Commit&days=90`)

---

## 4. Timeline — Unified Event Feed

**Data sources (merged client-side, sorted by date):**

| Source | Type | Date Field | Filter | Icon |
|--------|------|------------|--------|------|
| Category Review | `review` | `reviewDate` | `brokerId` + `reviewDate ∈ [today, today+14d]` | 🔵 |
| Promotional Event | `promo` | `startDate`/`endDate` | `brandId ∈ brokerBrands` + `endDate ≥ today` | 🟢 |
| Market Overview Follow-up | `followup` | `createdAt` | `brokerId` + `status = Pending` | 🟠 |
| Task Board Task | `task` | `dueDate` | `assigneeId = currentUser` | 🟣 |

**API:** `GET /api/broker/timeline?days=14` → returns unified array:

```json
[
  { "id": "cr-123", "type": "review", "title": "Sprouts - Snacks", "date": "2026-06-25", "status": "Pending", "href": "/category-review/123" },
  { "id": "pe-456", "type": "promo", "title": "KeHE TPR - Beverages", "date": "2026-06-23", "status": "Active", "href": "/promotional-management/456" },
  { "id": "mo-789", "type": "followup", "title": "Follow up: Costco visit", "date": "2026-06-24", "status": "Pending", "href": "/market-overview/789" }
]
```

**UI:** Virtualized list (`react-window`), grouped by date header, color-coded left border by type.

---

## 5. Task Board — 3-Column Kanban

**Columns (fixed, no config):**
1. **To Do** — `status = 'todo'`
2. **In Progress** — `status = 'in_progress'`
3. **Done** — `status = 'done'` (auto-archive after 7 days)

**Task entity:**
```ts
interface BrokerTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  sourceModule: 'market-overview' | 'category-review' | 'promotional-management' | 'distributor-apl' | 'manual';
  sourceId?: string; // deep link target
  assigneeId: string; // current user
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}
```

**API:**
- `GET /api/broker/tasks` — list for current user
- `POST /api/broker/tasks` — create
- `PATCH /api/broker/tasks/:id` — update (status, title, dueDate)
- `DELETE /api/broker/tasks/:id` — delete

**Drag-drop:** `@dnd-kit/core` — on drop, `PATCH /api/broker/tasks/:id` with new `status`.

**Empty state per column:** "+ Add task" button → opens Dialog with title, optional description, due date, source module dropdown.

---

## 6. Quick Actions — Static Tiles

| Tile | Label | Icon | Route | Badge |
|------|-------|------|-------|-------|
| 1 | Log Visit | `ClipboardPlus` | `/market-overview/create` | — |
| 2 | Category Review | `Calendar` | `/category-review` | `reviewsDue` count |
| 3 | Distributor APL | `Package` | `/distributor-apl` | — |
| 4 | Promotional Management | `TrendingUp` | `/promotional-management` | `activePromos` count |

**Badge:** Uses same KPI values (client-side, no extra fetch).

---

## 7. Broker Branding Header

**API:** `GET /api/broker/branding` → `{ logoUrl: string, name: string, primaryColor: string }`

**Fallback:** If no logo, show broker name in `primaryColor` text with `font-display`.

---

## 8. API Contracts (Backend)

### KPI Endpoints (all `GET`, broker-scoped)

| Endpoint | Response |
|----------|----------|
| `/api/broker/kpi/stores-in` | `{ value: 1247, trend: { value: 12, label: "vs last month" } }` |
| `/api/broker/kpi/reviews-due` | `{ value: 3 }` |
| `/api/broker/kpi/active-promos` | `{ value: 8 }` |
| `/api/broker/kpi/brands` | `{ value: 15 }` |

### Timeline
```
GET /api/broker/timeline?days=14
→ { events: TimelineEvent[] }
```

### Tasks
```
GET    /api/broker/tasks
POST   /api/broker/tasks           { title, description?, dueDate?, sourceModule? }
PATCH  /api/broker/tasks/:id       { status?, title?, dueDate? }
DELETE /api/broker/tasks/:id
```

### Branding
```
GET /api/broker/branding → { logoUrl?, name, primaryColor }
```

---

## 9. Acceptance Criteria

### KPI Row
- [ ] All 4 cards render with real data (not mock)
- [ ] Clicking a card navigates to correct list with filter applied
- [ ] Trend shows on Stores In card only
- [ ] Loading skeletons while fetching

### Timeline
- [ ] Shows 14 days of merged events from all 4 sources
- [ ] Events sorted by date ascending
- [ ] Date headers group events (e.g., "Mon Jun 23")
- [ ] Clicking event navigates to source record
- [ ] Empty state: "No upcoming events"

### Task Board
- [ ] 3 columns render with correct task counts
- [ ] Drag task between columns → persists status
- [ ] Create task via "+ Add" → appears in To Do
- [ ] Click task title → opens detail dialog (edit title, description, due date)
- [ ] Done tasks older than 7 days hidden (archived)

### Quick Actions
- [ ] 4 tiles present with correct icons/routes
- [ ] Category Review & Promotional Management tiles show badge counts from KPIs

### Branding
- [ ] Broker logo displays in header
- [ ] Fallback to name + color works

---

## 10. Dependencies / Prerequisites

| Dependency | Status |
|------------|--------|
| CS-1611 (store count fix) | Required for accurate "Stores In" KPI |
| CS-1316 (Category Review infinite scroll) | Quick Action tile links here |
| CS-1614/CS-1615 (Promotional Management fixes) | Quick Action tile links here |
| Distributor APL infinite scroll | Quick Action tile links here |
| Broker branding admin endpoint | New backend work |

---

## 11. Out of Scope (Future Phases)

- Shared team task board (multi-user)
- Custom KPI card builder
- Timeline filters by brand/retailer
- Email digest (MO9/CR2) — feeds timeline later
- Mobile responsive below 768px (Phase 2)

---

## 12. Figma / Handoff

- Frame: 1440px wide (desktop)
- Components: `KPICard`, `TimelineEvent`, `TaskColumn`, `TaskCard`, `QuickActionTile`
- Colors: Use `primaryColor` from branding API for broker-specific accents
- Icons: `lucide-react` (ClipboardPlus, Calendar, Package, TrendingUp, Bell, ChevronDown)