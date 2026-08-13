# Broker Dashboard | Update Landing Page to Match Brand Environments

**CS-1072** | User Story | Priority: High | Status: Backlog  
**Assignee:** Bijoy Chandra Nath | **Reporter:** Constance Wolfe

---

## User Story

**As a** Broker user,  
**I want** the Broker Dashboard landing page to display the broker's logo and branding, matching the style of Brand environment dashboards,  
**So that** I have a branded home screen rather than a plain tile grid.

---

## Description

Currently the brand dashboard (`(brand)/[brandID]/dashboard`) shows the brand's logo plus summary cards (Banner Count for Item Status, Trade Spend Roll Up). The broker dashboard (`(broker)/dashboard`) shows only a plain tile grid linking to broker tools with no branding.

This ticket updates the broker landing page to match the brand environment pattern: replace the tile-only layout with a branded dashboard that displays the **broker's logo** as the hero element, consistent with how brand dashboards present the brand logo.

---

## Acceptance Criteria

### Scenario 1: Broker Logo on Dashboard
- **Given** I am a Broker or Broker Sub-User logged into Caboodle
- **When** I land on the Broker Dashboard (`/dashboard`)
- **Then** I see the broker's logo displayed prominently, matching the layout pattern used by brand dashboards
- **And** the existing tile grid navigation remains accessible below the logo

### Scenario 2: Backend API for Broker Branding
- **Given** the broker dashboard loads
- **When** the page fetches broker branding data
- **Then** a backend endpoint returns the broker's logo URL and any associated branding metadata
- **And** the endpoint respects the broker's brand assignment context

### Scenario 3: No Brand Assigned State
- **Given** a broker has no brands assigned yet
- **When** they land on the Broker Dashboard
- **Then** they see the broker logo (if available) with the existing "No brand is assigned to you" message
- **And** no summary cards are shown

---

## Design Reference
- **Brand dashboard pattern:** `(brand)/[brandID]/dashboard` — brand logo + two summary cards ("Banner Count for Item Status" and "Trade Spend Roll Up")
- **Current broker dashboard:** `(broker)/dashboard` — tile grid only, no logo or branded hero

---

## Related Tickets
- **CS-1362** — Broker Dashboard | Ask Caboodle (AI assistant for broker dashboard)
- **CS-1406** — Switching from Broker Dashboard to Brand Dashboard Sometimes Does Not Work

---

## CW Note 7/20/26 — Potential Obsolescence

**Some of this ticket may become obsolete** as we continue to update the changes on the new dashboard mockups (Lovable wireframe). The broker landing page is being redesigned as part of CS-1305 (Broker Dashboard KPI Cards / Full Spec). Coordinate scope with those updates before implementation.

---

## Notes
- The tile grid navigation should remain as the secondary content below the branded hero section — do not remove existing navigation.
- The broker's logo may need to be configurable via admin (broker profile/branding settings). If no logo is configured, fall back to a default/brand-neutral state.
- Brand dashboard gets its logo from brand data; the broker logo should similarly come from broker/user profile or the assigned brand's broker configuration.
- This ticket was originally opened Jul 2025 and awaits scope clarification. The core requirement is: make the broker landing page visually consistent with brand dashboards by showing the broker logo.
