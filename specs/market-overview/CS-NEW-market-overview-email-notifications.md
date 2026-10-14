---
module: market-overview
jira: [MO9]
status: new
last_verified: 2026-10-14
related_wiki: ../../wiki/key-business-flows.md
---

# Market Overview | Push Updates to Brands via Email (Summary with Details Link)

**MO9** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Brand Owner/Sub-User,  
**I want** to receive an email summary when a broker updates Market Overview records for my brand,  
**So that** I stay informed of in-store observations without logging into the platform.

---

## Description

When a broker creates or updates Market Overview records, the relevant Brand users currently have no automatic notification. They must proactively check the platform to see new observations.

This story adds an email notification sent to Brand users when Market Overview log entries are created or updated, with a summary of changes and a link to view details in the platform.

---

## Acceptance Criteria

### Scenario 1: Email Notification on New Log Entry
- **Given** a broker creates a Market Overview record for a brand
- **When** the record is saved
- **Then** an email is sent to all Brand Owner and Brand Sub-User assigned to that brand
- **And** the email includes:
  - Brand name
  - Retailer / Banner name
  - SKU name
  - Status
  - Date of observation
  - Comment (first 100 chars)
  - "Click here for details" link pointing to the Market Overview detail page

### Scenario 2: Email on Update
- **Given** an existing Market Overview record is edited
- **When** the update is saved
- **Then** an email is sent listing what changed (e.g., "Status changed from Pending to Active", "Comment updated")

### Scenario 3: Notification Digest (Optional)
- **Given** multiple Market Overview entries are created in a short period
- **When** the same broker creates multiple records
- **Then** consider batching notifications into a daily/weekly digest rather than individual emails per record

### Scenario 4: Opt-Out
- **Given** a Brand user does not wish to receive these emails
- **When** they update their notification preferences
- **Then** Market Overview email notifications are suppressed for that user

---

## Email Template (Suggested)

```
Subject: [Caboodle] New Market Overview Entry for {BrandName}

Hi {UserName},

{ BrokerName } has logged a new Market Overview observation:

  Retailer:     {RetailerName}
  Banner:       {BannerName}
  SKU:          {SKUName}
  Status:       {SkuStatus}
  Date:         {ObservationDate}
  Comment:      {CommentTruncated}

View details: {LinkToMarketOverview}

You are receiving this because you are a user of {BrandName} on Caboodle.
To unsubscribe from these notifications, visit your notification settings.
```

---

## Design Notes

### Trigger Points
- **Create:** `CreateMarketOverviewsRequest.cs` — after successful creation + CRM sync
- **Update:** `UpdateMarketOverviewRequest` — after successful update

### Recipients
- Brand Owner (`BRANDOWNER`) and Brand Sub-Users (`BRANDSUBUSER`) for the brand
- Query via `Brand.UserID` and `BrandSubUser` records

### Reference Existing Implementation
- Banner Activity @-mention email notifications (`UpsertBannerActivityRequest.cs:128-134`)
- Reuse the existing `IMailService` infrastructure

---

## Notes
- Link must be a deep link to the Market Overview detail/report page in the frontend
- Confirm whether the email should also go to the broker who created the record (as a confirmation)
- Consider notification frequency: real-time vs daily digest
