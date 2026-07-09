# Promotional Management | Export to Formatted Report

**PM2** | New Requirement | User Story | Priority: TBD | Status: New

---

## User Story

**As a** Broker user,  
**I want** to export promotional management data as a formatted report,  
**So that** I can share it with stakeholders without manually formatting the raw export.

---

## Description

Current export options (`GET Brokers/export-events`, `GET Brokers/export-promotional-management-events`) output raw CSV/data. Users then spend time formatting columns, adding headers, and styling before sharing with brands or retailers.

This story adds a "Formatted Report" export option that outputs a presentation-ready document (PDF or styled Excel) with proper column widths, headers, date formatting, and branding.

---

## Acceptance Criteria

### Scenario 1: Formatted Report Option
- **Given** I am on the Promotional Management page
- **When** I open the export menu
- **Then** I see "Export as Formatted Report" as an additional option
- **And** the existing raw export options remain available

### Scenario 2: Report Contents
- **Given** I choose formatted export
- **Then** the report includes:
  - Report title and date range
  - Broker name / brand name header
  - Events grouped by month or retailer
  - Columns: Month, Retailer, Banner, Distributor, Product, Status, Dates
  - Column headers with proper alignment and bold formatting
  - Total/subtotal rows for event counts

### Scenario 3: File Format
- **Given** the export is complete
- **Then** the file is downloaded as a styled Excel (.xlsx) file with:
  - Auto-fit column widths
  - Bold headers with background color
  - Borders and alternating row colors
  - A summary/title row at the top

---

## Design Notes

### Options
- **Option A:** Server-side report generation using EPPlus or ClosedXML for styled .xlsx
- **Option B:** Client-side formatting before download using a library like ExcelJS
- **Option C:** PDF generation with a template (more complex)

Recommend Option A for consistency and reliability.

### Existing Endpoints
- `GET Brokers/export-events` (line 440)
- `GET Brokers/export-promotional-management-events` (line 465)

---

## Notes
- Consider adding a "Preview" option before downloading
- Confirm whether broker logo/branding should appear on the report header
