# Knowledge Test Questions (Wave 2 draft)

> NOTE: All paths below assume the Wave 1 restructure (`wiki/`, `specs/`,
> `meetings/transcripts/` + `meetings/notes/`, `jira/`, `docs/`, `tests/`).
> If Wave 1 renames differ, update expected paths before running Wave 5.
> Pass threshold: ≥8/10 with correct file + any accurate line range via
> `okn search` (Wave 5).

## Q1. SkuStatus terminal value + rule
- **Question:** Which `SkuStatus` value is terminal, and what rule governs Market Overview overwrites of it?
- **Expected source(s):** `wiki/market-overview.md` (primary); `wiki/promotions.md` (status enum context)
- **Correct cited answer:** Correct file + any accurate line range showing Discontinued is terminal and Market Overview cannot overwrite it (today: AGENTS.md §§6/10).

## Q2. Brands-assigned-to-brokers phrasing
- **Question:** What is the correct phrasing for the brand–broker assignment relationship, and which phrasings are wrong?
- **Expected source(s):** `wiki/terminology.md`
- **Correct cited answer:** Correct file + any accurate line range showing "brands are assigned to brokers" / "broker represents brands" is correct and the "assigned under brand" variants are wrong (today: AGENTS.md §7).

## Q3. Category Review three interactions + triggers
- **Question:** What are the three distinct Category Review interactions and what triggers each?
- **Expected source(s):** `wiki/category-review.md`
- **Correct cited answer:** Correct file + any accurate line range showing Send to Contacts (toolbar button), cell single-click checkmark, cell double-click assign contacts (today: AGENTS.md §9).

## Q4. CS-1361 vs CS-1296 data flow
- **Question:** How do CS-1361 (yearly grid) and CS-1296 (CSV rollup) relate in the Category Review data flow?
- **Expected source(s):** `specs/category-review/` (both spec files); `jira/` (CS-1361, CS-1296 tickets)
- **Correct cited answer:** Correct file + any accurate line range showing CSV import writes the CategoryReview table and the grid reads it back (today: AGENTS.md §9 + specs/).

## Q5. Promotion lifecycle steps + TSS push validation
- **Question:** What are the promotion lifecycle steps from Product Specs through broker Promo Management, and what validation gates the TSS push to Approved?
- **Expected source(s):** `wiki/flows.md` (or `wiki/promotions.md` if flows live there)
- **Correct cited answer:** Correct file + any accurate line range showing the TSS 4-step wizard and the pricing-exists validation before Approved (today: AGENTS.md §6).

## Q6. Multi-brand sheet-view decision source
- **Question:** Which meeting established the multi-brand sheet-view log-entry decision, and what was decided?
- **Expected source(s):** `meetings/notes/` index + originating transcript in `meetings/transcripts/`; `wiki/decisions.md` (§17 D6)
- **Correct cited answer:** Correct file + any accurate line range naming the source meeting and the one-retailer → all-brands-SKU-grid → one-submit decision (today: AGENTS.md §17 D6).

## Q7. Highest Jira ticket number + total count
- **Question:** What is the highest Jira ticket number and the total ticket count in the export?
- **Expected source(s):** `jira/` index (e.g. `jira/README.md` or index file)
- **Correct cited answer:** Correct file + any accurate line range showing the max ticket number and total count (expect CS-1777 / 1,780 per AGENTS.md §16; update if export grows).

## Q8. Transcripts lacking §17 coverage
- **Question:** Which meeting transcripts have no coverage in the consolidated decisions list (§17)?
- **Expected source(s):** `meetings/notes/` index (coverage map); `wiki/decisions.md`
- **Correct cited answer:** Correct file + any accurate line range listing the uncovered transcripts (or stating full coverage if none are missing).

## Q9. Simple Entries bypass D13 status
- **Question:** What is the status of decision D13 (Simple Entries bypass for non-calculated promos)?
- **Expected source(s):** `wiki/decisions.md`; `jira/` CS-1708 (or relevant Simple Entries ticket)
- **Correct cited answer:** Correct file + any accurate line range confirming D13 is APPROVED and its current implementation state per the ticket (today: AGENTS.md §17 D13).

## Q10. Secrets locations + rotation rule
- **Question:** Where do secrets live in this repo and what is the rotation/disclosure rule?
- **Expected source(s):** `.env.example`, `docs/` (security/handover doc)
- **Correct cited answer:** Correct file + any accurate line range stating locations (never values) and the rotation rule. Must never quote secret values.
