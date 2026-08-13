# Caboodle — Project Working Folder

BA / requirements workspace for the Caboodle multi-tenant SaaS platform (CPG brands & brokers).

## Quick Start
- **Knowledge base:** `AGENTS.md`, `CONTEXT.md`, `BUSINESS.md` — project memory, current context, business rules
- **System docs:** `ba-onboarding/` — backend/frontend/module documentation

## Folder Layout

| Path | Contents |
|------|----------|
| `tickets/` | Ticket spec / user story files, grouped by module (see below) |
| `meetings/` | Client meeting transcripts (Jul 15 – Aug 10) |
| `docs/` | Architecture reviews, testing checklists, analysis, handover docs |
| `data/` | Data files: Jira export CSV, backlog xlsx, sample uploads |
| `prototypes/` | Lovable / dev prototypes (`Daily Delight Calendar/`) |
| `Wireframe/` | Deployed broker dashboard wireframe (https://caboodle-broker-dashboard.vercel.app) |
| `scripts/` | Helper scripts (e.g., `check-descriptions.js`) |

## tickets/ — by module

| Folder | Covers |
|--------|--------|
| `broker-dashboard/` | Broker Dashboard UI, Distributor APL, landing page, task board, Ask Caboodle |
| `category-review/` | Category Review grid/list, calendar rollup, email notifications, brand report, infinite scroll |
| `market-overview/` | Market Overview MO1–MO9 |
| `promo-management/` | Promo Management PM1–PM6, approved promotions |
| `trade-spend/` | Trade Spend Sandbox (actualize promotions) |
| `brand/` | Brand-side module specs (Product Specs UPC in pricing) |
| `talking-points/` | Clarification talking-points for client calls |

## Not maintained here
- **Application source code** lives outside this folder (frontend `caboodle-new-web/`, backend `Caboodle/`)
