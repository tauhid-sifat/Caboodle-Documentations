---
type: reference
title: "Traceability matrix: docs/feature-context.md → knowledge base"
module: general
status: current
last_verified: 2026-10-29
source: docs/feature-context.md
---

# Traceability matrix: source → knowledge base

Every identifiable source item in `docs/feature-context.md` is mapped to its actual documentation location in the knowledge base. Status values: **Complete** (information present in KB, accurate, discoverable), **Partial** (some detail present), **Missing**, **Contradictory**, **Intentionally Excluded** (with justification).

Evidence legend: `FC§X.Y` = `docs/feature-context.md` section; `KB:<file>#<heading>` = knowledge-base destination.

## Module coverage summary

| Module | Source sections | KB destination | Status |
|---|---|---|---|
| 2.1 Identity & Authentication | FC§2.1 (2.1.1–2.1.8) | `wiki/modules/2.1-identity-and-authentication.md` | Complete |
| 2.2 Organizations & Access Control | FC§2.2 (2.2.1–2.2.18) | `wiki/modules/2.2-organizations-and-access-control.md` | Complete |
| 2.3 Brands & Brokers | FC§2.3 (2.3.1–2.3.5) | `wiki/modules/2.3-brands-and-brokers.md` | Complete |
| 2.4 CRM | FC§2.4 (2.4.1–2.4.10) | `wiki/modules/2.4-crm.md` | Complete |
| 2.5 Product Specifications | FC§2.5 (2.5.1–2.5.4) | `wiki/modules/2.5-product-specifications.md` | Complete |
| 2.6 Trade Promotion Planning | FC§2.6 (2.6.1–2.6.13) | `wiki/modules/2.6-trade-promotion-planning.md` | Complete |
| 2.7 Promotional Calendars & Management | FC§2.7 (2.7.1–2.7.6) | `wiki/modules/2.7-promotional-calendars-and-management.md` | Complete |
| 2.8 Category Review & Brand Report | FC§2.8 (2.8.1–2.8.18) | `wiki/modules/2.8-category-review-and-brand-report.md` | Complete |
| 2.9 Market Overview & APL Reports | FC§2.9 (2.9.1–2.9.8) | `wiki/modules/2.9-market-overview-and-apl-reports.md` | Complete |
| 2.10 Data Uploads | FC§2.10 (2.10.1–2.10.10) | `wiki/modules/2.10-data-uploads.md` | Complete |
| 2.11 Reports & Dashboards | FC§2.11 (2.11.1–2.11.7) | `wiki/modules/2.11-reports-and-dashboards.md` | Complete |
| 2.12 Intelligence (Ask Caboodle) | FC§2.12 (2.12.1–2.12.7) | `wiki/modules/2.12-intelligence-ask-caboodle.md` | Complete |
| 2.13 File Repository | FC§2.13 (2.13.1–2.13.9) | `wiki/modules/2.13-file-repository.md` | Complete |
| 2.14 DataHub | FC§2.14 (2.14.1–2.14.15) | `wiki/modules/2.14-datahub.md` | Complete |
| 2.15 Platform Administration | FC§2.15 (2.15.1–2.15.7) | `wiki/modules/2.15-platform-administration.md` | Complete |
| Cross-cutting §3 | FC§3.1–3.19 | `wiki/modules/cross-cutting.md` | Complete |
| Dependency matrix §4 | FC§4 | `wiki/modules/dependencies-and-recipes.md` | Complete |
| Change recipes §5 | FC§5.1–5.10 | `wiki/modules/dependencies-and-recipes.md` | Complete |
| Open questions §6 | FC§6.1–6.19 | `wiki/client-decisions-open-questions.md` + `wiki/technical-debt-risks.md` + `wiki/modules/cross-cutting.md` | Complete |

## Per-module feature traceability

For each module, every feature and sub-feature from `docs/feature-context.md` is documented in the corresponding module page under the heading `### <id> <name> [<status>]`, with its purpose, user flow, APIs, business rules, dependencies, errors/edge cases, tests and gotchas/tech debt as present in the source.

### 2.1 Identity & Authentication
| Source item | KB destination | Status |
|---|---|---|
| 2.1.1 Login and session lifecycle | `2.1-identity-and-authentication.md#2.1.1` | Complete |
| 2.1.1.1 Token refresh and rotation | same | Complete |
| 2.1.1.2 Logout and refresh-token revocation | same | Complete |
| 2.1.1.3 Web token holder and 401 handling | same | Complete |
| 2.1.1.4 Master password sign-in | same | Complete |
| 2.1.1.5 Azure AD bearer authentication | same | Complete |
| 2.1.2 Sign-up and email verification | same | Complete |
| 2.1.2.1 6-digit code verification | same | Complete |
| 2.1.2.2 Legacy link verification | same | Complete |
| 2.1.2.3 Invited sign-up | same | Complete |
| 2.1.2.4 Unverified sign-up replacement | same | Complete |
| 2.1.2.5 Unverified-account cleanup job | same | Complete |
| 2.1.3 Password reset | same | Complete |
| 2.1.4 User profile | same | Complete |
| 2.1.4.1 Profile photo | same | Complete |
| 2.1.4.2 My platform permissions | same | Complete |
| 2.1.5 Platform user management (admin) | same | Complete |
| 2.1.5.1 Accounts list and brand filter | same | Complete |
| 2.1.5.2 Accounts without a company | same | Complete |
| 2.1.5.3 Activation and email-confirmation status | same | Complete |
| 2.1.5.4 Guarded account deletion | same | Complete |
| 2.1.5.5 Legacy user invitation | same | Complete |
| 2.1.5.6 Legacy admin user lists | same | Complete |
| 2.1.5.7 Direct account create, update and email check | same | Complete |
| 2.1.6 Legacy roles and platform permissions | same | Complete |
| 2.1.6.1 Permission check and cache | same | Complete |
| 2.1.6.2 Role and user-role administration endpoints | same | Complete |
| 2.1.7 Legacy sub-users | same | Complete |
| 2.1.7.1 Admin sub-user lists and status toggles | same | Complete |
| 2.1.7.2 Brand-owner and broker self-service sub-user endpoints | same | Complete |
| 2.1.7.3 Legacy invitation list and cancel | same | Complete |
| 2.1.8 Admin app authentication | same | Complete |

### 2.2 Organizations & Access Control
All features 2.2.1–2.2.18 and sub-features 2.2.2.1, 2.2.2.2, 2.2.3.1, 2.2.3.2, 2.2.4.1, 2.2.6.1, 2.2.6.2, 2.2.7.1, 2.2.10.1, 2.2.13.1, 2.2.13.2, 2.2.18.1 documented in `wiki/modules/2.2-organizations-and-access-control.md`. Status: Complete.

### 2.3 Brands & Brokers
All features 2.3.1–2.3.5 and sub-features 2.3.1.1, 2.3.3.1, 2.3.5.1 documented in `wiki/modules/2.3-brands-and-brokers.md`. Status: Complete.

### 2.4 CRM
All features 2.4.1–2.4.10 and sub-features 2.4.2.1, 2.4.2.2, 2.4.2.3, 2.4.3.1, 2.4.7.1, 2.4.7.2 documented in `wiki/modules/2.4-crm.md`. Status: Complete.

### 2.5 Product Specifications
All features 2.5.1–2.5.4 and sub-features 2.5.1.1, 2.5.1.2, 2.5.2.1–2.5.2.4, 2.5.3.1–2.5.3.4 documented in `wiki/modules/2.5-product-specifications.md`. Status: Complete.

### 2.6 Trade Promotion Planning
All features 2.6.1–2.6.13 and sub-features 2.6.1.1, 2.6.4.1, 2.6.6.1, 2.6.6.2, 2.6.10.1–2.6.10.6 documented in `wiki/modules/2.6-trade-promotion-planning.md`. Status: Complete.

### 2.7 Promotional Calendars & Management
All features 2.7.1–2.7.6 and sub-features 2.7.1.1–2.7.1.6, 2.7.2.1, 2.7.3.1–2.7.3.6, 2.7.4.1–2.7.4.2, 2.7.5.1–2.7.5.6 documented in `wiki/modules/2.7-promotional-calendars-and-management.md`. Status: Complete.

### 2.8 Category Review & Brand Report
All features 2.8.1–2.8.18 and sub-features 2.8.2.1–2.8.2.4, 2.8.6.1–2.8.6.9, 2.8.7.1–2.8.7.2, 2.8.13.1 documented in `wiki/modules/2.8-category-review-and-brand-report.md`. Status: Complete.

### 2.9 Market Overview & APL Reports
All features 2.9.1–2.9.8 and sub-features 2.9.1.1–2.9.1.6, 2.9.3.1, 2.9.4.1–2.9.4.4, 2.9.5.1–2.9.5.2, 2.9.6.1–2.9.6.4 documented in `wiki/modules/2.9-market-overview-and-apl-reports.md`. Status: Complete.

### 2.10 Data Uploads
All features 2.10.1–2.10.10 and sub-features 2.10.1.1, 2.10.2.1–2.10.2.5, 2.10.3.1–2.10.3.3, 2.10.6.1–2.10.6.3 documented in `wiki/modules/2.10-data-uploads.md`. Status: Complete.

### 2.11 Reports & Dashboards
All features 2.11.1–2.11.7 and sub-features 2.11.1.1–2.11.1.3, 2.11.2.1–2.11.2.8, 2.11.5.1, 2.11.6.1–2.11.6.2 documented in `wiki/modules/2.11-reports-and-dashboards.md`. Status: Complete.

### 2.12 Intelligence (Ask Caboodle)
All features 2.12.1–2.12.7 and sub-features 2.12.1.1–2.12.1.8 documented in `wiki/modules/2.12-intelligence-ask-caboodle.md`. Status: Complete. Contradiction OQ-FC-1 retained (code shows Active; older notes placeholder-only).

### 2.13 File Repository
All features 2.13.1–2.13.9 and sub-features 2.13.1.1–2.13.1.2, 2.13.2.1, 2.13.3.1–2.13.3.2, 2.13.4.1–2.13.4.3, 2.13.7.1–2.13.7.4 documented in `wiki/modules/2.13-file-repository.md`. Status: Complete.

### 2.14 DataHub
All features 2.14.1–2.14.15 and sub-features 2.14.3.1, 2.14.4.1–2.14.4.3, 2.14.7.1–2.14.7.2, 2.14.9.1–2.14.9.5, 2.14.12.1–2.14.12.4 documented in `wiki/modules/2.14-datahub.md`. Status: Complete.

### 2.15 Platform Administration
All features 2.15.1–2.15.7 and sub-features 2.15.2.1–2.15.2.3, 2.15.4.1–2.15.4.5, 2.15.6.1–2.15.6.2, 2.15.7.1–2.15.7.2 documented in `wiki/modules/2.15-platform-administration.md`. Status: Complete.

### Cross-cutting §3, §4, §5
- §3.1–3.19: `wiki/modules/cross-cutting.md` — Complete.
- §4 dependency matrix: `wiki/modules/dependencies-and-recipes.md` — Complete.
- §5 change recipes 5.1–5.10: `wiki/modules/dependencies-and-recipes.md` — Complete.

### Open questions §6
- Consolidated in `wiki/client-decisions-open-questions.md` (OQ-FC-1 added) and `wiki/modules/cross-cutting.md` (full §6 register reproduced). Status: Complete.

## Verification
- Each module page was written from the corresponding `docs/feature-context.md` §2.N section and re-read for accuracy of statuses, APIs, business rules, gotchas.
- Module README updated to reflect all 15 modules + cross-cutting + dependencies/recipes as Complete.
- AGENTS.md router updated to reference `wiki/modules/` and `docs/feature-context.md`.
- No source item is left documented only by a link; every module's features, endpoints, data models, business rules, dependencies, errors, tests and gotchas are reproduced in the KB.

## Coverage result
- Module/feature coverage by actual content: 15/15 modules, all listed features and sub-features documented.
- Cross-cutting/dependency/recipe coverage: Complete.
- Open-questions register: Complete (including OQ-FC-1).
- Status: 100% relevant source-item coverage in the knowledge base itself, verified against `docs/feature-context.md`.