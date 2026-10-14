---
type: Document
title: "Role \u0026 Permission Matrix"
---

# Role & Permission Matrix

*Sources: `CaboodlePermissions.cs`, `CaboodleRoles.cs`, `ApplicationDbSeeder.cs`, controller `MustHavePermission` attributes, `BrandValidationMiddleware.cs`*

## Important: Two-layer authorization

Caboodle uses **two separate mechanisms**:

1. **Permission claims** — stored in `RoleClaims` table, checked via `[MustHavePermission]` on ~20 of 38 controllers. Only ADMIN, BROKER, and BROKERSUBUSER receive seeded permissions.

2. **Role + brand scoping** — for most brand features, any authenticated user with a valid `BrandID` header can access endpoints. `BrandValidationMiddleware` verifies the user is linked to that brand based on role:
   - **ADMIN** → any brand
   - **BROKER / BROKERSUBUSER** → brands in `BrandBrokers` where `BrokerID = userID`
   - **BRANDSUBUSER** → brands in `BrandSubUsers`
   - **BRANDOWNER** (and default else branch) → brands where `Brands.UserID = userID`

**BRANDOWNER and BRANDSUBUSER have zero seeded permission claims** but access most brand features through mechanism #2.

---

## Default roles

| Role | Display name | Seeded permissions | Brand access |
|------|--------------|-------------------|--------------|
| ADMIN | Admin | All 53 permissions | All brands |
| BROKER | Broker | 13 broker permissions | Assigned brands via `BrandBrokers` |
| BROKERSUBUSER | BrokerSubUser | Same 13 as Broker | Assigned brands via `BrandBrokers` |
| BRANDOWNER | BrandOwner | None | Owned brands (`Brands.UserID`) |
| BRANDSUBUSER | BrandSubUser | None | Assigned brands via `BrandSubUsers` |
| UNASSIGNED | UnAssigned | None | None (until role assigned) |

*Source: `ApplicationDbSeeder.cs` lines 52–57; `CaboodleRoles.cs`*

---

## Permission catalog (53 total)

Format: `Permissions.{Module}.{Resource}.{Action}`

### User management (ADMIN only by default)

| Action | Permission name |
|--------|-----------------|
| View/Search/Create/Update/Delete users | `Permissions.User.Users.*` |
| View/Update/Delete user roles | `Permissions.User.UserRoles.*` |

### Role management (ADMIN only)

| Action | Permission name |
|--------|-----------------|
| View/Create/Update/Delete roles | `Permissions.Role.Roles.*` |

### Brand (ADMIN; Assign also BROKER/BROKERSUBUSER)

| Action | Permission name | Default roles |
|--------|-----------------|---------------|
| View brands | `Permissions.Brand.Brands.View` | ADMIN |
| Upsert brand | `Permissions.Brand.Brands.Upsert` | ADMIN |
| Delete brand | `Permissions.Brand.Brands.Delete` | ADMIN |
| Assign user to brands | `Permissions.Brand.BrandAssign.Assign` | ADMIN |
| Assign brands to broker | `Permissions.Broker.BrandAssign.Assign` | ADMIN, BROKER, BROKERSUBUSER |

### Pipeline (ADMIN only)

| Action | Permission name |
|--------|-----------------|
| View deal stages | `Permissions.PipeLine.PipeLineDealStage.View` |
| Update deal stages | `Permissions.PipeLine.PipeLineDealStage.Update` |

### Broker module (ADMIN + BROKER + BROKERSUBUSER)

| Action | Permission name | BROKER | BROKERSUBUSER | ADMIN |
|--------|-----------------|--------|---------------|-------|
| View brokers list | `Permissions.Broker.Brokers.View` | ✗ | ✗ | ✓ |
| View broker dashboard | `Permissions.Broker.BrokerDashBoard.View` | ✓ | ✓ | ✓ |
| Market overview CRUD | `Permissions.Broker.BrokerMarketOverview.*` | ✓ | ✓ | ✓ |
| Category review import/view | `Permissions.Broker.BrokerCategoryReview.*` | ✓ | ✓ | ✓ |
| Promotional management view | `Permissions.Broker.BrokerPromotionalManagement.View` | ✓ | ✓ | ✓ |
| Sub-user view/update/delete | `Permissions.Broker.SubUsers.*` | ✓ | ✓ | ✓ |
| View all banners (broker context) | `Permissions.Broker.Banners.View` | ✓ | ✓ | ✓ |

### Data upload (ADMIN only)

| Action | Permission name |
|--------|-----------------|
| Master data import | `Permissions.DataUpload.MasterDataUpload.Import` |
| Master data export | `Permissions.DataUpload.MasterDataUpload.Export` |
| Data mapping CRUD | `Permissions.DataUpload.DataUpload.Create` |

### CRM admin views (ADMIN only)

| Resource | View permission |
|----------|-----------------|
| Retailers | `Permissions.Retailer.Retailers.View` |
| Distributors | `Permissions.Distributor.Distributors.View` |
| Categories | `Permissions.Category.Categories.View` |
| Products | `Permissions.ProductSpec.ProductsSpec.View` |
| Price lists | `Permissions.PriceList.PriceLists.View` |
| Banners | `Permissions.Banner.Banners.View` |
| Banner SKUs | `Permissions.BannerSKU.BannerSKUs.View` |
| Contacts | `Permissions.Contact.Contacts.View` |
| Stores | `Permissions.Store.Stores.View` |

### CRM admin writes (ADMIN only)

| Action | Permission name |
|--------|-----------------|
| Upsert retailer | `Permissions.Retailer.Retailers.Upsert` |
| Delete retailer | `Permissions.Retailer.Retailers.Delete` |
| Upsert distributor | `Permissions.Distributor.Distributors.Upsert` |
| Delete distributor | `Permissions.Distributor.Distributors.Delete` |
| Create store | `Permissions.Store.Stores.Create` |

### DataHub (ADMIN only)

| Action | Permission name |
|--------|-----------------|
| View entity resolution | `Permissions.DataHub.EntityResolution.View` |
| Manage entity resolution | `Permissions.DataHub.EntityResolution.Upsert` |
| Approve suggestions | `Permissions.DataHub.EntityResolution.Update` |

### Sub-users (ADMIN for brand sub-users; BROKER for broker sub-users)

| Action | Permission name | Roles |
|--------|-----------------|-------|
| View sub-users | `Permissions.SubUser.SubUsers.View` | ADMIN |
| View broker sub-users | `Permissions.Broker.SubUsers.View` | BROKER, BROKERSUBUSER, ADMIN |
| Toggle sub-user active | `Permissions.Broker.SubUsers.Update` | BROKER, BROKERSUBUSER, ADMIN |
| Remove broker sub-user | `Permissions.Broker.SubUsers.Delete` | BROKER, BROKERSUBUSER, ADMIN |

---

## Modules WITHOUT permission claims (brand-scoped access only)

These controllers have **no** `[MustHavePermission]` attributes. Access = authenticated + brand header validation:

| Module | Controller | Typical roles |
|--------|------------|---------------|
| TradeSpend | `TradeSpendsController` | BrandOwner, BrandSubUser, Broker*, Admin |
| TradeSpendSandbox | `TradeSpendsSandboxController` | Same |
| ProductSpec (brand CRUD) | `ProductSpecsController` | Same |
| CRM (brand CRUD) | Most CRM controllers | Same |
| DataUpload (brand import/reports) | `KeHeController`, `UNFIController`, `SPINSController`, `DistributorSalesReportsController` | Same |
| Report | `ReportsController` | Same |
| Dashboard | `DashboardController` | Same |
| Intelligence | `IntelligenceChatController` | Same |
| FileRepository | `FilesController`, `DirectoryController` | Broker* + BrandOwner (handler rules) |
| Profile | `ProfileController` | All authenticated |

*Broker/BrokerSubUser only for brands assigned via `BrandBrokers`.*

---

## Role × capability summary (business view)

| Capability | ADMIN | BRANDOWNER | BRANDSUBUSER | BROKER | BROKERSUBUSER |
|------------|-------|------------|--------------|--------|---------------|
| Admin portal login | ✓ | ✗ | ✗ | ✗ | ✗ |
| Brand app login | ✓ | ✓ | ✓ | ✓ | ✓ |
| Master data upload wizard | ✓ | ✗* | ✗* | ✗* | ✗* |
| Entity resolution / DataHub admin | ✓ | ✗* | ✗* | ✗* | ✗* |
| Brand CRM / products / promos | ✓ | ✓† | ✓† | ✓† | ✓† |
| Broker market overview / APL | ✓ | ✗ | ✗ | ✓ | ✓ |
| Push sandbox → BAP | ✓ | ✓† | ✓† | ✓† | ✓† |
| Manage users/roles | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage broker sub-users | ✓ | ✗ | ✗ | ✓ | ✗‡ |

\* Unless custom role granted permissions via role management UI.  
† Only for brands they are linked to.  
‡ BrokerSubUser removal/toggle targets sub-brokers; parent broker manages them.

---

## Handler-level role checks (beyond permissions)

| Check | File | Rule |
|-------|------|------|
| Brand header validation | `BrandValidationMiddleware.cs` | Role-based brand access query |
| Assign brand to broker | `AssignBrandToBrokerRequest.cs` | Must be BROKER or BROKERSUBUSER |
| File privacy | `FileRepository.Application/*` | BRANDOWNER for private files; broker brand assignment |
| Event submission (live) | `UpdateSubmissionStatusOfEventsRequest.cs` | Broker roles filtered in SQL |
| Admin token | `TokenService.GetAdminTokenAsync` | Must have ADMIN role |
| New user default role | `UserService.CreateUpdate.cs` | Defaults to UNASSIGNED |

---

## Custom roles

`RoleService.UpdatePermissionsAsync` allows adding/removing permission claims on **non-default** roles. Default roles (all 6 in `CaboodleRoles`) cannot be modified or deleted.

*Source: `RoleService.cs`*
