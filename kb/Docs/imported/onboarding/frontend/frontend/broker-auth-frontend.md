---
type: Document
title: "Broker \u0026 Authentication Frontend"
---

# Broker & Authentication Frontend

This document describes, in plain business terms, two parts of the Caboodle web application:

1. The **Broker area** — the set of screens a broker sees (as opposed to the brand-owner screens).
2. The **Authentication flows** — how a person signs up, verifies their email, signs in, and recovers a forgotten password.

All file references use paths relative to the frontend project root (`src/...`) and cite `path:line` so an engineer can find the exact code. Where the code does not make something clear, that is called out explicitly.

---

## Broker Area — Roles Served

The application recognises **four** user roles (`src/enums/index.ts:202`):

| Role | Meaning (business term) |
|------|--------------------------|
| `BROKER` | A brokerage account that works across many brands |
| `BROKERSUBUSER` | A team member under a broker account |
| `BRANDOWNER` | The owner of a single brand |
| `BRANDSUBUSER` | A team member under a brand owner |

**How the app decides "broker vs brand":** There is no hard security guard on the broker routes themselves. The `(broker)` layout only checks that the user is logged in (`serverSessionCheck`) and then renders the shell (`src/app/(broker)/layout.tsx:7`). The actual role comes back from the server when the app loads the user's brand list (`useGetAllBrandsForBroker`, which exposes `brandsData.role`). Throughout the UI the rule used is:

> "If the role is **NOT** `BRANDOWNER` and **NOT** `BRANDSUBUSER`, treat the user as a broker."

You can see this exact test in `src/components/WorkspaceContainer.tsx:128` and `:167` (show the broker/brand workspace switcher) and in `src/components/DashboardComponent.tsx:50` (only show the broker dashboard tiles for non-brand roles).

So the `(broker)` group effectively serves **`BROKER` and `BROKERSUBUSER`** — anyone whose role is not one of the two brand roles. The role is derived by exclusion rather than by explicitly listing the two broker roles.

Note: the default role stored on the client before the server responds is `BRANDOWNER` (`src/store/roleStore.ts:11`), persisted in browser storage under the key `cb-cmp-store-userRole`. This is only a placeholder until the real role is loaded.

**Unclear from code — role enforcement on the server:** The frontend does not block a brand user from typing a broker URL directly; role-based hiding happens only in the UI. Whether the backend rejects such requests is not visible in the frontend code.

---

## Broker Screen Inventory

The broker landing screen is a grid of tiles defined in `src/app/(broker)/dashboard/page.tsx:14`. Each tile links to one of the screens below. (Two tiles — "Market Overview Report" and "Users" — are currently commented out and not shown.)

| Route | Purpose (one line) |
|-------|--------------------|
| `/dashboard` (`src/app/(broker)/dashboard/page.tsx`) | Broker home screen — a tile menu linking to the broker tools; shows "No brand is assigned to you" if the broker has no brands. |
| `/market-overview` (`src/app/(broker)/market-overview/page.tsx`) | A market-overview table giving the broker a cross-brand view of the market. |
| `/market-overview-report` (`src/app/(broker)/market-overview-report/page.tsx`) | A report version of the market overview. Reachable by URL, but its dashboard tile is currently commented out (`dashboard/page.tsx:22`). |
| `/promotional-management` (`src/app/(broker)/promotional-management/page.tsx`) | A year-long grid of promotional events by brand / distributor / banner / category; lets the broker open event details, export promo events (CSV), filter, and submit/revoke promotions for approval. |
| `/category-review` (`src/app/(broker)/category-review/page.tsx`) | A category overview table for reviewing product categories across the market. |
| `/distributor-apl` (`src/app/(broker)/distributor-apl/page.tsx`) | The Distributor APL (Approved Product List) table. |
| `/file-repository` (`src/app/(broker)/file-repository/page.tsx`) | A drag-and-drop file explorer/repository for shared documents (private files, `privacyType = 1`). |

All broker screens are wrapped by the shared app shell (header + sidebar) via `AppContainer` in `src/app/(broker)/layout.tsx:9`.

---

## Authentication Flows

All auth screens live under `src/app/(auth)/` and share a common visual layout (`src/app/(auth)/layout.tsx`). That layout also acts as a redirect gate: **if a logged-in user lands on any auth page, they are pushed to `/dashboard`** (`src/app/(auth)/layout.tsx:20-27`). The one exception is when the URL carries a `code` query parameter (an email link) — in that case the already-logged-in user is logged out first so the link can be re-followed cleanly (`:21-24`).

Each page file is a thin wrapper that renders the real form component from `src/components/Auth/` inside a React `Suspense` boundary.

### Sign Up

- **Screen:** `src/app/(auth)/signup/page.tsx` → form in `src/components/Auth/SignUpForm.tsx`.
- **What the user does:** enters First Name, Last Name, Email, Password, Confirm Password, and must tick the terms-and-conditions checkbox before the "Sign Up" button becomes enabled (`SignUpForm.tsx:139`, `:151`).
- **Client-side validation:**
  - First name required (`:89`), last name required (`:95`).
  - Email required **and** must be a valid email format (`:109-112`).
  - Password required (`:120`).
  - Confirm Password required and must match the password field (`:127-135`).
- **Invitation handling:** if the URL has `email` and `code` parameters (an invite link), the email field is pre-filled and locked, and the signup is flagged as invited (`hasInvited`) with the verification code attached (`:29-39`, `:113-115`).
- **What happens on submit:** calls `AuthService.signup` → `POST /api/v1/registration` (`src/service/auth.service.ts:9`). Based on the response:
  - Email already confirmed **and** active → success message, redirect to `/login` (`:49-51`).
  - Email confirmed but not active → shows an "activate your account" message (`ActivateAccountMessage`) (`:53`).
  - Email not confirmed → shows the "email sent" screen prompting the user to check their inbox (`:56`).

### Email Verification

- **Screen:** `src/app/(auth)/verify-email/page.tsx` → `src/components/Auth/VerifyEmail.tsx`.
- **What the user does:** nothing — they arrive here by clicking the verification link in their email, which carries `code` and `email` query parameters.
- **What happens:** on load, the component automatically calls `AuthService.verifyEmail` → `POST /api/v1/users/verify-email` (`VerifyEmail.tsx:27`, `auth.service.ts:17`). While waiting it shows "Verifying Email..." with a spinner.
  - Success → a green tick and a "Go to Login" button (`VerifyEmail.tsx:100-117`).
  - Failure → shows the server error messages plus a "Resend Verification Link" button (`:66-88`), which calls `AuthService.resendEmailVerification` → `POST /api/v1/users/resend-email-verification` (`auth.service.ts:25`).

### Login

- **Screen:** `src/app/(auth)/login/page.tsx` → `src/components/Auth/LoginForm.tsx`.
- **What the user does:** enters Email and Password and clicks "Sign In". A "Forgot password?" link and a "Sign Up" link are also present.
- **Client-side validation:** Email required and Password required only — **no email-format check on the login screen** (`LoginForm.tsx:95`, `:106`). (Contrast with signup/forgot-password, which do validate email format.)
- **How the session is established:** login uses **NextAuth's credentials sign-in** (`signIn("credentials", …)`, `LoginForm.tsx:28`) with `redirect: false` so the app controls navigation. A fixed `tenantId: "root"` is sent (`:31`).
  - On success it clears the persisted brand/role client state and navigates to `/dashboard` (`:36-41`).
  - On failure, if the error is an "Email" (unverified email) error, the app automatically re-sends the verification email and shows the "email sent" screen (`:45-57`); any other error shows an error notification (`:59`).

### Forgot Password & Reset Password

Two-step flow:

1. **Request a reset** — `src/app/(auth)/forgot-password/page.tsx` → `src/components/Auth/ForgotPassword.tsx`.
   - User enters their email. Validation: required **and** valid email format (`ForgotPassword.tsx:51-54`).
   - On submit calls `AuthService.requestResetPassword` → `POST /api/v1/users/forgot-password` (`auth.service.ts:33`), then shows the "email sent" screen (`ForgotPassword.tsx:22-23`).

2. **Set a new password** — `src/app/(auth)/reset-password/page.tsx` → `src/components/Auth/ResetPassword.tsx`.
   - User arrives via the emailed link, which carries `code` (token) and `email` query parameters (`ResetPassword.tsx:18-19`).
   - Fields: New Password (required) and Confirm Password (required and must match) (`:58-81`).
   - On submit calls `AuthService.resetPassword` → `POST /api/v1/users/reset-password` (`auth.service.ts:41`), shows a success notice, and redirects to `/login` (`ResetPassword.tsx:32-39`).

---

## Role-Based Routing After Login

After a successful login the app **always navigates to `/dashboard`** first (`LoginForm.tsx:40`). It does **not** branch on role at that moment. The split between brand and broker experiences happens afterwards, driven by the brand list / role that comes back from `useGetAllBrandsForBroker`:

- The routing decision lives in `WorkspaceContainer.tsx` (the brand/broker switcher shown in the header). Once the brand data loads:
  - **Brand users** (`BRANDOWNER` or `BRANDSUBUSER`) with at least one brand are **redirected into that brand's workspace**: `router.replace('/{firstBrandId}/dashboard')` (`WorkspaceContainer.tsx:53-64`). If a brand user has no brands, they are sent to `/dashboard`.
  - **Broker users** (any other role) stay on the broker `/dashboard` and see the broker tile menu. The switcher then shows both a "BROKER WORKSPACE" entry and a searchable "BRAND WORKSPACE" list so the broker can drill into any assigned brand (`:127-223`).
- If the URL already contains a `brandID` that is not in the user's brand list, the user is bounced back to `/dashboard` (`:66-73`).

In short: **there is a single `/dashboard` entry point; brand users are automatically forwarded into their brand, while brokers remain on the shared broker dashboard.** The determining value is `brandsData.role`, not anything stored at login time.

**Note on the two `/dashboard` routes:** the URL `/dashboard` resolves to the broker dashboard (`src/app/(broker)/dashboard/page.tsx`), while brand dashboards live at `/{brandID}/dashboard` (`src/app/(brand)/[brandID]/dashboard/page.tsx`). This is why brand users get redirected to a brand-scoped URL and brokers do not.

---

## AI Message API Route

- **File:** `src/app/api/ai-message/route.ts` — a `POST /api/ai-message` handler.
- **What it does today:** it is an explicitly labelled **placeholder / mock**, not a real AI integration (`route.ts:5-16`). It receives the chat message history plus the current visualization state, inspects the last user message for keywords, and returns a canned reply plus (optionally) a modified visualization object:
  - "hello"/"hi" → greeting.
  - "add … chart" → appends a sample bar chart (`:39-67`).
  - "add … table" → appends a sample table (`:68-90`).
  - "remove"/"delete" → drops the last chart or table (`:91-108`).
  - "clear"/"reset" → empties the visualization (`:109-115`).
  - anything else → echoes the message back with a note that a real AI would handle it (`:116-124`).
- **What it proxies:** **nothing yet.** It does not call any external AI provider. The code comments state that in production it "would" connect to an AI service (OpenAI, Anthropic, etc.) and parse visualization changes (`:8-15`, `:120-123`). Returns HTTP 400 if no messages are supplied and 500 on errors.

---

## Client-Side Validation & Frontend-Only Enforcement

| Field / rule | Where | Notes |
|--------------|-------|-------|
| Email format | Signup (`SignUpForm.tsx:111`), Forgot Password (`ForgotPassword.tsx:53`) | Enforced on signup and forgot-password. |
| Email format on **Login** | `LoginForm.tsx:95` | **Not enforced** — login only checks the field is non-empty. Inconsistent with the other screens. |
| Password match | Signup (`SignUpForm.tsx:130`), Reset (`ResetPassword.tsx:73`) | "Confirm Password" must equal "Password". |
| **Password strength / complexity** | — | **No client-side rules anywhere** — password fields only require "not empty" (`SignUpForm.tsx:120`, `ResetPassword.tsx:61`). No minimum length, character mix, etc. on the frontend. Any such rule would be backend-only. |
| Terms & conditions | `SignUpForm.tsx:139-151` | Frontend-only gate — the Sign Up button is disabled until the checkbox is ticked. |
| Logged-in redirect away from auth pages | `(auth)/layout.tsx:20-27` | Frontend-only convenience redirect, not a security control. |
| Broker vs brand screen visibility | `WorkspaceContainer.tsx:128,167`, `DashboardComponent.tsx:50` | Frontend-only role gating (hide/redirect). See the "role enforcement" gap below. |

---

## Gaps, TODOs & Inconsistencies

1. **AI route is a stub.** `src/app/api/ai-message/route.ts` returns hardcoded responses and connects to no AI provider. Marked "placeholder" in its own comments.
2. **No password-strength validation on the frontend.** Both signup and reset accept any non-empty password (`SignUpForm.tsx:120`, `ResetPassword.tsx:61`). If a complexity policy exists, it is enforced only by the backend, so users may see a server error instead of inline guidance.
3. **Login email field is not format-validated**, while signup and forgot-password are (`LoginForm.tsx:95` vs `SignUpForm.tsx:111`). Minor inconsistency.
4. **Broker role is defined by exclusion, not inclusion.** The code checks "not a brand role" rather than "is `BROKER`/`BROKERSUBUSER`" (`WorkspaceContainer.tsx:128`, `DashboardComponent.tsx:50`). Any future role would default into the broker experience.
5. **No role guard on broker routes.** `(broker)/layout.tsx` only verifies a session exists; it does not verify the user is a broker. Screen hiding is UI-only. **Unclear from code — whether the backend enforces role on these endpoints.**
6. **Placeholder default role.** `roleStore` initialises `userRole` to `BRANDOWNER` (`src/store/roleStore.ts:11`) before the real role loads; transient UI could briefly assume the wrong role.
7. **Hardcoded tenant.** Login always sends `tenantId: "root"` (`LoginForm.tsx:31`); multi-tenant selection is not exposed in the UI. **Unclear from code — whether other tenants are supported.**
8. **Commented-out dashboard tiles.** "Market Overview Report" and "Users" tiles are disabled in `dashboard/page.tsx:22` and `:46`, though the market-overview-report route still exists.
9. **Leftover `console.log` statements** in production code paths (e.g. `(auth)/layout.tsx:28`, `AppContainer.tsx:21`, `promotional-management/page.tsx:108,222`).
