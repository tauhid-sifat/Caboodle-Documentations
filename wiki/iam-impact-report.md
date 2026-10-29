---
type: reference
title: IAM ticket impact report (37 tickets, 31 closable)
module: iam
status: current
last_verified: 2026-10-22
---

# IAM TICKET IMPACT REPORT

> **Source:** `data/IAM_Ticket_Impact_Report.xlsx` (local copy only, `data/` is gitignored; received 2026-10-22 as `IAM_Ticket_Impact_Report-1 (1) (1).xlsx`; workbook created 2026-10-15, last modified 2026-10-18). Credited to Ornov. Two tabs: **IAM Tickets** (37 tickets IAM covers) and **Closable** (31 tickets safe to close once frontend work is finished).  
> **Governing rules in the report:** a feature counts as done when the backend exists on `feature/CS-1770-iam-service-broker-workspace`; FE work is expected to follow and does not block closing. Ask Caboodle tickets were skipped in this triage. The old-plan `[Organization]` tickets count as done because IAM (CS-1770) replaces them.

## Verdict summary

| Verdict | Count | Action |
|---|---|---|
| Done by IAM | 26 | Close as done |
| Obsolete / no longer needed | 5 | Close as won't do / superseded |
| Skipped (Ask Caboodle) | 2 | No action |
| Needs discussion | 2 | Discuss |
| Partially done by IAM | 1 | Re-scope |
| Still open: IAM related | 1 | Discuss |
| **Total** | **37** | |

**Closable tab = 31** (26 done + 5 superseded). It excludes the 6 tickets that are skipped, undecided, partial, or still open. Every closable ticket says "Close when: Now (code on `feature/CS-1770-iam-service-broker-workspace`)"; CS-1622 says "Now".

## Tab 1: IAM Tickets

| Key | Summary | Module | Priority | Jira status | Verdict | Action |
|---|---|---|---|---|---|---|
| CS-1461 | [Organization] Introduce Organizations for brokerage customers | Organization | Highest | Backlog | Done by IAM | Close as done |
| CS-1368 | Admin \| Caboodle Admin needs to access all Environments w/o the need for their login credentials | Admin | High | Backlog | Done by IAM | Close as done |
| CS-1288 | Ask Caboodle \| Coordinate with ML/AI engineer > Implement Character Requirements for Billing | Ask Caboodle | High | Backlog | Skipped (Ask Caboodle) | No action |
| CS-1313 | Broker Brands \| Allow Brokers to Set Up Brand Environments w/o Brand Login | Broker | High | Backlog | Done by IAM | Close as done |
| CS-1325 | Improve Broker Invitation and Brand Environment Setup | Broker | High | Backlog | Done by IAM | Close as done |
| CS-1072 | [BE] Broker Dashboard> Update landing page to match Brand environments. Replace dashboard with Broker Logo | Broker Dashboard | High | Backlog | Done by IAM | Close as done |
| CS-1362 | Broker Dashboard \| Ask Caboodle | Broker Dashboard | High | Backlog | Skipped (Ask Caboodle) | No action |
| CS-1543 | Broker Dashboard - User-Level Data Isolation, Filter Persistence, and Task Roll-Up | Broker Dashboard | High | Backlog | Partially done by IAM | Re-scope |
| CS-1164 | [FE] 30 MB max size message for import | Other / Uncategorized | High | Backlog | Obsolete / no longer needed | Close as won't do / superseded |
| CS-1162 | [FE] Store Insight whole report delete by filter | Reports | High | Reopened | Needs discussion | Discuss |
| CS-1290 | ADMIN \| Invite Broker > The Email Said it was inviting user as Sub Broker instead of Broker | Admin | Medium | Backlog | Obsolete / no longer needed | Close as won't do / superseded |
| CS-1378 | User Managemnet \| Prevent Multiple Pending Invitations for the Same Brand Owner Role | Admin | Medium | Reopened | Done by IAM | Close as done |
| CS-1392 | User Management \| User Enrollment | Admin | Medium | Backlog | Done by IAM | Close as done |
| CS-1432 | User-Managemet: Replace Role-Specific Invite Email Templates with a Shared Template | Admin | Medium | In Progress | Done by IAM | Close as done |
| CS-1592 | Admin \| Single Trade Spend for Basic Subscription | Admin | Medium | Backlog | Needs discussion | Discuss |
| CS-1604 | Broker Dashboard \| Add Broker Logo to Dashboard Button | Broker Dashboard | Medium | Backlog | Done by IAM | Close as done |
| CS-1463 | [Organization] Shared file library for the Organization | Organization | Medium | Backlog | Done by IAM | Close as done |
| CS-1464 | [Organization] Category Review and Calendar | Organization | Medium | Backlog | Done by IAM | Close as done |
| CS-1465 | [Organization] Market Overview and Promotional Management | Organization | Medium | Backlog | Done by IAM | Close as done |
| CS-1466 | [Organization] Distributor APL | Organization | Medium | Backlog | Done by IAM | Close as done |
| CS-1467 | [Organization] Broker member management screens | Organization | Medium | Backlog | Done by IAM | Close as done |
| CS-1468 | [Organization] Trade Spend | Organization | Medium | Backlog | Done by IAM | Close as done |
| CS-1469 | [Organization] CRM | Organization | Medium | Backlog | Done by IAM | Close as done |
| CS-1470 | [Organization] Brand lists and navigation | Organization | Medium | Backlog | Done by IAM | Close as done |
| CS-1471 | [Organization] Admin screens | Organization | Medium | Backlog | Done by IAM | Close as done |
| CS-1472 | [Organization] Enforce Organization access everywhere | Organization | Medium | Backlog | Done by IAM | Close as done |
| CS-1473 | [Organization] Retire the old access model | Organization | Medium | Backlog | Done by IAM | Close as done |
| CS-1622 | Reports \| Brand Distributor Report \| Should User Be Able to Export the Data? | Reports | Medium | Backlog | Done by IAM | Close as done |
| CS-1376 | User Managemnet \| Show Proper Error Message for Cancelled Invitation Signup Attempt | Admin | Low | Backlog | Done by IAM | Close as done |
| CS-1396 | User Managemnet \| "View Brand Info" Label is Misleading as Users Can Also Add Brands | Admin | Low | Backlog | Obsolete / no longer needed | Close as won't do / superseded |
| CS-1397 | User Managemnet \| Brand Assignment Modal Flow is Confusing for Reassigning Brands | Admin | Low | Backlog | Obsolete / no longer needed | Close as won't do / superseded |
| CS-1398 | User Managemnet \| No Role Removal Option Available in "Assign Role" Modal for Already Assigned Users | Admin | Low | In Progress | Obsolete / no longer needed | Close as won't do / superseded |
| CS-1560 | User Invitation \| Handle invalid invitation states on Accept Invitation flow | Admin | Low | In Review | Done by IAM | Close as done |
| CS-245 | [BE] Admin - Activity Log | Admin | Low | Backlog | Done by IAM | Close as done |
| CS-246 | [FE] Admin - Activity Log | Admin | Low | Backlog | Done by IAM | Close as done |
| CS-1059 | crm module - delete option missing in all modules except banner | CRM | Low | Backlog | Done by IAM | Close as done |
| CS-701 | Share link of pages like in google and restrict it to view only | Other / Uncategorized | Low | Backlog | Still open: IAM related | Discuss |

## Tab 2: Closable (31)

CS-1461, CS-1368, CS-1313, CS-1325, CS-1072, CS-1164, CS-1290, CS-1378, CS-1392, CS-1432, CS-1604, CS-1463, CS-1464, CS-1465, CS-1466, CS-1467, CS-1468, CS-1469, CS-1470, CS-1471, CS-1472, CS-1473, CS-1622, CS-1376, CS-1396, CS-1397, CS-1398, CS-1560, CS-245, CS-246, CS-1059.

## Not closable yet (6)

| Key | Verdict | Why it stays open |
|---|---|---|
| CS-1162 | Discuss | Business says users should not delete data; IAM still allows Delete to anyone granted that action (Platform Admins always have it). Decide: Platform Admin only, or rely on Custom grants. |
| CS-1592 | Discuss | No subscription/tier model exists; N and counting scope undefined; no quota usage view. Decide per-organization cap (`max-promotions-per-brand`) vs tier model, then define N. |
| CS-701 | Discuss | No page-level view-only share link. Needs scope (pages, expiry, revocation) and a new anonymous, scoped read model. Only File Repository share links exist. |
| CS-1543 | Re-scope | Only scenario 2 (user-level isolation) is delivered. Scenario 1 (server-side saved filter defaults) and scenario 3 (task roll-up endpoint) have no backend. Remove scenario 2 from the ticket, keep 1 and 3. |
| CS-1288 | Skipped | Ask Caboodle billing character rules undefined; module-settings chunk 06 deferred (D12). |
| CS-1362 | Skipped | Dashboard bar is FE; the separate rebuild route `POST /askcaboodle/ask` still needs a module rule. |

CS-1543 is the only "partial": isolation is per brokerage, not per user, and admin-configurable visibility scopes (for example seeing all members' tasks) are not built.

## Caveats the report marks as not blocking close

- **FE backlog is large:** 40 web and 21 admin required items are outstanding. Closing a ticket does not mean the screen exists.
- **CS-1473:** nothing is removed. No legacy-removal branch exists; cleanup SQL 5.4a-f is not started, and dev preconditions fail (1 unmigrated legacy invite, 85 unlabelled MarketOverviews, 5 unexpired verification links).
- **CS-1472:** 4 promo-rule actions remain bare, `BrandValidationMiddleware` is still in the pipeline (`Startup.cs:93`), and the rollback rehearsal was not done.
- **CS-1461:** the epic AC "cannot invite an email outside approved domains" is not built; `CreateInvitationRequest` has no domain check (domains apply only to join requests, per CS-1770).
- **CS-1469:** the 4 retailer promo-rule writes (banners / promorules upsert, delete, import, export) are still bare; any signed-in user can write the global table and DELETE truncates it. The bare-endpoints baseline says it must be empty before launch.
- **Copy and config:** final invite template copy (14/15) is open; the 7-day invitation expiry needs product confirmation.
- **CS-1368 / admin support access:** admin organization switcher is FE; an optional "all brands" helper is an open owner decision.

## Roadmap sync (2026-10-22)

- `Jira Roadmap V2.xlsx` (Downloads) comments were refreshed from this report: all 37 keys updated, 38 rows because CS-1461 appears twice.
- Comment convention: `IAM: done - close as done`, `IAM: obsolete - close as won't do`, `IAM: skipped (Ask Caboodle) - no action`, `IAM: needs discussion - <decision>`, `IAM: re-scope - <remaining>`, `IAM: still open - <missing>`.
- No other rows or columns were touched. A pre-change copy is kept beside the workbook as `Jira Roadmap V2.backup-2026-10-22.xlsx`.
- 2026-10-27: the 37 IAM rows (38 rows, CS-1461 twice) were deleted from a re-downloaded copy, `Jira Roadmap V2 (1).xlsx`. 171 data rows remain; backup is `Jira Roadmap V2 (1).backup-2026-10-27.xlsx`.

## Artifact gaps

- The report cites a third tab, **"Still Open IAM Work"**, with NO TICKET rows. That tab is not in this file.
- Comments refer to duplicate rows at sheet rows 135 and 136 of the original workbook. The supplied file contains only the filtered 37 and 31 rows, so those duplicates are not visible here.

> Per-ticket evidence (commit hashes, doc sections, code paths) lives in the source workbook, columns "Evidence" and "What is still missing".


---

> Code-verified detail for the modules behind these pages: `wiki/modules/` (2.1-2.15) and `wiki/traceability-matrix.md`. Source of truth: `docs/feature-context.md`.
