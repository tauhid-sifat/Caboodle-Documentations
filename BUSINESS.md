# Caboodle — Business Overview

> A guide for developers new to the CPG (Consumer Packaged Goods) industry.

---

## The Problem Caboodle Solves

Imagine you make a product — say, a new brand of pasta sauce. You manufacture it, but you don't sell it directly to shoppers. Instead:

1. **Distributors** (companies like KeHE, UNFI) buy your sauce and stock it in their warehouses.
2. **Retailers** (Walmart, Target, Kroger) order from distributors and put it on their shelves.
3. **Brokers** (sales agencies) work on your behalf to convince retailers to stock and promote your sauce.
4. You (the **Brand**) pay retailers for promotion slots — shelf space, newspaper ads, discount programs.

This creates a messy data problem:

- Where is my sauce selling? Which stores? Which cities?
- Did the promotion I paid for actually happen?
- How much did I spend on promotions vs. what I budgeted?
- Is the distributor reporting accurate sales data?
- Which products are profitable and which aren't?

**Caboodle is a platform that collects, cleans, and visualizes this data so brands, brokers, and retailers can answer these questions.**

---

## The Players (Business Roles)

```
                    ┌──────────────────────────┐
                    │   Brand (e.g., Pepsi)     │
                    │  Owns the product, pays   │
                    │  for promotions           │
                    └───────────┬──────────────┘
                                │ hires
                    ┌───────────▼──────────────┐
                    │   Broker (Sales Agency)   │
                    │  Negotiates with retailers│
                    │  on brand's behalf        │
                    └───────────┬──────────────┘
                                │ sells to
          ┌─────────────────────┼─────────────────────┐
          │                     │                      │
┌─────────▼────────┐  ┌────────▼───────┐  ┌──────────▼─────────┐
│   Retailer        │  │  Distributor   │  │  Sub-Broker         │
│  (Walmart, Target)│  │  (KeHE, UNFI)  │  │  (regional agent)   │
│  Sells to shoppers│  │  Warehouses &  │  │                     │
│                   │  │  delivers      │  │                     │
└───────────────────┘  └───────────────┘  └─────────────────────┘
```

**Brand** — The product owner. A CPG company (or a brand division within one). They have:
- A portfolio of products with prices and specifications.
- A budget for trade promotions.
- A sales team and relationships with brokers.

**Broker** — A sales agency that represents multiple (sometimes competing) brands. They:
- Pitch brand products to retailers.
- Negotiate promotional deals.
- Track deals and report results back to brands.
- Can have sub-brokers working under them.

**Retailer** — The store chain. They:
- Decide which products go on shelves.
- Offer promotional slots (endcaps, flyer features, discounts).
- Report sales data back through distributors.

**Distributor** — The middleman who physically moves products. They:
- Receive products from brands, store in warehouses (distribution centers).
- Ship to retail stores.
- Provide sales data files (the "source of truth" for what actually sold).

---

## What Caboodle Does

### 1. Ingests Distributor Sales Data

Distributors (KeHE, UNFI, SPINS) send gigantic CSV/Excel files containing every single transaction — every product sold at every store, every day.

**The problem**: These files are messy. Retailer names are misspelled, store codes don't match, product names vary between files. One file might call a store "Walmart #1234" and another "Walmart Supercenter — Chicago."

**What Caboodle does**: The **DataHub** module cleans, normalizes, and maps this raw data:

```
Raw Distributor File
  ├── "Wmart 123 Chgo"     →  Unified Entity: "Walmart #1234, Chicago"
  ├── "Pasta Sauce 16oz"   →  Unified Entity: "Premium Marinara 16oz"
  └── "UNFI Dist Center 5" →  Unified Entity: "UNFI Midwest DC"
```

It stores **unmapped records** (things it couldn't match) for a human to resolve later.

### 2. Manages Product Information

The **Product Specs** module is the master product catalog. It stores:
- Product names, SKUs, UPC barcodes, sizes, descriptions.
- Categories (e.g., "Pasta Sauce" → "Italian" → "Shelf Stable").
- Pricing — what the brand charges each distributor.
- Customer-specific pricing (deals for specific retailers).

### 3. Tracks Promotions (Trade Spend)

This is the core business function. **Trade Spend** is all the money a brand spends to promote products at retailers:

| Promotion Type | What It Is |
|---------------|------------|
| **EDLP** | Every Day Low Price — permanent price reduction. |
| **Feature** | Newspaper ad or digital feature. |
| **Display** | Endcap display, pallet display. |
| **Temporary Price Reduction** | Short-term discount (e.g., "20% off for 2 weeks"). |
| **Rebate** | Money back after purchase. |
| **Slotting** | Fee just to get a product on the shelf. |

Each promotion has:
- A start and end date.
- A budget (how much the brand is willing to spend).
- An estimated lift (how much extra volume they expect).
- An actual cost (what they really paid, after the fact).

**The workflow**:
1. **Sandbox** (TradeSpendSandbox): Users draft promotions, run "what-if" scenarios.
2. **Approved**: Promotions are pushed to live Trade Spend.
3. **Monthly Report**: Actual spending is imported and compared against budget.

### 4. CRM for the CPG Industry

The **CRM** module doesn't manage leads and deals like a traditional CRM. It manages **relationships in the distribution chain**:

- **Retailers** and their **Banners** (store banners — Walmart Supercenter vs Walmart Neighborhood Market).
- **Distributors** and their **Distribution Centers** (warehouses).
- **Contacts** — who works where and how to reach them.
- **Pipelines** — deal tracking for broker-sold promotions.
- **Banner SKUs** — which products (SKUs) are authorized at which banners.
- **Store List** — every store location in the system.

### 5. Provides Reports

The **Report** and **Dashboard** modules aggregate data across all other modules:
- **Product reports**: Which products sell where.
- **Roll-up reports**: Total spending, total sales, across brands and brokers.
- **Market overviews**: Category performance by retailer.
- **Retail reports**: Detailed per-retailer performance.
- **Sales tracker**: Actual vs. projected sales.

### 6. AI-Powered Q&A ("ASK Cab")

The **Intelligence** module lets users type questions in plain English:
- "Which products sold best at Walmart last quarter?"
- "Show me all promotions that went over budget."
- "Which broker has the highest volume in California?"

Behind the scenes, an LLM (Claude/GPT) translates the question into a structured query plan, and the system runs it safely against the database. Results come back as conversational answers — no SQL knowledge needed.

### 7. File Repository

A virtual file system for storing documents — contracts, promotion artwork, planograms, photos of shelf displays. Brand users and broker users each have their own file tree.

### 8. Admin

Super-administration features:
- Create and manage user accounts.
- Assign roles and permissions.
- Pipeline deal stage configuration.
- Data cleanup jobs.

---

## Key Business Flows (End to End)

### Flow 1: A Promotion is Created and Reported

```
1. Brand wants to run a "20% off" promotion at Walmart for 2 weeks.
   │
2. Broker enters the promotion in TradeSpendSandbox
   │  - What product? At which banners? Start/end dates? Budget?
   │  - Expected volume lift?
   │
3. Brand reviews and "pushes" to live TradeSpend
   │
4. The promotion runs in the real world
   │
5. Distributor sends sales data covering the promotion period
   │
6. DataHub imports the sales file, maps it to products and stores
   │
7. Monthly Report shows: Budget = $10,000 | Actual = $8,500 | Lifted = 15%
   │
8. Reports show the promotion's effectiveness across banners
```

### Flow 2: Data Cleaning (Entity Resolution)

```
1. Distributor sends file with store name "WM 1234 CHI"
   │
2. DataHub tries to find matching store → not found
   │
3. Record goes to Unmapped Records
   │
4. Admin searches possible matches:
   │  - "Walmart #1234 Chicago" (confidence: 95%)
   │  - "Walmart Supercenter 1234" (confidence: 88%)
   │
5. Admin selects the correct match, or creates a new unified entity
   │
6. Record becomes "mapped" — now queryable and reportable
```

### Flow 3: The Brand-Broker Relationship

```
Brand Side (what a brand user sees):
  └── Their own products, promotions, sales data.
  └── Which brokers work for them.
  └── Some broker data (e.g., promotion status).

Broker Side (what a broker user sees):
  └── All brands they represent (possibly competing brands).
  └── Their own promotions across all brands.
  └── Some brand data they need to do their job.

The permissions model is complex — brokers see brand data,
but brands see limited broker data. Some data is "propagated"
into the brand environment from the broker side.
```

---

## Data Flow Diagram (Simplified)

```
                  ┌────────────────────────────────────────────┐
                  │              External Sources               │
                  │  KeHE  │  UNFI  │  SPINS  │  Manual CSV    │
                  └────────┼────────┼────────┼────────────────┘
                           │        │        │
                           ▼        ▼        ▼
                  ┌────────────────────────────────────────────┐
                  │              DataHub Module                 │
                  │  Import → Unmapped → Resolve → Mapped      │
                  │  (CSV chunked upload) (Hangfire jobs)      │
                  └──────────────┬─────────────────────────────┘
                                │ cleaned, unified data
                                ▼
     ┌────────────────────────────────────────────────────────────┐
     │                      Core Domain                            │
     │  ┌──────┐  ┌────────┐  ┌────────┐  ┌──────────────────┐  │
     │  │Brand │  │ Broker │  │  CRM   │  │  Product Specs   │  │
     │  │      │  │        │  │Retailer│  │  Products /       │  │
     │  │      │  │        │  │Banner  │  │  Categories /     │  │
     │  │      │  │        │  │Distrib │  │  Pricing          │  │
     │  └──────┘  └────────┘  └────────┘  └──────────────────┘  │
     └────────────────────────────────────────────────────────────┘
                                │
                                ▼
     ┌────────────────────────────────────────────────────────────┐
     │              Promotion Management                          │
     │  ┌─────────────────┐    ┌──────────────────────────────┐  │
     │  │ TradeSpend      │    │  TradeSpendSandbox            │  │
     │  │ (Live promos)   │◄───│  (Draft / What-if scenarios) │  │
     │  └────────┬────────┘    └──────────────────────────────┘  │
     │           │                                                │
     │           ▼                                                │
     │  ┌────────────────┐                                       │
     │  │ Monthly Report │  Budget vs. Actual spending           │
     │  └────────────────┘                                       │
     └────────────────────────────────────────────────────────────┘
                                │
                                ▼
     ┌────────────────────────────────────────────────────────────┐
     │              Reporting Layer                                │
     │  Reports │ Dashboard │ Market Overview │ Sales Tracker    │
     └────────────────────────────────────────────────────────────┘
                                │
                                ▼
     ┌────────────────────────────────────────────────────────────┐
     │              AI Layer ("ASK Cab")                          │
     │  Natural language → Query Plan → Safe Execution → Answer   │
     └────────────────────────────────────────────────────────────┘
```

---

## How the Frontend Connects

The frontend (separate Angular/React/Blazor apps) calls REST APIs:
- All routes: `api/v{version}/[controller]`
- Auth: JWT token from `POST /api/v1/Auth/login` or `POST /api/v1/Admin/login`
- Brand-scoped: `Brand-ID` header on requests
- Pagination: `?pageSize=10&currentPage=1&sortingOrder=asc`
- File imports: Chunked upload (POST) → Poll job status (GET)
- Async exports: Start (POST) → Poll status (GET) → Download

---

## Glossary for Non-CPG Developers

| Term | Plain English |
|------|---------------|
| **SKU** | Stock Keeping Unit — a unique code for each product variant (e.g., "Pasta Sauce 16oz" is one SKU, "Pasta Sauce 24oz" is another). |
| **UPC** | Universal Product Code — the barcode on the package. |
| **Banner** | A retail brand under a parent retailer (e.g., "Walmart Supercenter" vs "Walmart Neighborhood Market"). |
| **Distribution Center (DC)** | A warehouse where a distributor stores products before shipping to stores. |
| **APL** | Authorized Price List — the official prices a distributor charges for products. |
| **EDLP** | Every Day Low Price — a permanent price reduction, not a temporary promotion. |
| **TPR** | Temporary Price Reduction — a short-term discount. |
| **Lift** | The extra sales volume generated by a promotion compared to normal. |
| **Planogram** | A diagram showing how products should be arranged on a store shelf. |
| **Slotting Fee** | A one-time fee brands pay retailers to get a new product on the shelf. |
| **Banner SKU** | A product authorized to be sold at a specific banner. Not all products are at all banners. |
| **Unmapped Record** | Raw distributor data that the system couldn't automatically match to a known entity (store, product, etc.). |
| **KeHE / UNFI / SPINS** | The three major distributors whose data Caboodle processes. |
| **Brand Owner** | A user who manages a brand's data in the system. |
| **Sub-Broker** | A smaller broker working under a larger broker. |
| **Roll-Up** | Aggregating data from lower levels up (e.g., store sales rolled up to chain level, then to brand level). |
| **Multi-Tenancy** | One Caboodle instance serves many brands; each brand's data is isolated. |
