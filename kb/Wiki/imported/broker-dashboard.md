---
type: reference
title: Broker dashboard wireframe and features
module: broker-dashboard
status: current
last_verified: 2026-10-14
---

# BROKER DASHBOARD — WIREFRAME & FEATURES

A live wireframe is deployed at **https://caboodle-broker-dashboard.vercel.app**

### Layout (top to bottom)
1. **Header** — Caboodle logo, nav (Dashboard, Management ▾, Strategy ▾, Files icon), brand selector
2. **Quick Actions** — 5 tiles: Market Overview, Category Review, Distributor APL, Promotional Management, File
3. **KPI Row** — 4 compact horizontal cards: Stores In (1,247), Reviews Due (3), Active Promos (8), Brands Represented (15)
4. **Timeline + Task Board** — 55/45 split: 14-day unified feed + 3-column Kanban

### Key Design Decisions
- KPI cards are horizontal (icon + value/label + trend + View link on one row) — compact
- Timeline merges Category Review deadlines, Promo events, and Tasks
- Task Board is simple (To Do / In Progress / Done) — NOT the CRM Pipeline
- Quick Actions are **under the header** (above KPI row)
- Dark mode toggle removed from final wireframe
