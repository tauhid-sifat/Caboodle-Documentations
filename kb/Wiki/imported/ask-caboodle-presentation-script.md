---
type: reference
title: Ask Caboodle - Presentation Script
module: ask-caboodle
status: current
last_verified: 2026-10-14
---

# Ask Caboodle - Presentation Script

**Before you start.** This is not a pitch. You have worked with Constance for years, and this is *her* idea. You are the one who finally put shape around it. So the tone is peer to peer, warm, direct, collaborative. Say "we." Give her credit. Push back openly where you disagree. If she interrupts, let her. This works better as a conversation than a presentation.

**Runtime:** about 18 to 22 minutes, leaving plenty of room for discussion.
**Format:** `[stage direction]` in brackets, spoken lines in plain text.

---

## Slide 1 - Cover

[Let the slide sit for a second. No rush.]

Okay, so, Ask Caboodle. I don't think I need to convince you this matters. You have been the one pushing for it. So before anything else: this is your idea. We have just been trying to give it some shape.

Today I want to show you what we think it is, how it would work, what it won't do, and how we would phase it. And I want your reaction at every step.

---

## Slide 2 - What it is

So, the definition we have been working from: Ask Caboodle is a natural-language layer over Caboodle's own data.

You type a question. It answers from your data. It sits on top of the reports and dashboards you already use, and every answer links back to the source records. And it doesn't invent anything. If it can't answer something, it tells you.

[Pause.] That last part is the important one, and we'll come back to it.

---

## Slide 3 - What we're going to do

Here's what we're actually setting out to do.

We want to replace the hunt for reports with asking a question. We start with the data and reports you already have, not new data collection. We let people save the questions they use often. We respect brand scope and module subscription from the very start. And eventually, we let people act on the answers, not just read them.

[Pause.] That last one is a later phase, but I want it on the table now.

---

## Slide 4 - How it's going to work

This is the part I want to get specific about, because "AI answers your questions" sounds magical and it isn't.

[Walk each step.]

One, you ask in plain English.

Two, it works out what you actually mean. It matches names to real records, and it figures out which module the data lives in. So "Chino" becomes a real distribution centre, not just a word.

Three, it checks what you're allowed to see. Your brand, and the modules you subscribe to.

Four, it builds a structured plan, and trusted code turns that into a read-only query. The AI plans; the platform runs it.

Five, you get a short answer, with a link to the records behind it. Charts and tables if you ask.

And six, it stays inside limits. A row cap, a timeout, and a clear "I can't answer that" when the data isn't there.

[Pause.] The point is, it's grounded. It is not guessing.

---

## Slide 5 - Two kinds of result

This one is worth pausing on, because it changes how people use it.

[Point to the table.]

When you ask something in the conversation, that answer is a snapshot. It records what you saw at that moment. That's deliberate. It's a record of the conversation.

But when you save a question, or pin it, we store the query, not the result. So it re-runs and stays current. A saved or pinned chart is always live. It is not frozen at the time you asked.

[Pause.] So the thing you keep is the question. The data underneath it stays fresh.

---

## Slide 6 - What it will not do

Now the guardrails. I want to be straight about these, because they matter more than the features.

It won't answer from outside Caboodle. It won't make up an answer when the data is missing. Phase one won't create or change any data. It's read-only. It won't replace the tracker or the email workflow. And it won't give a brand access to modules they don't pay for.

[Pause.] If we hold those lines, everything else is safe to explore.

---

## Slide 7 - What you'll be able to ask

Here's the breadth, and I've kept it deliberately broad.

Across sales and distribution, promotions and spend, reviews and status, assortment and pricing, stores and geography, and the dashboards. Things like cases by month, top SKUs, what's over budget, who hasn't submitted, which banners carry a SKU, new and dropped stores, and "what needs my attention today."

[Pause.] The point isn't this exact list. The point is that it covers the whole platform, not one corner of it.

---

## Slide 8 - Section: Four phases

[Section divider. Shift the energy slightly.]

So how would we actually build this? Four phases. Read first, then personalise, then act, then extend.

---

## Slide 9 - Phase 1: Ask

Phase one is the foundation. Natural-language Q&A over the data, reports, and a saved library you already have.

You can ask across the modules and reports. Short answer first, charts on request. You can save a question to a personal library, and it keeps refreshing. You can export an answer to feed an existing upload. And it's read-only, brand-scoped, and gated by subscription.

[Pause.] Everything later depends on this phase being correct. So this is where we prove the answers.

---

## Slide 10 - Phase 2: Pin

Phase two is personalisation. You take the answers you care about and put them on a dashboard.

You pin a saved question, or a single metric. You arrange your own dashboard, a bit like Metabase. It refreshes automatically, so you don't re-ask. And it's still read-only.

[Pause.] Which KPIs would you pin first? That's a genuine question for you.

---

## Slide 11 - Phase 3: Act

Phase three is where it starts to do things, not just tell you things. This is CRUD: create, update, remove.

Create: draft a promotion from a target price or margin. Update: apply the item-status reconciliation, or update a status. Remove: retire or clear records you no longer need.

Every write goes through the same permissions and validation as the normal UI.

[Pause.] This is where "build me a promo at 40% margin" finally lands.

---

## Slide 12 - Phase 4: Extend

Phase four is the long tail. More data domains, like SPINS, Distributor APL, and Trade Spend Roll-up. Scheduled digests and anomaly alerts. Shared and team-level libraries. And predictive, assistive planning.

[Shrug slightly.] This is direction, not detail. This is where the roadmap stays open.

---

## Slide 13 - The phases at a glance

[Brief. Don't read the whole table.]

Just to pull it together. Phase one and two are read-only. Phase three writes data, which is why it comes later. Phase four expands. Read, personalise, act, extend.

---

## Slide 14 - What we need to figure out

And now the honest part. These aren't blockers, they're the things we'd work through together.

The joined data model: distributor sales, assortment, stores, and geography aren't linked in one place yet. Precomputed results: a lot of promo and spend figures are calculated on the fly today. Data quality: some known distributor calculations and store duplicates need fixing first. And gating and billing: we need a clear rule for modules, cross-module questions, and cost.

[Pause.] I'd rather put these on the table than pretend they're solved.

---

## Slide 15 - Closing

So, that's the shape of it. Read first, then pin, then act, then extend.

What I'd really like to know is whether this feels right, and where you'd want to start.

[Open the floor.] Where do you want to dig in?

---

## If you get asked (quick answers)

**"Can it make things up?"**
No. It only answers from Caboodle, and if there's no data it says so. The AI plans the query, and the platform runs it.

**"Why is phase three last?"**
Because it's the first phase that changes data. We prove the read side first, then we build the write side on top of it.

**"Will it replace the tracker?"**
No. The tracker and the emails stay. This replaces the hunting, not the workflow.

**"How is a saved report different from the conversation?"**
The conversation is a snapshot. A saved or pinned item stores the query, so it stays live.

**"What about SPINS?"**
It's in phase four. The data side isn't quite ready, and we don't want to promise numbers we can't stand behind.

**"Can this save us money on Claude seats?"**
Potentially, yes. You wouldn't need to export and prompt externally for the questions this covers.
