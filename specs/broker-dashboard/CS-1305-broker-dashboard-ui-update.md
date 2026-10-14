---
module: broker-dashboard
jira: [CS-1305]
status: backlog
last_verified: 2026-10-14
related_wiki: ../../wiki/broker-dashboard.md
---

# Broker Dashboard | Update UI to Match the Rest of the Platform

**CS-1305** | User Story | Priority: High | Status: Backlog  
**Assignee:** Md Mashiul Azam Chowdhury Efti | **Reporter:** Constance Wolfe

---

## User Story

**As a** Broker user,  
**I want** the Broker Dashboard's visual design, components, and layout to be consistent with the rest of the Caboodle platform,  
**So that** the experience feels cohesive and polished across brand and broker environments.

---

## Description

The Broker Dashboard was built with a different visual style than the rest of the platform. While brand-facing pages use consistent design patterns, the broker dashboard has its own tile-grid landing, non-standard component styling, and several unfinished UI elements (commented-out tiles, leftover debug logging). This ticket brings the broker dashboard UI in line with the platform's established design system.

---

## Acceptance Criteria

### Scenario 1: Consistent Visual Design
- **Given** I am a Broker user navigating the Broker Dashboard
- **Then** all broker screens use the same component library, spacing, typography, and color tokens as the brand-facing pages
- **And** buttons, cards, tables, modals, form inputs, and navigation elements match the platform-wide design

### Scenario 2: Dashboard Tile Grid Polish
- **Given** I land on the Broker Dashboard home screen
- **Then** the tile grid uses the same card styling, hover states, and iconography as equivalent navigation elements in the brand environment
- **And** commented-out or hidden tiles ("Market Overview Report", "Users") are either implemented or cleanly removed from the code (no dead tiles)

### Scenario 3: Consistent Form Validation
- **Given** I interact with forms on broker pages
- **Then** validation patterns match the rest of the platform (e.g., email format validation on login, consistent error message styling, same required-field indicators)

### Scenario 4: Clean Production Code
- **Given** the Broker Dashboard is deployed to production
- **Then** there are no debug `console.log` statements in production code paths
- **And** there are no commented-out feature blocks, dead routes, or placeholder components

---

## Known Inconsistencies to Address
- Login email field missing format validation (signup/forgot-password have it)
- No client-side password-strength validation
- Debug `console.log` statements in production code paths (`(auth)/layout.tsx:28`, `AppContainer.tsx:21`, `promotional-management/page.tsx:108,222`)
- Commented-out dashboard tiles (Market Overview Report at `dashboard/page.tsx:22`, Users at `dashboard/page.tsx:46`)
- AI message route is a hardcoded stub (`api/ai-message/route.ts`)
- Role store defaults to `BRANDOWNER` before the real role loads (`roleStore.ts:11`)

---

## Out of Scope
- Adding new features or screens to the broker dashboard (covered by other tickets)
- Backend permission/authorization changes
- Broker logo on landing page (covered by CS-1072)

---

## Related Tickets
- **CS-1072** — Broker Dashboard Update Landing Page to Match Brand Environments (logo/branding)
- **CS-1406** — Switching from Broker Dashboard to Brand Dashboard Sometimes Does Not Work

---

## Notes
- Reference the existing brand-facing pages for the target design patterns (`(brand)/[brandID]/` routes).
- Right-to-left work: audit each broker page for UI drift and fix per the platform design system.
