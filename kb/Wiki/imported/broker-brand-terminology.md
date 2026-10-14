---
type: reference
title: Critical terminology (broker-brand relationship)
module: general
status: validated
last_verified: 2026-10-14
---

# CRITICAL TERMINOLOGY (Broker-Brand Relationship)

**Correct language (from docs/onboarding docs):**
- **Brands are assigned to brokers** (endpoint: `PATCH /Brands/assign-brand-to-broker`)
- **Broker represents brands** — not "broker assigned under brand"
- **Admin assigns brands to a broker**, not the broker adding themselves
- The link is `Brand.BrandBrokers` table (owned by Brand module)
- KPI label: **"Brands Represented"** (not "Brands Assigned")

**Incorrect (do not use):**
- ❌ "Broker assigned to a brand"
- ❌ "Broker assigned under brand"
- ❌ "Brands assigned under broker"
