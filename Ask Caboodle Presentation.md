---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section {
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #F8F8F8;
    color: #202020;
    padding: 56px 64px;
    font-size: 22px;
    line-height: 1.5;
    overflow: hidden;
  }
  section::after { color: #9AA0AE; font-size: 14px; }

  h1 { font-size: 44px; color: #202020; font-weight: 800; letter-spacing: -0.02em; line-height: 1.08; margin-bottom: 10px; }
  h2 { font-size: 34px; color: #202020; font-weight: 800; letter-spacing: -0.015em; margin-bottom: 18px; }
  h2::after {
    content: ""; display: block; width: 56px; height: 4px;
    background: #0958D9; border-radius: 2px; margin-top: 12px;
  }
  h3 {
    font-size: 17px; color: #0958D9; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;
  }
  strong { color: #0958D9; font-weight: 700; }
  a { color: #0958D9; }
  ul, ol { margin-top: 6px; }
  li { margin-bottom: 8px; }

  blockquote {
    background: #BBC3E8; color: #202020; border: 0; border-radius: 14px;
    padding: 18px 24px; margin: 18px 0; font-style: normal;
    font-size: 22px; font-weight: 600;
  }
  blockquote p { margin: 0; }

  section table {
    border-collapse: collapse;
    width: 100%; font-size: 18px; margin: 14px 0 0 0;
    background: transparent;
  }
  section th, section td {
    border: 0; border-bottom: 1px solid #C9CAD0;
    padding: 10px 14px; text-align: left; vertical-align: top;
  }
  section thead th {
    background: #BBC3E8; color: #202020; font-weight: 700;
    border-bottom: 2px solid #202020;
  }
  section tbody tr:last-child td { border-bottom: 0; }

  .muted { color: #5B5B5B; font-size: 18px; }

  section.title-slide {
    background: #F8F8F8; justify-content: center; text-align: left;
    position: relative; overflow: hidden;
  }
  section.title-slide h3 { color: #0958D9; font-size: 18px; letter-spacing: 0.2em; margin-bottom: 14px; }
  section.title-slide h1 { font-size: 68px; margin-bottom: 6px; }
  section.title-slide h1::after {
    content: ""; display: block; width: 92px; height: 6px;
    background: #0958D9; border-radius: 3px; margin-top: 22px;
  }
  section.title-slide p { color: #202020; font-size: 23px; margin: 6px 0; }
  section.title-slide::before {
    content: ""; position: absolute; right: -150px; bottom: -170px;
    width: 480px; height: 480px; background: #BBC3E8; border-radius: 28px; z-index: 0;
  }
  section.title-slide h3::before,
  section.section-slide h3::before {
    content: ""; display: inline-block; width: 10px; height: 10px;
    background: #73D13D; border-radius: 2px; margin-right: 10px; vertical-align: middle;
  }
  section.title-slide > * { position: relative; z-index: 1; }

  section.statement-slide {
    background: #F8F8F8; justify-content: center; text-align: left;
    position: relative; overflow: hidden;
  }
  section.statement-slide h1 { font-size: 46px; max-width: 94%; }
  section.statement-slide h1::after {
    content: ""; display: block; width: 92px; height: 6px;
    background: #0958D9; border-radius: 3px; margin-top: 22px;
  }
  section.statement-slide p { color: #202020; font-size: 22px; margin: 8px 0; }
  section.statement-slide::after {
    content: ""; position: absolute; right: -130px; bottom: -150px;
    width: 400px; height: 400px; background: #9FCBD1; border-radius: 28px; z-index: 0;
  }
  section.statement-slide > * { position: relative; z-index: 1; }

  section.section-slide {
    background: #BBC3E8; color: #202020; justify-content: center; text-align: left;
    position: relative; overflow: hidden;
  }
  section.section-slide h3 { color: #0958D9; font-size: 18px; letter-spacing: 0.2em; }
  section.section-slide h1 { color: #202020; font-size: 50px; }
  section.section-slide h1::after {
    content: ""; display: block; width: 92px; height: 6px;
    background: #0958D9; border-radius: 3px; margin-top: 22px;
  }
  section.section-slide p { color: #202020; font-size: 22px; }
  section.section-slide::before {
    content: ""; position: absolute; right: -120px; bottom: -140px;
    width: 420px; height: 420px; border-radius: 50%; background: #9FCBD1; z-index: 0;
  }
  section.section-slide > * { position: relative; z-index: 1; }

  section.closing-slide {
    background: #0958D9; color: #F8F8F8; justify-content: center; text-align: left;
    position: relative; overflow: hidden;
  }
  section.closing-slide h3 { color: #9FCBD1; font-size: 18px; letter-spacing: 0.2em; }
  section.closing-slide h1 { color: #F8F8F8; font-size: 60px; }
  section.closing-slide h1::after {
    content: ""; display: block; width: 92px; height: 6px;
    background: #73D13D; border-radius: 3px; margin-top: 22px;
  }
  section.closing-slide p { color: #F8F8F8; font-size: 23px; }
  section.closing-slide::before {
    content: ""; position: absolute; right: -130px; bottom: -150px;
    width: 440px; height: 440px; border-radius: 50%; background: #0B47AE; z-index: 0;
  }
  section.closing-slide > * { position: relative; z-index: 1; }
---

<!--
_class: title-slide
_paginate: false
-->

### Feature ideation

# Ask Caboodle

Natural-language questions, answered from your own Caboodle data.

What we're building, how it works, what it won't do, and how we'd phase it.

<!--
"This is your idea. Today I want to show you the shape we've given it, and get your reaction."
-->

---

## What it is

Ask Caboodle is a **natural-language layer over Caboodle's own data**.

- You type a question; it answers from your data.
- It sits on top of the reports and dashboards you already use.
- Every answer links back to the source records.
- It doesn't invent anything. If it can't answer, it says so.

<!--
One definition, four properties. Keep it tight.
-->

---

## What we're going to do

- Replace the **hunt for reports** with asking a question.
- Start with the **data and reports you already have**.
- Let users **save the questions** they use often.
- Respect **brand scope and module subscription** from the start.
- Eventually, let users **act on answers**, not just read them.

<!--
This is the scope statement. Nothing here promises new data collection in phase 1.
-->

---

## How it's going to work

1. You **ask** in plain English.
2. It works out **what you mean**: matching names to real records, and finding which module the data lives in.
3. It checks **what you're allowed to see**: your brand, and the modules you subscribe to.
4. It builds a **structured plan**, and trusted code turns that into a **read-only query**.
5. You get a **short answer** with a link to the source records. Charts and tables on request.
6. It stays inside limits: a row cap, a timeout, and **"I can't answer that"** when the data isn't there.

<!--
Be specific: name resolution, access check, plan → query, limits. This is the mechanical "how".
-->

---

## Two kinds of result

| Where | What it is | Stays current? |
|---|---|---|
| **In the conversation** | A snapshot of the answer at that moment | No, it records what you saw |
| **Saved or pinned** | The **query** is stored, not the result | Yes, it re-runs and refreshes |

> Saving keeps the *question*, not the data, so a saved or pinned chart is always live, not frozen at the time you asked.

<!--
The key distinction: conversation = snapshot; library and pins = dynamic. Corrects any "as of" confusion.
-->

---

## What it will not do

- It won't answer from **outside Caboodle**.
- It won't **make up an answer** when data is missing.
- Phase 1 won't **create or change** any data. It's read-only.
- It won't replace the **tracker or the email workflow**.
- It won't give a brand access to **modules they don't pay for**.

<!--
This slide does a lot of expectation-setting. Walk it slowly; these are the guardrails.
-->

---

## What you'll be able to ask

Ask about anything in the data you already have, across every module.

| Area | You could ask |
|---|---|
| Sales & distribution | Cases by month, top SKUs, who's buying, which stores stopped ordering |
| Promotions & spend | What's running, what's unsubmitted, what went over budget |
| Reviews & status | Upcoming reviews, who hasn't submitted, what's awaiting a response |
| Assortment & pricing | Which banners carry a SKU, margins, missing prices |
| Stores & geography | Active stores, new and dropped stores, white-space opportunities |
| Dashboards | Stores in, reviews due, active promos, "what needs my attention today?" |

<!--
Keep this broad on purpose: the point is coverage across the platform, not a fixed feature list.
-->

---

<!--
_class: section-slide
_paginate: false
-->

### The plan

# Four phases

Read first, then personalise, then act, then extend.

---

## Phase 1: Ask

**Natural-language Q&A over existing data, reports, and a saved library.**

- Ask across the modules and reports you already have.
- Short answer first; charts and tables on request.
- **Save a question** to a personal library so it keeps refreshing.
- Export any answer to feed an existing upload.
- Read-only, brand-scoped, gated by subscription.

<!--
This is the foundation. Everything later depends on this being correct.
-->

---

## Phase 2: Pin

**Put the answers you care about onto a dashboard.**

- Pin a saved question or a single metric.
- Arrange your own dashboard, Metabase-style.
- Refreshes automatically; no re-asking.
- Still read-only.

> Which KPIs would you pin first?

<!--
Pinning is a personalisation layer on top of the library, nothing more.
-->

---

## Phase 3: Act

**CRUD: create, update, and remove through Ask Caboodle.**

- **Create**: draft a promotion from a target price or margin.
- **Update**: apply the item-status reconciliation, or update a status.
- **Remove**: retire or clear records you no longer need.
- Every write goes through the same permissions and validation as the UI.

> This is where "build me a promo from 40% margin" finally lands.

<!--
CRUD is the first phase that changes data. It needs the guardrails we discussed, so it comes after read is proven.
-->

---

## Phase 4: Extend

**Broaden the reach and the intelligence.**

- More data domains: SPINS, Distributor APL, Trade Spend Roll-up.
- Scheduled digests and anomaly alerts.
- Shared and team-level libraries.
- Predictive and assistive planning.

<!--
Direction, not detail. This is where the roadmap stays open.
-->

---

## The phases at a glance

| Phase | Capability | Nature |
|---|---|---|
| **1: Ask** | Natural-language Q&A over existing data, reports, and a saved library | Read-only |
| **2: Pin** | Pin saved answers and metrics to a personal dashboard | Read-only |
| **3: Act** | CRUD: create, update, remove through Ask Caboodle | Writes data |
| **4: Extend** | More domains, digests, alerts, shared libraries, predictive | Expand |

---

## What we need to figure out

| Problem | Why it's hard |
|---|---|
| **Joined data model** | Distributor sales, assortment, stores and geography aren't linked yet. |
| **Precomputed results** | Promo and spend figures are calculated on the fly today. |
| **Data quality** | Known distributor calculations and store duplicates must be fixed first. |
| **Gating & billing** | We need a clear rule for modules, cross-module questions, and cost. |

<!--
Shared unknowns, not blockers. We want to solve these with them.
-->

---

<!--
_class: closing-slide
_paginate: false
-->

### Ask Caboodle

# Let's dig in

Does the four-phase shape feel right, and where should we start?

<!--
Open the floor and let them drive.
-->
