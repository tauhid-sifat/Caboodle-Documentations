# CS-1813 audit state

Working notes for the button placement audit. Resumable.

## What this folder contains

| Path | Contents |
|---|---|
| `raw/pages/<Area>/<Page>/<tab>.json` | Raw DOM capture per route and tab: heading, control rectangles, ancestor layout containers, sticky flags |
| `raw/controls/<Area>/<Page>.json` | Search, scope and select control positions per listing page |
| `evidence/<Area>/<Page>/<tab>.jpg` | Full-page screenshot, 1440 x 900 viewport, scroll height capped at 1,600 px |
| `tools/sink.js` | Local HTTP sink on 127.0.0.1:8787 that receives captures from the browser page |
| `tools/analyze.js` | Builds `out/route-matrix.csv`, `out/inventory.csv`, `out/summary.json` from the raw captures |
| `tools/query.js`, `tools/stats.js`, `tools/findings.js`, `tools/peek.js`, `tools/check.cjs` | Ad hoc queries used while writing the report |
| `out/` | Generated CSVs and summary JSON |

Deliverables live in the repository root:

- `CS-1813-Button-Placement-Audit.md`
- `CS-1813-Route-Inspection-Matrix.csv`
- `CS-1813-Button-Inventory.csv`
- `CS-1813-Button-Placement-Standard.md`

## How the capture worked

The browser session ran with a 1440 x 900 viewport. For each route the page extracted its own control geometry and POSTed the JSON to the local sink, then the session captured a full-page PNG/JPEG through CDP and POSTed it to the same sink. That kept large payloads out of the agent context and left a verifiable artefact on disk for every route.

Tab handling: the capture loop reads `[role=tab]`, clicks each tab by index, and repeats the capture for that tab before moving on. Tabs found: Promotional Management (4), Retail Reports (2). All inspected.

## Regenerating the deliverables

```
node CS-1813/tools/sink.js      # only needed to recapture
node CS-1813/tools/analyze.js   # rebuilds out/*.csv and out/summary.json
```

Then copy `out/route-matrix.csv` to `CS-1813-Route-Inspection-Matrix.csv` and `out/inventory.csv` to `CS-1813-Button-Inventory.csv`.

## Target order used for scoring

The Jira description and the Jira comment state different orders. The audit scores every page against the comment (3 Nov): **Search / scope far left, then Action, Export, Filter on the right, Filter right-most**. `tools/order.cjs` recomputes the compliance from `out/summary.json`; the per-route verdict is the `Consistency status` column of the matrix.

If the description's order (Search, Filter, Export, Action) is instead the agreed one, reverse the ranking in `tools/analyze.js` (`rank` map) and rerun, and invert R2 in the standard.

## Status

- Static routes captured: 52 of 52
- Dynamic route instances captured: 12 (distributor detail, distributor banners, delivery-method banners, retailer banners, retailer-all banners, category detail, product detail, product edit, promotion detail x2, simple entry detail, trade spend detail)
- Extra capture: Promo Notes `Add New Note` click (opened an inline draft row, not a modal). Page reloaded without saving; no record written.
- Blocked: BR-11, GD-01, CR-10, CR-11, CR-15 (see route matrix)
- Not captured: any modal or drawer footer, because none could be opened without initiating a write

## To resume

1. Start the sink: `node CS-1813/tools/sink.js`
2. Open a browser tab already authenticated against the staging platform.
3. Seed `localStorage.__cs1813` with `{routes:[{u,p,st:"pending"}]}` on the app origin.
4. Run the capture loop (see the commit history of `tools/analyze.js` for the exact inline runner used).
5. Re-run `analyze.js`.

Credentials are not stored in this folder or anywhere in the repository.
