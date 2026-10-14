---
type: reference
title: "Ask Caboodle: Feature Scope (Client Version)"
module: ask-caboodle
status: current
last_verified: 2026-10-14
---

# Ask Caboodle: Feature Scope (Client Version)

> Prepared for the Caboodle team. This is the plain-language companion to the Ask Caboodle presentation. It follows the same four-phase shape, and leaves the technical detail to the separate internal document.

---

## What it is

Ask Caboodle is a natural-language layer over Caboodle's own data.

You type a question, and it answers from your data. It sits on top of the reports and dashboards you already use, and every answer links back to the source records. It doesn't invent anything. If it can't answer something, it tells you.

---

## What we're going to do

- Replace the hunt for reports with asking a question.
- Start with the data and reports you already have.
- Let people save the questions they use often.
- Respect brand scope and module subscription from the start.
- Eventually, let people act on answers, not just read them.

---

## How it works

1. You ask in plain English.
2. It works out what you mean, matching names to the right records and finding which module the data lives in.
3. It checks what you're allowed to see: your brand, and the modules you subscribe to.
4. It builds a structured plan, and trusted code turns that into a read-only query.
5. You get a short answer with a link to the source records. Charts and tables on request.
6. It stays inside limits: a sensible result cap, a timeout, and a clear "I can't answer that" when the data isn't there.

---

## Two kinds of result

This distinction matters, because it changes how people use it.

| Where | What it is | Stays current? |
|---|---|---|
| In the conversation | A snapshot of the answer at that moment | No, it records what you saw |
| Saved or pinned | The question is stored, not the result | Yes, it re-runs and refreshes |

Saving keeps the question, not the data, so a saved or pinned chart is always live. It is not frozen at the time you asked.

---

## What it will not do

- It won't answer from outside Caboodle.
- It won't make up an answer when data is missing.
- Phase 1 won't create or change any data. It is read-only.
- It won't replace the tracker or the email workflow.
- It won't give a brand access to modules they don't pay for.

---

## What you'll be able to ask

Ask about anything in the data you already have, across every module.

| Area | You could ask |
|---|---|
| Sales and distribution | Cases by month, top SKUs, who's buying, which stores stopped ordering |
| Promotions and spend | What's running, what's unsubmitted, what went over budget |
| Reviews and status | Upcoming reviews, who hasn't submitted, what's awaiting a response |
| Assortment and pricing | Which banners carry a SKU, margins, missing prices |
| Stores and geography | Active stores, new and dropped stores, white-space opportunities |
| Dashboards | Stores in, reviews due, active promos, "what needs my attention today?" |

A few concrete examples, in your own words:

- "Give me a list of stores we're not selling into at Chino."
- "Which of my items are active on the distributor side but not reflected in item status?"
- "Show me my top SKUs by volume."
- "What's my total trade spend across all my accounts?"

---

## The four phases

Each phase builds on the one before it. Read first, then personalise, then act, then extend.

### Phase 1: Ask

**Natural-language questions over the data, reports, and a saved library you already have.**

- Ask across the modules and reports you already use.
- Short answer first, with charts and tables on request.
- Save a question to a personal library, and it keeps refreshing.
- Export an answer to feed an existing upload.
- Read-only, scoped to your brand, and based on what you subscribe to.

This is the foundation. Everything later depends on getting this right, so this is where we prove the answers.

### Phase 2: Pin

**Put the answers you care about onto a dashboard.**

- Pin a saved question, or a single number.
- Arrange your own dashboard, a little like Metabase.
- It refreshes automatically, so you don't have to ask again.
- Still read-only.

Which numbers would you pin first? That is a genuine question.

### Phase 3: Act

**Create, update, and remove through Ask Caboodle.**

- Create: draft a promotion from a target price or margin.
- Update: apply the item-status reconciliation, or update a status.
- Remove: retire or clear records you no longer need.
- Every change goes through the same permissions and checks as the normal screens.

This is where "build me a promo at 40% margin" finally lands. It is also the first phase that changes data, which is why it comes after the read side is proven.

### Phase 4: Extend

**Broaden the reach and the intelligence.**

- More data: SPINS, Distributor APL, and Trade Spend Roll-up.
- Scheduled digests and alerts when something needs attention.
- Shared and team-level libraries.
- Predictive, assistive planning.

### At a glance

| Phase | Capability | Nature |
|---|---|---|
| 1: Ask | Questions over existing data, reports, and a saved library | Read-only |
| 2: Pin | Pin saved answers and numbers to a personal dashboard | Read-only |
| 3: Act | Create, update, remove through Ask Caboodle | Changes data |
| 4: Extend | More data, digests, alerts, shared libraries, predictive | Expand |

---

## The ideas behind this

These came from your notes, and they show up across the phases.

**Build a promotion from a goal.** Today the long part is guessing the scan, checking the margin, and adjusting until it fits. In this version you would say what you want, for example a $3.99 sale price at a 40% margin, and it works backwards to the scan you need. The things that can't move, like OI and MCB, stay fixed. You get a draft to review. (Phase 3)

**Reconcile reports automatically.** Today you export Brand Retail Item Status and the Distributor Report, prompt an outside tool, and then update SKUs by hand. This becomes a single question: show me items that are active on the distributor side but not reflected in item status. The same idea powers the white-space list, stores pulling from a distribution center that don't buy from you. (Phase 1 to show it, Phase 3 to apply it)

**Flag new and dropped stores.** New stores, and stores that haven't shipped since a cutoff you choose, built from distributor shipping history against your store list. A standing manual report becomes a question you can ask any time. (Phase 1)

**The morning brief.** "What needs my attention today?" across reviews, promos, and tasks, in one answer instead of four screens. (Phase 1, then pinned in Phase 2)

**Self-service reporting.** Iterate a question until it is right, save it, and it keeps refreshing. This is the "build and save the reports you want" idea, so people stop waiting on custom reports.

---

## What we need to figure out

These aren't blockers. They are the things we would work through together.

| Topic | Why it matters |
|---|---|
| Connected data | Some data, like distributor sales, assortment, stores, and geography, isn't linked in one place yet. Cross-module questions depend on connecting it. |
| Ready-to-read numbers | A lot of promotion and spend figures are worked out on the fly today. For fast, repeatable answers, we need them prepared in advance. |
| Data quality | A few known distributor calculations and duplicate stores need fixing first, so the answers can be trusted. |
| Access and billing | We need a clear rule for what counts as a module, how questions that span modules behave, and how usage is priced. |

---

## Open questions

**Scope**
- Which reports should this genuinely take over, and which should stay?
- Are the four phases in the right order: read, pin, act, extend?

**Access and commercials**
- What does a module mean commercially, and how should access and billing work?
- Should saved questions be personal, or shared across the team?

**The three ideas**
- For the promotion builder, which inputs are fixed and which should the system solve?
- For reconciliation, should it only show the gaps, or also apply the update?
- What counts as a new or dropped store, and who sets that threshold?

**One request**
- If you can dig up the list of around ten to twelve example questions from our last call, that would help a lot. It probably tells us where to start.

---

## Next steps

- Confirm the four-phase shape and where to start.
- Pull together the example questions and map them to the data.
- Agree which reports move over and which stay.
- Work through the connected-data and data-quality items.
- Bring it into the roadmap with real timing.
