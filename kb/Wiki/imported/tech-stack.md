---
type: reference
title: Tech stack
module: platform
status: current
last_verified: 2026-10-14
---

# TECH STACK

### Frontend (`caboodle-new-web/`)
| Tech | Version | Notes |
|------|---------|-------|
| Next.js | 13.4.12 | App Router, route groups `(auth)`, `(brand)`, `(broker)` |
| TypeScript | 5.1.6 | **`strict: false`** — significant weakness |
| React | 19.1.0 | |
| Zustand | 4.4.1 | Global state (brand, role) with localStorage persist |
| TanStack React Query | 4.33.0 | Server state, caching, invalidation |
| NextAuth | 4.23.0 | JWT with refresh tokens, 10-min pre-expiry refresh |
| Ant Design | 5.23.2 | Primary UI library |
| PrimeReact | 10.9.2 | Secondary UI — causes bundle bloat/style conflicts |
| Tailwind CSS | 3.3.3 | Styling |
| Axios | 1.4.0 | HTTP client (two instances: `httpClient` + `axiosInstanceFromClient`) |
| AG Grid | (yes) | Data grids |
| ECharts | (yes) | Charts |
| CKEditor | (yes) | Rich text |
| Mapbox | (yes) | Maps |

### Backend (`Caboodle/`)
| Tech | Version | Notes |
|------|---------|-------|
| .NET | 6 (targeting 9) | EOL — upgrade deferred |
| Architecture | Clean Architecture + CQRS | Modular Monolith |
| Pattern | MediatR | Commands/Queries/Handlers |
| ORM | EF Core (writes), Dapper (reads) | |
| Validation | FluentValidation | |
| Mapping | AutoMapper | |
| Background jobs | Hangfire | PostgreSQL-backed |
| API | REST, Swagger/OpenAPI | |
| Logging | Serilog → Seq | |

### Database & Storage
| Component | Tech | Notes |
|-----------|------|-------|
| Primary DB | PostgreSQL (RDS) | Single logical DB, tenant isolation per Brand |
| Caching | Redis | **Infra ready but NOT activated** |
| File storage | S3 | Private buckets |
| Email | SES | Under upgrade (target Jan 15, 2026 update — still in progress) |
| Migrations | EF Core | In `caboodle/src/Database/Migrator` |

### Prototype Tools
| Tool | Use |
|------|-----|
| Lovable.dev | Rapid prototyping — Category Review yearly grid prototype created here |
| shadcn/ui + Tailwind | Prototype design system (Daily Delight Calendar) |
| Framer Motion | Prototype animations |
