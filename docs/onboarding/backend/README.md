# Caboodle BA Onboarding Documentation

This documentation set was produced by reading the **actual source code** in the Caboodle backend (`f:\Caboodle New Repository`) and the two sibling frontend repositories (`f:\Caboodle New Web`, `f:\Caboddle Admin Web`). It is written for Business Analysts who do not read code.

Every factual claim cites a source file, class, or function. Where the code is ambiguous or incomplete, that is stated explicitly.

## How to use these documents

| Document | Purpose |
|----------|---------|
| [00-repository-map.md](./00-repository-map.md) | What exists in the solution, frontend route groups, and gaps vs prior docs |
| [01-backend-modules.md](./01-backend-modules.md) | Per-module purpose, entities, business rules, operations, access, dependencies |
| [02-frontend-applications.md](./02-frontend-applications.md) | Screens by role, client-side logic, frontend/backend mismatches |
| [03-glossary.md](./03-glossary.md) | Domain terms with code-grounded definitions |
| [04-role-permission-matrix.md](./04-role-permission-matrix.md) | Role × module × action matrix from authorization code |
| [05-entity-relationships.md](./05-entity-relationships.md) | How core business entities relate |
| [06-end-to-end-workflows.md](./06-end-to-end-workflows.md) | Step-by-step narratives for key workflows |
| [07-known-gaps-and-risks.md](./07-known-gaps-and-risks.md) | Incomplete, TODO, inconsistent, or risky areas |
| [08-documentation-audit.md](./08-documentation-audit.md) | Where existing docs match or contradict the code |

## Related existing documentation

The folder `caboodle/docs/business/` also contains API integration guides (`*-fe-integration.md`) and `system-business-glossary.md`. See [08-documentation-audit.md](./08-documentation-audit.md) for how those compare to the code.

## Repository layout (verified)

| Repository | Path | Technology | Serves |
|------------|------|------------|--------|
| Backend API | `f:\Caboodle New Repository\caboodle` | .NET modular monolith | All roles via REST API |
| Brand/Broker web app | `f:\Caboodle New Web` | Next.js 14 (App Router) | BrandOwner, BrandSubUser, Broker, BrokerSubUser |
| Admin web app | `f:\Caboddle Admin Web` | Next.js 13 (App Router) | Admin |

**Note:** The backend workspace does **not** contain a frontend. Prior docs in `caboodle/docs/business/` do not reference frontend repo paths.
