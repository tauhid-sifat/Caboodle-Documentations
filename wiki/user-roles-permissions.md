---
type: reference
title: User roles and permissions
module: general
status: current
last_verified: 2026-10-14
---

# USER ROLES & PERMISSIONS

| Role | Permissions | Restrictions |
|------|------------|-------------|
| **Admin** | Full system access, user management, data upload, data mapping, settings | None |
| **Brand Owner** | Full access to own brand — Product Specs, TSS (create/edit/push), Reports, CRM, Pipeline | Cannot access other brands |
| **Brand Sub-User** | Limited subset of Brand Owner | Exact boundaries undocumented |
| **Broker** | Broker Dashboard, Market Overview, Promo Management, Category Review, APL, Files | Cannot create promos, only manage approved ones |
| **Sub-Broker** | Limited subset of Broker | More limited than Broker |
| **Read-Only** | View data only | All edit/delete/create hidden |

**Known gap:** The permission system exists (RBAC roles) but **many controllers lack explicit `[Authorize]` checks**. Brand roles technically get no permissions assigned in code — several calls return empty permission arrays. Cross-tenant access via Brand-ID header is trust-based at the controller level.
