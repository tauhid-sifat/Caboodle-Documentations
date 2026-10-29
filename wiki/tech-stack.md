---
type: reference
title: Tech stack
module: platform
status: current
last_verified: 2026-10-28
---

# TECH STACK

**Documented state (2026-10-28)** — from `docs/feature-context.md` (code-verified):

| Repository | Branch documented | Notes |
|---|---|---|
| `caboodle.web` | `feature/IAM-Service` working tree | Includes uncommitted header and Company area changes present at documentation time |
| `caboodle.admin` | `feature/IAM-Service` | |
| `caboodle.backend` | `feature/CS-1770-iam-service-broker-workspace` | 86 commits ahead of `origin/master` and 45 behind. Feature commits only on master: CS-1774, CS-1792, CS-1791, CS-1795. Each affected module records the difference under "Gotchas / tech debt". |

| Layer | caboodle.web | caboodle.admin | caboodle.backend |
|---|---|---|---|
| Framework | Next.js 14.2.35 (App Router), React 18.3.1, TypeScript 5.1.6 | Next.js 16.2.11 (App Router), React 18.2.0, TypeScript 5.1.6 | ASP.NET Core on .NET 6 (`global.json`, every `.csproj` targets `net6.0`) |
| UI | antd 5.23.2, PrimeReact 10.9.2, Tailwind 3.3.3, AG Grid 31, ECharts 5, Mapbox GL 3, FortuneSheet, CKEditor 5 | antd 5.29.3, Tailwind, ECharts 6 | n/a |
| Data and state | React Query 4.33, Zustand 4.4, axios 1.4 | React Query 4.44, axios 1.18 | EF Core 6.0.2 + Npgsql 6.0.3, Dapper 2.0.123, EFCore.BulkExtensions 6.5, MediatR 10, FluentValidation 10, Mapster 7, Ardalis.Specification 6 |
| Auth | next-auth 4.23 (credentials, JWT) | next-auth 4.24 | JWT bearer (Azure AD option present, off) |
| Jobs and logs | n/a | n/a | Hangfire 1.7.28 on PostgreSQL, Serilog 5 (Seq, file, console), NSwag 13 |
| Tests | Jest 29 + Testing Library | Jest | xUnit + Moq + coverlet |

Sources: `caboodle.web/package.json`, `caboodle.admin/package.json`, `caboodle.backend/Directory.Build.props`, the module `.csproj` files.

### Database & Storage
| Component | Tech | Notes |
|-----------|------|-------|
| Primary DB | PostgreSQL (RDS) | Two EF contexts: `ApplicationDbContext` (ASP.NET Identity, audit trails) and `MainDbContext` (all module tables, ~121 `DbSet`s). Schemas: `CRM`, `ProductSpecs`, `DataUpload`, `Brand`, `TradeSpend`, `TradeSpendSandbox`, `FileRepository`, `Email`, `Broker`, `DataHub`, `Intelligence`, `Configuration`, `DataLifecycle`, `Organization`, `Identity`, `Auditing`. |
| Caching | N/A (Redis not activated) | Infra ready but NOT activated per older docs; verify as needed |
| File storage | S3 | Files, exports, imports |
| Email | SMTP + SNS delivery webhook | SES mentioned in older docs; see actual config |
| Migrations | EF Core | In `caboodle/src/Database/Migrator` |
| Background jobs | Hangfire | PostgreSQL-backed storage |
| Logging | Serilog | Seq, file, console |
| Real-time | SignalR | Mapped at `/notifications` but no frontend connects |

### External integrations
| Component | Notes |
|-----------|-------|
| LLM providers | Claude, OpenAI, Gemini |
| Google Geocoding | Used in DataHub |
| Web crawler service | Hard-coded internal URL (DataSync) |
| External SQL Server "Bubbies" | Admin probe only |

### Prototype Tools
| Tool | Use |
|------|-----|
| Lovable.dev | Rapid prototyping — Category Review yearly grid prototype created here |
| shadcn/ui + Tailwind | Prototype design system (Daily Delight Calendar) |
| Framer Motion | Prototype animations |
