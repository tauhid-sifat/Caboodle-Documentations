---
type: reference
title: Architecture
module: platform
status: current
last_verified: 2026-10-28
---

# ARCHITECTURE

**Verified from `docs/feature-context.md` (2026-10-28):**

```
Browser                Browser
    |                      |
 caboodle.web           caboodle.admin
 Next.js 14 :3000       Next.js 16 :3004
 (NextAuth, /api/ai-message placeholder)
    |  Authorization, OrganizationID, BrandID headers
    v                      v
 caboodle.backend  ASP.NET Core (.NET 6) :5060  /api/v1/*
    |-- PostgreSQL (EF Core writes, Dapper reads, Hangfire storage)
    |-- AWS S3 (files, exports, imports)      |-- SMTP mail + SNS delivery webhook
    |-- LLM providers (Claude, OpenAI, Gemini) |-- Google Geocoding
    |-- web crawler service (data sync)        |-- external SQL Server "Bubbies" (admin probe)
```

| Unit | Entry point | Talks to |
|---|---|---|
| Customer web app | `caboodle.web/src/app/layout.tsx`; started with `next start -p 3000` | Backend at `NEXT_PUBLIC_CABOODLE_API_URL` + `/api/v1`; own routes `/api/auth/[...nextauth]` and `/api/ai-message` |
| Platform admin app | `caboodle.admin/src/app/layout.tsx`; `next start -p 3004` | Backend at `NEXT_PUBLIC_CABOODLE_API_URL` with version `NEXT_PUBLIC_API_VERSION`; own route `/api/auth/[...nextauth]` |
| Backend API | `caboodle.backend/caboodle/src/Hosts/API/Program.cs`, module wiring in `ModuleStartup.cs` | PostgreSQL, Hangfire, S3, SMTP, SNS (inbound), Seq logging, Google Geocoding, LLM providers, web crawler (hard-coded internal URL), external "Bubbies" SQL Server |

Key points:
- No frontend rewrites/proxies; browser calls API origin directly, backend CORS applies.
- `OrganizationID` and `BrandID` headers read by `CurrentUserMiddleware`; set by web app `AxiosInterceptor`.
- SignalR hub at `/notifications` mapped but no frontend connects.
- Two EF contexts share one PostgreSQL connection: `ApplicationDbContext` (ASP.NET Identity, audit trails) and `MainDbContext` (~121 `DbSet`s). Tables split by schemas: `CRM`, `ProductSpecs`, `DataUpload`, `Brand`, `TradeSpend`, `TradeSpendSandbox`, `FileRepository`, `Email`, `Broker`, `DataHub`, `Intelligence`, `Configuration`, `DataLifecycle`, `Organization`, `Identity`, `Auditing`.

**Module pattern (per module):** Commands/Queries → Handlers → DTOs → Specifications → Validation → Domain Entities/Value Objects → Infrastructure.

**Pipeline behaviors:** Request → Validation → Logging → Transaction → Handler → Response. Exception middleware for consistent API errors (`ExceptionMiddleware`).

**Tenancy/Authorization:** Multi-tenant with Organization/Brand context via headers; access controlled by org roles/permissions, module access per person per brand, and policies (`RequireModule`, `RequireOrgPermission`, `MustHavePermission`). `BrandValidationMiddleware` provides legacy fallback.

**Data access:** EF Core for transactional writes; Dapper for high-volume reads/complex queries. Repository + Specification pattern.
