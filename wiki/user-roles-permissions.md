---
type: reference
title: User roles and permissions
module: general
status: current
last_verified: 2026-10-29
---

# USER ROLES & PERMISSIONS

Source of truth: `docs/feature-context.md` §0.2 and §2.1.6 / §2.2.1.

## Identity (platform) roles (`caboodle.backend/.../CaboodleRoles.cs`)
| Role | Status | Notes |
|------|--------|-------|
| `ADMIN` | Active (Platform Admin) | Seeded with all platform permissions; signs in to `caboodle.admin` via `POST /api/v1/admin/login`. |
| `UNASSIGNED` | Active (default) | Default role for new accounts; zero permissions. |
| `BRANDOWNER`, `BROKER`, `BRANDSUBUSER`, `BROKERSUBUSER` | Deprecated as access model | Still seeded/read by `BrandValidationMiddleware` and legacy endpoints; new code must not use them. |

## Organization (IAM) roles (`caboodle.backend/.../OrgRoles.cs`)
| Key | Org type | Full brand access | Permissions |
|-----|----------|-------------------|-------------|
| `brand-admin` | Brand (5) | yes | all 13 org permissions |
| `brand-member` | Brand (5) | no | `organization.view`, `member.view`, `connection.view` |
| `brokerage-admin` | Brokerage (10) | yes | all 13 org permissions |
| `broker` | Brokerage (10) | no | `organization.view`, `member.view` |

Organization permissions (`OrgPermissions`): `organization.view`, `organization.update`, `member.view|invite|approve|update|suspend|remove`, `domain.view|manage`, `connection.view`, `access.manage`, `files.private`.

Module actions (bit flags, `ModuleActions`): View 1, Create 2, Update 4, Delete 8, Import 16, Export 32, All 63. Granted per brand and per member via brand access (Full/Custom), capped by a module's `AvailableActions`.

## Access model (three layers)
1. Platform permissions (`[MustHavePermission]`) — effectively Platform Admin endpoints now.
2. Organization permissions (`[RequireOrgPermission]`) — per member's org role.
3. Module actions per brand (`[RequireModule]`) — module catalog assignment + per-member brand access.

Endpoint authorization: `PermissionPolicyProvider` builds policies on demand; `AccessForbiddenResultHandler` renders 400 (bad BrandID) or 403 envelopes. Reflection coverage test `EndpointAuthorizationCoverageTests` asserts every action has exactly one rule (baseline of 4 bare `BannersController` promo-rule actions still pending).

**Known gaps (code-verified):** `BrandValidationMiddleware` still consults legacy role tables before falling back to the access engine; legacy roles still seeded/read; 4 `BannersController` promo-rule actions unguarded; module catalog create/update/delete do not bump access versions. Cross-tenant risk: Brand-ID header trust-based in legacy paths; new endpoints use `IAccessContext`.
