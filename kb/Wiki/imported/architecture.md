---
type: reference
title: Architecture
module: platform
status: current
last_verified: 2026-10-14
---

# ARCHITECTURE

```
┌────────────────────────────────────────────────┐
│            FRONTEND (Next.js 13 App Router)    │
│  (auth) │ (brand) │ (broker) route groups      │
│  Zustand (client state) · TanStack Query       │
│  Ant Design + PrimeReact · Tailwind             │
├────────────────────────────────────────────────┤
│            HTTPS / REST API / JWT               │
├────────────────────────────────────────────────┤
│        BACKEND (.NET 6 Modules)                 │
│  Admin | Brand | Broker | CRM | Dashboard       │
│  DataHub | DataUpload | FileRepository          │
│  ProductSpecs | Report | Store | TradeSpend     │
│  TradeSpendSandbox                              │
│  Clean Architecture + CQRS (MediatR)            │
│  EF Core (writes) · Dapper (reads)              │
│  Hangfire (background jobs)                     │
├────────────────────────────────────────────────┤
│  PostgreSQL (RDS) · S3 · Redis (inactive)      │
│  SES · Serilog → Seq                            │
└────────────────────────────────────────────────┘
```

**Module pattern (per module):** Commands/Queries → Handlers → DTOs → Specifications → Validation → Domain Entities/Value Objects → Infrastructure.

**Pipeline behaviors:** Request → Validation → Logging → Transaction → Handler → Response. Exception middleware for consistent API errors.

**Tenancy:** Strict data isolation per Brand — global EF Core query filter appends `AND brand_id = @TenantBrandId`.

**Data access:** EF Core for transactional writes; Dapper for high-volume reads/complex queries. Repository + Specification pattern.
