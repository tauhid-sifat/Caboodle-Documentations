---
module: broker-dashboard
jira: [CS-1072]
status: backlog
last_verified: 2026-10-14
related_wiki: ../../wiki/broker-dashboard.md
---

# Broker Dashboard | [BE] Update Landing Page to Match Brand Environments — Replace Dashboard with Broker Logo

**CS-1072** | [BE] Backend | User Story | Priority: High | Status: Backlog  
**Assignee:** Bijoy Chandra Nath | **Reporter:** Constance Wolfe

---

## User Story

**As a** Broker user,  
**I want** the Broker Dashboard landing page to match the Brand environment style and show the broker's logo in place of the plain dashboard,  
**So that** I get a branded home experience consistent with Brand dashboards.

---

## Description

**Backend-focused ticket.** Currently the brand dashboard (`(brand)/[brandID]/dashboard`) shows the brand's logo plus summary cards (Banner Count for Item Status, Trade Spend Roll Up). The broker dashboard (`(broker)/dashboard`) shows only a plain tile grid linking to broker tools, with no branding.

This ticket updates the broker **landing page** to match the Brand environment pattern: the dashboard surface should be replaced/branded with the **broker's logo** as the hero element, consistent with how Brand dashboards present the Brand logo. The implementation work is primarily backend — exposing/serving the broker's logo and branding metadata so the frontend can render it.

This pairs with **CS-1604** (add the broker logo to the dashboard *button/nav*) and **CS-1598** (dashboard shell from wireframe), which cover the frontend presentation of the logo. CS-1072 is the backend foundation (logo source, storage, and API).

---

## Acceptance Criteria

### Scenario 1: Broker Logo on Landing Page
- **Given** I am a Broker or Broker Sub-User logged into Caboodle
- **When** I land on the Broker Dashboard (`/dashboard`)
- **Then** the broker's logo is displayed prominently, matching the layout pattern used by Brand dashboards
- **And** the existing tile grid navigation remains accessible below the logo

### Scenario 2: Backend API for Broker Branding (BE)
- **Given** the broker dashboard loads
- **When** the page fetches broker branding data
- **Then** a backend endpoint returns the broker's logo URL and any associated branding metadata
- **And** the endpoint respects the broker's brand assignment context

### Scenario 3: Logo Source & Storage (BE)
- **Given** a broker has a logo configured
- **When** the backend is queried for broker branding
- **Then** the logo is served from the broker/user profile or the assigned brand's broker configuration (S3-backed URL)
- **And** updates to the logo are persisted and reflected on next load

### Scenario 4: No Brand / No Logo Assigned State
- **Given** a broker has no brands assigned, or no logo configured
- **When** they land on the Broker Dashboard
- **Then** they see the broker logo if available, otherwise a default/brand-neutral state
- **And** the existing "No brand is assigned to you" message is preserved

---

## Design Reference
- **Brand dashboard pattern:** `(brand)/[brandID]/dashboard` — brand logo + two summary cards ("Banner Count for Item Status" and "Trade Spend Roll Up")
- **Current broker dashboard:** `(broker)/dashboard` — tile grid only, no logo or branded hero
- **Wireframe:** `Wireframe/index.html` (dashboard shell with logo in header — see CS-1598)

---

## Related Tickets
- **CS-1604** — Broker Dashboard | Add Broker Logo to Dashboard Button (frontend logo placement)
- **CS-1598** — Broker Dashboard | Dashboard (from wireframe) — overall dashboard shell
- **CS-1362** — Broker Dashboard | Ask Caboodle (AI assistant for broker dashboard)
- **CS-1406** — Switching from Broker Dashboard to Brand Dashboard Sometimes Does Not Work

---

## CW Note 7/20/26 — Potential Obsolescence

Some of this ticket may become obsolete as the new dashboard mockups (Lovable wireframe / CS-1598) evolve. The broker landing page is being redesigned as part of CS-1305 (Broker Dashboard KPI Cards / Full Spec). Coordinate scope with those updates before implementation. Note the new BD/PM tickets (CS-1598, CS-1604) now own the frontend presentation; this CS-1072 ticket is scoped to the **backend** (logo source, storage, API).

---

## Notes
- The tile grid navigation should remain as secondary content below the branded hero — do not remove existing navigation.
- The broker's logo likely needs to be configurable via admin (broker profile/branding settings). If no logo is configured, fall back to a default/brand-neutral state.
- Brand dashboard gets its logo from brand data; the broker logo should similarly come from broker/user profile or the assigned brand's broker configuration.
- Originally opened Jul 2025; core requirement: make the broker landing page visually consistent with Brand dashboards by showing the broker logo.
