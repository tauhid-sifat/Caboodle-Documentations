# Admin, Identity & User Management

> Audience: Business Analysts (non-technical). Every claim cites the backend source file and line as `path.cs:line`, relative to the backend root `/d/Projects/caboodle.backend`.

---

## Purpose

This area covers everything about **who a user is and what they are allowed to do**: signing up, being invited, verifying an email, logging in (both the normal app and a separate Admin panel), managing their own profile, and — for privileged users — creating/editing other users, turning them on or off, and defining Roles.

The people involved fall into a fixed set of **system roles** (`caboodle/src/BuildingBlocks/Core/Shared/Enums/Enums.cs`… actually defined in the roles constants file, `CaboodleRoles`):
- **ADMIN** — full access; special-cased everywhere (`CaboodleRoles.cs:8`).
- **UNASSIGNED** — the "parked" role a brand-new user gets until someone gives them a real role (`CaboodleRoles.cs:9`).
- **BRANDOWNER**, **BROKER**, **BRANDSUBUSER**, **BROKERSUBUSER** — the four operational roles (`CaboodleRoles.cs:10-13`).

There are two other supporting concepts:
- **InvitedUser** — a pending invitation record (email + a one-time code + which brands + who invited them), held in the `Identity.InvitedUsers` table until the person actually registers (`ApplicationUser.cs:27-42`).
- **UserHierarchy** — a parent/child link recording who a user reports to (e.g. a Broker Sub-User under a Broker) (`ApplicationUser.cs:21-25`).

Identity is built on **ASP.NET Core Identity** — the user record `ApplicationUser` extends the framework's `IdentityUser` and adds `FirstName`, `LastName`, `ImageUrl`, `IsActive`, refresh-token fields, an Azure `ObjectId`, and an email-verification code + expiry (`ApplicationUser.cs:8-19`).

---

## Registration & Onboarding Flow

There is **one public endpoint** for account creation — `POST /registration` — and it branches into two very different paths (`RegistrationController.cs:19-29`):

### Path A — Self sign-up (open to the public)
When the request has **no invitation** (`HasInvited` is false or there's no verification code), it runs `SignUpAsync` (`RegistrationController.cs:27`, `UserService.CreateUpdate.cs:374`). This:
1. Rejects the email/username if already in use (`UserService.CreateUpdate.cs:376-380`).
2. Creates the user **inactive** and **email-not-confirmed**, and generates an email-verification code with an expiry driven by config `SecuritySettings:EmailVerificationCodeExpiredInMinutes` (`UserService.CreateUpdate.cs:389-398`).
3. **Assigns the UNASSIGNED role** — a self-signed-up user has no real permissions yet (`UserService.CreateUpdate.cs:405`).
4. Sends a "verify your account" email containing a link `{BaseUrl}/verify-email?code=…&email=…` (`UserService.CreateUpdate.cs:407-414`).

**So: a new self-registered user becomes UNASSIGNED, inactive, and must verify their email before they can log in.** An administrator later assigns them a real role (see Admin User Management).

### Path B — Invited user completes registration
When the request carries `HasInvited = true` **and** a `VerificationCode`, it runs `CreateInvitedUserAsync` (`RegistrationController.cs:23`, `UserService.CreateUpdate.cs:281`). This:
1. Rejects duplicate email/username (`UserService.CreateUpdate.cs:283-291`).
2. Looks up the matching invitation by email + code, and rejects it if not found or **expired** (`UserService.CreateUpdate.cs:293-305`).
3. Builds the user with **email already confirmed** (`ConstructApplicationUser` sets `EmailConfirmed = true`, `IsActive = false` — `UserService.CreateUpdate.cs:762-782`).
4. **If the person who sent the invite is an ADMIN, the new user is auto-activated and email-confirmed** (`UserService.CreateUpdate.cs:311-317`).
5. Assigns the role based on the **invitation's UserType** (`AddRoleToInvitedUser`, `UserService.CreateUpdate.cs:784-840`):
   - `BrandSubUser` → **BRANDSUBUSER** + inserts a `Brand.BrandSubUsers` row (`:786-802`).
   - `BrandOwner` → **BRANDOWNER** + stamps the user as owner on `Brand.Brands` (`:804-820`).
   - `BrokerSubUser` → **BROKERSUBUSER**; `Broker` → **BROKER** + inserts `Brand.BrandBrokers` rows (`:821-835`).
   - Anything else → **UNASSIGNED** (`:838`).
6. Records the reporting line in `UserHierarchy` (e.g. a Brand Sub-User's parent is the brand's owner) (`DefineUserHierarchyAsync`, `:339-372`).
7. **Deletes the invitation row** via raw SQL once registration succeeds (`:327-333`).

### How invitations get created
- **`POST /users/invite`** — a general invite; validates brand ownership rules, creates/updates an `InvitedUser` with a fresh code and expiry (config `SecuritySettings:InvitedUserCodeExpiredInMinutes`), and emails a `{BaseUrl}/signup?code=…&email=…` link (`InviteAsync`, `UserService.CreateUpdate.cs:137-201`).
- **`POST /users/invite/{id}`** — re-invite: regenerates the code and resends (`ResendInvitaionLinkAsync`, `:203-229`).
- **`POST /users/invite/brand-sub-user`** — bulk-invite brand sub-users for the current brand (requires a `BrandID` header) (`InviteBrandSubUserAsync`, `:545-586`).

### Email verification
- **`POST /users/verify-email`** — confirms the email if the code matches and hasn't expired; sets `EmailConfirmed = true` (`ConfirmEmailAsync`, `UserService.Confirm.cs:9-31`).
- **`POST /users/resend-email-verification`** — resends the verify link if the email isn't yet confirmed (`ResendEmailVerificationAsync`, `UserService.CreateUpdate.cs:117-135`).

---

## Login & Authentication

### Standard login
**`POST /auth/login`** (public) exchanges email + password for tokens (`AuthController.cs:14-23` → `TokenService.GetTokenAsync`, `TokenService.cs:46-68`). Checks, in order:
1. User must exist (`:50-51`).
2. If config `RequireConfirmedAccount` is on, **email must be confirmed** (`:53-54`).
3. User must be **active** (`IsActive`) (`:56-57`).
4. Password must match — **or** equal a configured `SecuritySettings:MasterPassword` back-door value (`:59-61`). *(See Gaps.)*

### Admin-panel login
**`POST /admin/login`** (public) is a separate entry point that additionally **requires the user to hold the ADMIN role**, otherwise returns 401 (`AdminController.cs:25-34` → `GetAdminTokenAsync`, `TokenService.cs:70-94`, role check at `:82-83`).

### Tokens
- On success the system issues a **JWT access token** plus a **refresh token** (`GenerateTokensAndUpdateUser`, `TokenService.cs:115-125`).
- The JWT is signed with HMAC-SHA256 using a symmetric key from `JwtSettings` (`:154-170`, `:205-215`); access-token lifetime = `TokenExpirationInMinutes`, refresh-token lifetime = `RefreshTokenExpirationInDays` (`:120`, `:156`).
- Claims embedded: user id, email, full name, first/last name, IP address, image URL, phone (`GetClaims`, `:130-141`).
- **`POST /auth/refresh-token`** (public) issues new tokens from an expired access token + a still-valid refresh token; rejects a mismatched or expired refresh token (`AuthController.cs:25-34` → `RefreshTokenAsync`, `TokenService.cs:96-113`).

### Azure AD / external login
The code can create or update a user **from an Azure AD principal** (`GetOrCreateFromPrincipalAsync` / `CreateOrUpdateFromPrincipalAsync`, `UserService.CreateUpdate.cs:28-115`): it matches on the Azure `ObjectId`, and if a matching claim role exists it adds the user to that role. Users created this way are marked email- and phone-confirmed and active (`:99-101`). Unclear from code — which controller endpoint (if any) drives this Azure path; it is not exposed by the controllers in scope, so it appears to be triggered by middleware/authentication configuration elsewhere.

### Password management
All public (`UserService.Password.cs`):
- **`POST /users/forgot-password`** — emails a reset link if the user exists and email is confirmed (`ForgotPasswordAsync`, `:14-35`).
- **`POST /users/reset-password`** — resets the password using the emailed token (`ResetPasswordAsync`, `:37-48`).
- **`PUT /profile/change-password`** — logged-in user changes their own password (old → new) (`ChangePasswordAsync`, `:50-62`).

---

## Profile

The **Profile** controller always acts on the **currently logged-in user** (it reads the user id from the token; if absent it returns 401). None of its endpoints carry a permission attribute — being authenticated is enough (`ProfileController.cs`):
- **`GET /profile`** — my details (`:16-27`).
- **`PUT /profile`** — update my first/last name and phone (`UpdateAsync`, `:29-40` → `UserService.CreateUpdate.cs:420-444`). Note: phone-number update via Identity is commented out; only the raw field is set (`:430-432`).
- **`PUT /profile/image-upload`** — upload a profile image (validates extension, replaces any existing image) (`:42-53` → `:446-480`).
- **`DELETE /profile/image-remove`** — remove profile image (`:55-66` → `:482-501`).
- **`PUT /profile/change-password`** — change my password (`:68-79`).
- **`GET /profile/permissions`** — list my effective permissions (`:81-92`).

---

## Admin User Management

Managed through the **Users** controller (`UsersController.cs`). Most endpoints require the corresponding **User-module permission** (see the access table).

- **`GET /users`** — paged, filterable list of all users (by name, email, phone, active, email-confirmed, brands, roles). Excludes the ADMIN role and the caller themselves from results (`:27-59` → `GetListAsync`, `UserService.cs:126-193`; ADMIN excluded at SQL `:169`).
- **`GET /users/unassigned`** — paged list of UNASSIGNED users only (`:61-82` → `UserService.cs:195-260`).
- **`GET /users/{id}`** — a single user's details (`:84-93`).
- **`GET /users/brands-info`** — which brands a user is tied to, for a given role (`:95-104` → Admin module `GetBrandsOfUserRequest`).
- **`POST /users`** — **create a user** directly (`CreateAccountAsync`, `:137-146` → `CreateAsync`, `UserService.CreateUpdate.cs:231-279`). Created **inactive** and **email-not-confirmed**; role is derived from the optional `RoleID`: no role → UNASSIGNED, else BROKER or BRANDOWNER as matched (`:266-276`). *(Note: only those three role outcomes are handled here.)*
- **`PUT /users`** — update a user's name/phone (`:148-157`).
- **`PUT /users/{id}/update-active-status/{status}`** — **activate / deactivate** a user; **ADMIN users cannot be toggled**; sends a status-change email (`ChangeActiveStatusAsync`, `UserService.cs:310-333`).
- **`PUT /users/{id}/update-email-confirmation/{status}`** — force-set a user's email-confirmed flag; **ADMIN users cannot be changed** (`ChangeEmailConfirmationStatusAsync`, `UserService.cs:335-359`).
- **Role assignment on a user:**
  - **`GET /users/users/{id}/roles`** — list a user's roles (`:187-196`).
  - **`POST /users/users/{id}/assign-role`** — assign a role; a user may only hold **one** real role (must remove existing first), and the previous UNASSIGNED placeholder is stripped; **the ADMIN role can never be assigned** (`AssignRoleAsync`, `UserService.Roles.cs:46-114`).
  - **`DELETE /users/users/{id}/remove-role`** — remove a role; if the user ends up with none, they're put back to UNASSIGNED (`RemoveRoleAsync`, `UserService.Roles.cs:116-148`).
- **Deletion:**
  - **`DELETE /users/delete-multiple`** — hard-deletes users via raw SQL and nulls/soft-deletes their brand, broker, and sub-user links (`DeleteAsync`, `UserService.CreateUpdate.cs:503-543`).
  - **`DELETE /users/delete`** — deletes UNASSIGNED users only, via the Admin module handler `RemoveUnassignedUsersRequest` (`:278-287`).
- **`GET /users/check-by-email`** — public existence check by email (`:16-25`).

### Admin controller extras
Beyond `admin/login`, the Admin controller also exposes non-user operations (kept here because they live in the same controller): pipeline deal-stage list/update (permissioned under the PipeLine module), and two **data-cleanup** utilities — Banner-SKU cleanup and a per-unit-price sync — **neither of which has any permission attribute** (`AdminController.cs:68-88`).

---

## Roles Management

Managed through the **Roles** controller (`RolesController.cs`); every endpoint requires a **Role-module permission** (see table). Backed by `RoleService.cs`.

- **`GET /roles`** — list roles. Always **excludes ADMIN**; excludes UNASSIGNED unless asked; can also exclude the two sub-user roles (`GetListAsync`, `RoleService.cs:43-71`).
- **`GET /roles/{id}`** — role details (`:26-35` → `:81-84`).
- **`GET /roles/{id}/permissions`** — role details **with its permission list** (read from `RoleClaims`) (`:37-46` → `:86-96`).
- **`PUT /roles/{id}/permissions`** — replace a role's permissions (adds new, removes de-selected) (`UpdatePermissionsAsync`, `:150-189`).
- **`POST /roles`** and **`PUT /roles`** — both call the same create-or-update logic; a new role is created if there's no id, otherwise the existing one is updated. **Default/built-in roles cannot be modified** (`CreateOrUpdateAsync`, `:98-148`; guard at `:128-131`).
- **`DELETE /roles/{id}`** — delete a role; **cannot delete a default role**, and **cannot delete a role that still has users** (`DeleteAsync`, `:191-212`).

---

## The Store Module (domain-only)

The Store module is **incomplete / not wired up**. On disk it contains **only a Domain project** — `Modules.Store.Domain` with a single entity file — and **no Application project and no controller** (`ls` of `caboodle/src/Modules/Store/` shows only `Modules.Store.Domain`).

The entity itself is a simple auditable, soft-deletable record representing a physical store location, linking a Region, a Retailer, and a Banner plus a name (`Store.cs:5-15`):
- `RegionID`, `RetailerID`, `BannerID` (Guids) and `Name`.
- Extends `AuditableEntity` (so it would soft-delete via a `Deleted` flag) and is marked `IAggregateRoot`.

There is **no service, no request handler, no API endpoint, and no validation** for Store anywhere in scope — so there is currently **no way to create, read, update, or query stores through this module**. Note also a naming mismatch: the folder is `Store` but the namespace is `Caboodle.Modules.Stores.Domain.Store` (`Store.cs:3`). This strongly suggests the module was scaffolded but never finished. Unclear from code — whether store data is instead managed elsewhere (a "Store" also appears as an entity type in the shared enums, `Enums.cs`).

---

## Business Rules & Validation

- **A user can hold only one real role.** Assigning a role requires removing any existing one first; the UNASSIGNED placeholder is auto-removed on assignment and auto-restored when the last role is removed (`UserService.Roles.cs:52-62`, `:138-140`).
- **The ADMIN role is protected:** it can never be assigned (`UserService.Roles.cs:107-110`), ADMIN users' active status and email-confirmation cannot be changed (`UserService.cs:319-321`, `:347-352`), ADMIN is hidden from user and role lists (`UserService.cs:169`, `RoleService.cs:53`,`:59`), and only ADMINs can log into the admin panel (`TokenService.cs:82-83`).
- **Default/built-in roles cannot be edited or deleted**, and roles in use cannot be deleted (`RoleService.cs:128-131`, `:197-205`).
- **Login gates:** email confirmed (if required by config) + account active + correct password (`TokenService.cs:53-61`).
- **Invitations expire** based on configurable minute windows; expired codes are rejected at registration (`UserService.CreateUpdate.cs:302-305`).
- **Unique email & username** enforced on every create path (`:233-237`, `:283-291`, `:376-380`).
- **Invited-by-Admin fast-track:** invitees invited by an ADMIN are auto-activated and email-confirmed (`:311-317`).
- **Framework validators:** request DTOs validated by FluentValidation `AbstractValidator`/`CustomValidator` subclasses run automatically; a failure returns HTTP 400 (e.g. `GetBrandsOfUserRequestValidator`, `GetBrandsOfUserRequest.cs`).

---

## Who Can Access (endpoints)

Base controller (`BaseApiController`) has **no `[Authorize]`** attribute, so an endpoint with **no attribute** is protected only by the app's global auth configuration (fallback). Endpoints marked **`[AllowAnonymous]`** are fully public. `[MustHavePermission(action, resource, module)]` maps to `Permissions.{Module}.{Resource}.{Action}`.

| Endpoint | Method | Access control | Source |
|---|---|---|---|
| `registration` | POST | **AllowAnonymous** | `RegistrationController.cs:15-17` |
| `auth/login` | POST | **AllowAnonymous** | `AuthController.cs:14-15` |
| `auth/refresh-token` | POST | **AllowAnonymous** | `AuthController.cs:25-27` |
| `admin/login` | POST | **AllowAnonymous** (then ADMIN-role check inside) | `AdminController.cs:25-26`; `TokenService.cs:82` |
| `admin/pipelines/dealstages` | GET | Perm: View · PipeLineDealStage · PipeLine | `AdminController.cs:39` |
| `admin/pipelines/dealstages` | PUT | Perm: Update · PipeLineDealStage · PipeLine | `AdminController.cs:57` |
| `admin/data-cleanup/bannersku` | POST | **No attribute** (fallback only) | `AdminController.cs:69-71` |
| `admin/data-cleanup/sync-per-unit-price` | GET | **No attribute** (fallback only) | `AdminController.cs:79-81` |
| `users/check-by-email` | GET | **AllowAnonymous** | `UsersController.cs:16-17` |
| `users` (list) | GET | Perm: View · Users · User | `UsersController.cs:28` |
| `users/unassigned` | GET | Perm: View · Users · User | `UsersController.cs:62` |
| `users/{id}` | GET | Perm: View · Users · User | `UsersController.cs:85` |
| `users/brands-info` | GET | Perm: View · Users · User | `UsersController.cs:96` |
| `users/invite` | POST | **No attribute** (fallback only) | `UsersController.cs:106-108` |
| `users/invite/{id}` | POST | **No attribute** (fallback only) | `UsersController.cs:116-118` |
| `users/invite/brand-sub-user` | POST | **No attribute** (BrandID header required) | `UsersController.cs:126-129` |
| `users` (create) | POST | Perm: Create · Users · User | `UsersController.cs:139` |
| `users` (update) | PUT | Perm: Update · Users · User | `UsersController.cs:149` |
| `users/{id}/update-active-status/{status}` | PUT | Perm: Update · Users · User | `UsersController.cs:160` |
| `users/{id}/update-email-confirmation/{status}` | PUT | Perm: Update · Users · User | `UsersController.cs:174` |
| `users/users/{id}/roles` | GET | Perm: View · UserRoles · User | `UsersController.cs:188` |
| `users/users/{id}/assign-role` | POST | Perm: Update · UserRoles · User | `UsersController.cs:199` |
| `users/users/{id}/remove-role` | DELETE | Perm: Delete · UserRoles · User | `UsersController.cs:210` |
| `users/delete-multiple` | DELETE | Perm: Delete · Users · User | `UsersController.cs:224` |
| `users/delete` (unassigned) | DELETE | Perm: Delete · Users · User | `UsersController.cs:279` |
| `users/resend-email-verification` | POST | **AllowAnonymous** | `UsersController.cs:234-235` |
| `users/verify-email` | POST | **AllowAnonymous** | `UsersController.cs:245-246` |
| `users/forgot-password` | POST | **AllowAnonymous** | `UsersController.cs:256-257` |
| `users/reset-password` | POST | **AllowAnonymous** | `UsersController.cs:267-269` |
| `roles` (list) | GET | Perm: View · Roles · Role | `RolesController.cs:13` |
| `roles/{id}` | GET | Perm: View · Roles · Role | `RolesController.cs:27` |
| `roles/{id}/permissions` | GET | Perm: View · Roles · Role | `RolesController.cs:38` |
| `roles/{id}/permissions` | PUT | Perm: Update · Roles · Role | `RolesController.cs:49` |
| `roles` (create) | POST | Perm: Create · Roles · Role | `RolesController.cs:60` |
| `roles` (update) | PUT | Perm: Update · Roles · Role | `RolesController.cs:71` |
| `roles/{id}` | DELETE | Perm: Delete · Roles · Role | `RolesController.cs:82` |
| `profile` (get) | GET | **No attribute**; requires logged-in user (401 otherwise) | `ProfileController.cs:16-21` |
| `profile` (update) | PUT | **No attribute**; requires logged-in user | `ProfileController.cs:29-34` |
| `profile/image-upload` | PUT | **No attribute**; requires logged-in user | `ProfileController.cs:42-47` |
| `profile/image-remove` | DELETE | **No attribute**; requires logged-in user | `ProfileController.cs:55-60` |
| `profile/change-password` | PUT | **No attribute**; requires logged-in user | `ProfileController.cs:68-73` |
| `profile/permissions` | GET | **No attribute**; requires logged-in user | `ProfileController.cs:81-86` |

> **Flag:** Several sensitive endpoints carry **no permission attribute** and rely solely on the global auth fallback — notably the two Admin **data-cleanup** operations and all three **invite** endpoints. Whether the global fallback requires authentication is configured outside these files. Unclear from code — the exact global authorization policy.

---

## Dependencies

- **ASP.NET Core Identity** — `UserManager`, `RoleManager`, `SignInManager` for all user/role/password operations (`UserService.cs:33-35`, `RoleService.cs:20-21`).
- **Data access** — mix of Identity/EF plus **raw SQL via `IDapperRepository`** for list queries, deletes, and brand/broker link inserts (e.g. `UserService.cs:180`, `UserService.CreateUpdate.cs:329`,`:507-530`).
- **MediatR** — the Admin module's operations (`GetBrandsOfUser`, `GetInvitedSubUsersForAdmin`, `RemoveUnassignedUsers`, pipeline & cleanup requests) are dispatched via `Mediator.Send` (`AdminController.cs:46`, `UsersController.cs:101`,`:284`).
- **Mail service** (`IMailService`) — verification, invitation, reset-password, and status-change emails (e.g. `UserService.CreateUpdate.cs:132`,`:190`, `UserService.cs:330`).
- **File storage** (`IFileStorageService`) — profile-image upload/removal (`UserService.CreateUpdate.cs:460-470`).
- **JWT / config** — `JwtSettings`, `SecuritySettings`, `AppUrls:BaseUrl` from configuration (`TokenService.cs:28-30`, `UserService.CreateUpdate.cs:125`).
- **Event publisher** (`IEventPublisher`) — raises created/updated/deleted events for users and roles, used elsewhere to invalidate the permission cache (`RoleService.cs:117`, `UserService.CreateUpdate.cs:436`; see `InvalidateUserPermissionCacheHandler.cs`).
- **Postgres multi-schema** — data lives across schemas `Identity`, `Brand`, etc., referenced by fully-qualified names in raw SQL (e.g. `"Identity"."Users"`, `"Brand"."Brands"`).
- **Azure AD (Microsoft.Identity.Web)** — used in the principal-based user creation path (`UserService.CreateUpdate.cs:21`,`:28-115`).

---

## Gaps, TODOs & Inconsistencies

1. **Master-password back door.** Login accepts a configured `SecuritySettings:MasterPassword` for *any* user, bypassing the real password check (`TokenService.cs:59-61`, `:85-87`). Confirm this is intended and how the value is protected.
2. **Store module is unfinished** — Domain project only, no Application/controller/endpoints; folder/namespace mismatch (`Store` vs `Stores`) (`Store.cs:3`).
3. **Invite & data-cleanup endpoints lack permission attributes** (`UsersController.cs:106`,`:116`,`:126`; `AdminController.cs:69`,`:79`) — they depend entirely on the (undocumented here) global auth fallback.
4. **`RemoveUnassignedUsersRequest` SQL looks invalid** — it uses `DELETE FROM … INNER JOIN …`, which Postgres does not support in that form; this delete may fail at runtime (`RemoveUnassignedUsersRequest.cs:30-39`). Its success message logic is also self-contradictory (the `usersCount > 1 ? … usersCount == 1 …` branch can never be true) (`:50-52`).
5. **Raw SQL string interpolation of IDs/filters** (e.g. user list search conditions, delete queries) is built by concatenating values directly into SQL rather than parameterising — a potential SQL-injection surface (`UserService.cs:362-425`, `UserService.CreateUpdate.cs:507-530`).
6. **`CreateAsync` (admin create-user) only maps BROKER/BRANDOWNER/UNASSIGNED** — passing a `RoleID` for any other role silently results in no role being added beyond those branches (`UserService.CreateUpdate.cs:270-276`).
7. **Profile phone update is disabled** — the Identity `SetPhoneNumberAsync` call is commented out; only the raw field is written (`UserService.CreateUpdate.cs:430-432`).
8. **Azure AD login has no controller endpoint in scope** — the principal-based create/update exists but its trigger is elsewhere; verify how external login is exposed. Unclear from code.
9. **Typos in user-facing messages** (e.g. "verfied", "Some went wrong", "User-Delte") that a BA may see surfaced in the UI (`UserService.Confirm.cs:15`,`:22`; `UserService.CreateUpdate.cs:539`).
