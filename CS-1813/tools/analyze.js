// CS-1813 analysis: raw page captures -> route matrix, button inventory, findings summary.
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PAGES = path.join(ROOT, "raw", "pages");
const OUT = path.join(ROOT, "out");
fs.mkdirSync(OUT, { recursive: true });

const ORG = "484fd472-517b-4cdd-99dd-a414f6dc7248";
const BRAND = "e8c90677-0320-41e5-a37f-52a8014c2752";
const B = `https://caboodle-web-stg.caboodleservices.com/${ORG}`;
const BB = `${B}/${BRAND}`;

// id, area, spec route, url, slug, type
const CATALOG = [
  ["BR-01", "Broker", "/dashboard", B + "/dashboard", "Broker/Dashboard", "Dashboard"],
  ["BR-02", "Broker", "/market-overview", B + "/market-overview", "Broker/Market-overview", "Grid listing"],
  ["BR-03", "Broker", "/market-overview-report", B + "/market-overview-report", "Broker/Market-overview-report", "Report"],
  ["BR-04", "Broker", "/distributor-apl", B + "/distributor-apl", "Broker/Distributor-apl", "Grid listing"],
  ["BR-05", "Broker", "/retail-apl", B + "/retail-apl", "Broker/Retail-apl", "Grid listing"],
  ["BR-06", "Broker", "/promotional-management", B + "/promotional-management", "Broker/Promotional-management", "Calendar"],
  ["BR-07", "Broker", "/brand-report", B + "/brand-report", "Broker/Brand-report", "Report"],
  ["BR-08", "Broker", "/category-review", B + "/category-review", "Broker/Category-review", "Listing"],
  ["BR-09", "Broker", "/category-review-calendar", B + "/category-review-calendar", "Broker/Category-review-calendar", "Calendar"],
  ["BR-10", "Broker", "/file-repository", B + "/file-repository", "Broker/File-repository", "Listing"],
  ["BR-11", "Broker", "/brand-report-status-options", B + "/brand-report-status-options", "Broker/Brand-report-status-options", "Unknown"],
  ["GD-01", "Brand / General", "/", BB + "/", "Brand/Root", "Unknown"],
  ["GD-02", "Brand / General", "/dashboard", BB + "/dashboard", "Brand/Dashboard", "Dashboard"],
  ["GD-03", "Brand / General", "/dashboard-ai", BB + "/dashboard-ai", "Brand/Dashboard-ai", "Dashboard"],
  ["GD-04", "Brand / General", "/ask-caboodle", BB + "/ask-caboodle", "Brand/Ask-caboodle", "Chat"],
  ["CR-01", "Brand / CRM", "/contacts", BB + "/contacts", "Brand/Contacts", "Listing"],
  ["CR-02", "Brand / CRM", "/distributors", BB + "/distributors", "Brand/Distributors", "Listing"],
  ["CR-03", "Brand / CRM", "/distributors/[distributorID]", BB + "/distributors/4b766742-8eb3-4a20-9658-97b090b68ab3", "Brand/Distributors-Detail", "Detail"],
  ["CR-04", "Brand / CRM", "/distributors/[deliveryMethodID]/banners", BB + "/distributors/4357bd7a-c490-48cc-a15a-4e773078a35e/banners", "Brand/Distributors-DeliveryMethod-Banners", "Detail"],
  ["CR-05", "Brand / CRM", "/distributors/[distributorID]/banners", BB + "/distributors/4b766742-8eb3-4a20-9658-97b090b68ab3/banners", "Brand/Distributors-Detail-Banners", "Detail"],
  ["CR-06", "Brand / CRM", "/retailers", BB + "/retailers", "Brand/Retailers", "Listing"],
  ["CR-07", "Brand / CRM", "/retailers/all", BB + "/retailers/all", "Brand/Retailers-All", "Listing"],
  ["CR-08", "Brand / CRM", "/retailers/[retailerID]/banners", BB + "/retailers/7ede3986-fce9-410f-aa4e-c6ff79640f5b/banners", "Brand/Retailers-Detail-Banners", "Detail"],
  ["CR-09", "Brand / CRM", "/retailers/all/[retailerID]/banners", BB + "/retailers/all/7ede3986-fce9-410f-aa4e-c6ff79640f5b/banners", "Brand/Retailers-All-Detail-Banners", "Detail"],
  ["CR-10", "Brand / CRM", "/banners", BB + "/banners", "Brand/Banners", "Listing"],
  ["CR-11", "Brand / CRM", "/banners/[bannerID]", BB + "/banners/[bannerID]", null, "Detail"],
  ["CR-12", "Brand / CRM", "/banners/products", BB + "/banners/products", "Brand/Banners-Products", "Listing"],
  ["CR-13", "Brand / CRM", "/regions", BB + "/regions", "Brand/Regions", "Listing"],
  ["CR-14", "Brand / CRM", "/pipeline", BB + "/pipeline", "Brand/Pipeline", "Listing"],
  ["CR-15", "Brand / CRM", "/pipeline/[taskID]", BB + "/pipeline/[taskID]", null, "Detail"],
  ["PS-01", "Brand / Product specs", "/categories", BB + "/categories", "Brand/Categories", "Listing"],
  ["PS-02", "Brand / Product specs", "/categories/[categoryID]", BB + "/categories/e1626a8c-65d9-45f6-9a86-cbdbe4c852ba", "Brand/Categories-Detail", "Detail"],
  ["PS-03", "Brand / Product specs", "/products", BB + "/products", "Brand/Products", "Listing"],
  ["PS-04", "Brand / Product specs", "/products/[productID]", BB + "/products/dd652299-b632-4be8-939a-5bbcecf1b70f", "Brand/Products-Detail", "Detail"],
  ["PS-05", "Brand / Product specs", "/products/[productID]/edit", BB + "/products/dd652299-b632-4be8-939a-5bbcecf1b70f/edit", "Brand/Products-Edit", "Form"],
  ["PS-06", "Brand / Product specs", "/products/add", BB + "/products/add", "Brand/Products-Add", "Form"],
  ["PS-07", "Brand / Product specs", "/pricing", BB + "/pricing", "Brand/Pricing", "Listing"],
  ["PS-08", "Brand / Product specs", "/file-upload", BB + "/file-upload", "Brand/File-upload", "Upload"],
  ["PM-01", "Brand / Promotions", "/promo-planning", BB + "/promo-planning", "Brand/Promo-planning", "Listing"],
  ["PM-02", "Brand / Promotions", "/promo-planning/create", BB + "/promo-planning/create", "Brand/Promo-planning-Create", "Form"],
  ["PM-03", "Brand / Promotions", "/promo-planning/[id]", BB + "/promo-planning/8a7b29ca-6c5d-40cc-9678-8629323ccca1", "Brand/Promo-planning-Detail", "Detail"],
  ["PM-04", "Brand / Promotions", "/promo-planning/[promotionID]", BB + "/promo-planning/cb26db79-130b-4748-b58f-abd2e0fb9967", "Brand/Promo-planning-Detail-B", "Detail"],
  ["PM-05", "Brand / Promotions", "/promotional-calendar", BB + "/promotional-calendar", "Brand/Promotional-calendar", "Calendar"],
  ["PM-06", "Brand / Promotions", "/promotional-notes", BB + "/promotional-notes", "Brand/Promotional-notes", "Listing"],
  ["PM-07", "Brand / Promotions", "/simple-entries", BB + "/simple-entries", "Brand/Simple-entries", "Listing"],
  ["PM-08", "Brand / Promotions", "/simple-entries/create", BB + "/simple-entries/create", "Brand/Simple-entries-Create", "Form"],
  ["PM-09", "Brand / Promotions", "/simple-entries/[id]", BB + "/simple-entries/6c99fbfb-9460-4a8f-aa35-aeed82bfff5e", "Brand/Simple-entries-Detail", "Detail"],
  ["PM-10", "Brand / Promotions", "/trade-spend-sandbox", BB + "/trade-spend-sandbox", "Brand/Trade-spend-sandbox", "Listing"],
  ["PM-11", "Brand / Promotions", "/trade-spend-sandbox/[promotionID]", BB + "/trade-spend-sandbox/8de15aae-a9a3-4dfb-a68b-74f1a3926b7a", "Brand/Trade-spend-sandbox-Detail", "Detail"],
  ["RP-01", "Brand / Reports", "/report", BB + "/report", "Brand/Report", "Report hub"],
  ["RP-02", "Brand / Reports", "/banner-report", BB + "/banner-report", "Brand/Banner-report", "Report"],
  ["RP-03", "Brand / Reports", "/monthly-report", BB + "/monthly-report", "Brand/Monthly-report", "Report"],
  ["RP-04", "Brand / Reports", "/product-report", BB + "/product-report", "Brand/Product-report", "Report"],
  ["RP-05", "Brand / Reports", "/retail-report", BB + "/retail-report", "Brand/Retail-report", "Report"],
  ["RP-06", "Brand / Reports", "/sales-tracker", BB + "/sales-tracker", "Brand/Sales-tracker", "Report"],
  ["RP-07", "Brand / Reports", "/brand-market-overview-report", BB + "/brand-market-overview-report", "Brand/Brand-market-overview-report", "Report"],
  ["RP-08", "Brand / Reports", "/apl-report", BB + "/apl-report", "Brand/Apl-report", "Report"],
  ["RP-09", "Brand / Reports", "/apl-activity", BB + "/apl-activity", "Brand/Apl-activity", "Report"],
  ["RP-10", "Brand / Reports", "/category-review-brand", BB + "/category-review-brand", "Brand/Category-review-brand", "Listing"],
  ["RP-11", "Brand / Reports", "/category-review-calendar-brand", BB + "/category-review-calendar-brand", "Brand/Category-review-calendar-brand", "Calendar"],
  ["DU-01", "Brand / Data upload", "/kehe", BB + "/kehe", "Brand/Kehe", "Upload"],
  ["DU-02", "Brand / Data upload", "/unfi", BB + "/unfi", "Brand/Unfi", "Upload"],
  ["DU-03", "Brand / Data upload", "/spins", BB + "/spins", "Brand/Spins", "Upload"],
  ["DU-04", "Brand / Data upload", "/spins/item-ranking-report", BB + "/spins/item-ranking-report", "Brand/Spins-Item-ranking-report", "Report"],
  ["DU-05", "Brand / Data upload", "/spins/stores-insight-report", BB + "/spins/stores-insight-report", "Brand/Spins-Stores-insight-report", "Report"],
  ["DU-06", "Brand / Data upload", "/distributor-sales-report", BB + "/distributor-sales-report", "Brand/Distributor-sales-report", "Report"],
];

// Observed page headings; several routes render their heading outside an <h1>, so the
// visible page name recorded during the audit is stored here.
const TITLES = {
  "BR-01": "Workspace dashboard (broker)", "BR-02": "Market Overviews", "BR-03": "Market Overviews Report",
  "BR-04": "Distributor APL", "BR-05": "Brand Retail Item Status", "BR-06": "Promotional Management",
  "BR-07": "Brand Report", "BR-08": "Category Review", "BR-09": "Category Review Calendar",
  "BR-10": "File Repository", "BR-11": "404",
  "GD-01": "404", "GD-02": "Brand Dashboard", "GD-03": "AI Assistant", "GD-04": "Ask Caboodle",
  "CR-01": "Contacts", "CR-02": "Distributors", "CR-03": "Distributor detail", "CR-04": "Distributor banners (delivery method)",
  "CR-05": "Distributor banners", "CR-06": "Retailers", "CR-07": "Retailers (all)", "CR-08": "Retailer banners",
  "CR-09": "Retailer banners (all)", "CR-10": "404", "CR-11": "Banner detail (blocked)", "CR-12": "Banners / Products",
  "CR-13": "Regions", "CR-14": "Pipeline", "CR-15": "Pipeline task (blocked)",
  "PS-01": "Categories", "PS-02": "Category detail", "PS-03": "Products", "PS-04": "Product detail",
  "PS-05": "Edit product", "PS-06": "Add product", "PS-07": "Pricing", "PS-08": "File upload",
  "PM-01": "Promo Planning", "PM-02": "Create promotion", "PM-03": "Promotion detail (instance A)",
  "PM-04": "Promotion detail (instance B)", "PM-05": "Promotional Calendar", "PM-06": "Promo Notes",
  "PM-07": "Simple Entries", "PM-08": "Create simple promotion", "PM-09": "Simple entry detail",
  "PM-10": "Trade Spend Sandbox", "PM-11": "Trade spend detail",
  "RP-01": "Reports hub", "RP-02": "Banner Report", "RP-03": "Item Monthly Report",
  "RP-04": "Promoted Case Sales Analysis", "RP-05": "Retail Reports", "RP-06": "Sales Tracker",
  "RP-07": "Brand Market Overview Report", "RP-08": "APL Report", "RP-09": "APL Activity",
  "RP-10": "Category Review (brand)", "RP-11": "Category Review Calendar (brand)",
  "DU-01": "KeHE upload", "DU-02": "UNFI upload", "DU-03": "SPINS upload", "DU-04": "Item Ranking Report",
  "DU-05": "Stores Insight Report", "DU-06": "Distributor Sales Report",
};

const has = (f) => fs.existsSync(f);
const walk = (dir, acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith(".json") && !e.name.startsWith("modal")) acc.push(p);
  }
  return acc;
};

const fnOf = (label) => {
  const l = (label || "").toLowerCase();
  if (/select year|search year/.test(l)) return "Search / year select";
  if (/^search/.test(l)) return "Search";
  if (/^filter/.test(l)) return "Filter";
  if (/export/.test(l)) return "Export";
  if (/delete|remove/.test(l)) return "Delete";
  if (/^edit/.test(l)) return "Edit";
  if (/^add|new |create|^upload$|^import/.test(l)) return "Create / action";
  if (/^save/.test(l)) return "Save";
  if (/cancel|close/.test(l)) return "Cancel";
  if (/^back/.test(l)) return "Back";
  if (/sort/.test(l)) return "Sort";
  if (/previous|next|page \d/.test(l)) return "Pagination";
  if (/apply|reset|clear/.test(l)) return "Filter apply/reset";
  return "";
};

const classify = (it, page) => {
  const r = it.r;
  const vw = 1440;
  const main = page.mainR || { x: 0, y: 0, w: vw, h: 0 };
  const dlg = page.dialog;
  const inDlg = dlg && r.x >= dlg.x - 4 && r.x + r.w <= dlg.x + dlg.w + 4 && r.y >= dlg.y - 4 && r.y + r.h <= dlg.y + dlg.h + 4;
  const anc = it.anc || [];
  const inTablist = anc.some((a) => a.role === "tablist") || it.cls.includes("p-tabview") || /tab/i.test(it.cls) && anc.some(a => /tab/i.test(a.c));
  const inRow = anc.some((a) => a.role === "row" || /ag-row|ag-cell|data-row|row-/.test(a.c));
  const inGrid = page.hasGrid || anc.some((a) => /ag-root|ag-center|p-datatable|table/.test(a.c) || a.role === "grid");
  const isMenu = it.hp === "menu" || it.hp === "dialog";

  // nearest layout ancestor smaller than the viewport
  let align = "inline";
  let container = "";
  for (const a of anc) {
    if (!a.w || a.w <= 0) continue;
    if (a.w >= vw - 2) continue;
    const gapR = a.x + a.w - (r.x + r.w);
    const gapL = r.x - a.x;
    if (gapR <= 28) { align = "right"; container = a.c || a.t; break; }
    if (gapL <= 28) { align = "left"; container = a.c || a.t; break; }
  }
  if (align === "inline") container = (anc[0] && (anc[0].c || anc[0].t)) || "";

  const chrome = r.y < 64;
  const band = chrome ? "App header" : r.y < 340 ? "Page header / toolbar" : "Content";

  let bp;
  if (inTablist) bp = "BP-12";
  else if (inDlg) bp = "BP-10";
  else if (inRow) bp = "BP-07";
  else if (isMenu && !it.l) bp = "BP-14";
  else if (band === "Page header / toolbar" && align === "right") bp = "BP-01";
  else if (band === "Page header / toolbar" && align === "left") bp = "BP-02";
  else if (band === "Page header / toolbar") bp = "BP-03";
  else if (band === "Content" && inGrid) bp = "BP-06";
  else if (band === "Content" && align === "right") bp = "BP-04";
  else if (band === "Content" && align === "left") bp = "BP-05";
  else bp = "BP-13";
  if (chrome) bp = "BP-16";

  return { inDlg: !!inDlg, inRow, inGrid, inTablist, isMenu, align, container, chrome, band, bp };
};

const rows = [];
const inventory = [];
const pageSummaries = [];

for (const [id, area, route, url, slug, type] of CATALOG) {
  const row = { id, area, route, url, slug, type };
  if (!slug) {
    row.status = "Blocked";
    row.note = "No existing record exposes this route; creating one is out of scope for a read-only audit.";
    rows.push(row);
    continue;
  }
  const dir = path.join(PAGES, slug);
  if (!has(dir)) {
    row.status = "Blocked";
    row.note = "Capture missing for this route.";
    rows.push(row);
    continue;
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("modal")).sort();
  const evidence = fs.existsSync(path.join(ROOT, "evidence", slug)) ? fs.readdirSync(path.join(ROOT, "evidence", slug)).filter(f => /\.(jpg|png)$/.test(f)) : [];
  const tabFiles = files.length;
  const pageData = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const first = pageData[0];
  const is404 = (first.text || "").trim().startsWith("404") || (first.h1 || "") === "404";
  const observed = (first.h1 || (first.h2s || [])[0] || first.docTitle || "").trim();
  const title = is404 ? "404" : (TITLES[id] || observed);
  const tabs = (first.tabs || []).map((t) => t.l).filter(Boolean);

  if (is404) {
    row.status = "Blocked";
    row.note = "Route returns the application 404 page in this workspace.";
    row.title = "404";
    rows.push(row);
    continue;
  }

  row.title = title;
  row.status = files.length ? "Inspected" : "Not Started";
  row.tabsIdentified = tabs.length ? tabs.join(" | ") : "None";
  row.tabsInspected = tabs.length ? "All (" + tabs.length + ")" : "n/a";
  row.evidence = evidence.length ? "evidence/" + slug + "/" + evidence[0] : "";

  const headerSeq = [];
  for (let i = 0; i < pageData.length; i++) {
    const page = pageData[i];
    const tabName = files[i].replace(".json", "");
    for (const it of page.items || []) {
      const c = classify(it, page);
      if (c.chrome) continue;
      inventory.push({
        route: url,
        routeId: id,
        area,
        pageTitle: title,
        tab: tabName === "default" ? "Default" : "Tab " + tabName.replace("tab-", ""),
        label: it.l || "(icon only)",
        fn: fnOf(it.l),
        hierarchy: /(primary|btn-primary|bg-brand|bg-blue|bg-primary)/i.test(it.cls) ? "Primary" : it.dis ? "Disabled" : "Secondary",
        bp: c.bp,
        align: c.align,
        relative: c.band,
        sticky: it.st || "no",
        group: c.container,
        x: it.r.x, y: it.r.y, w: it.r.w, h: it.r.h,
        evidence: "evidence/" + slug + "/" + tabName + ".jpg",
      });
      if (c.band === "Page header / toolbar" && !c.isMenu && it.l) {
        headerSeq.push({ label: it.l, fn: fnOf(it.l), x: it.r.x, y: it.r.y, bp: c.bp });
      }
    }
  }
  // ordered header action sequence (same row, by x)
  const byRow = {};
  for (const h of headerSeq) {
    const key = Math.round(h.y / 12);
    (byRow[key] = byRow[key] || []).push(h);
  }
  const topRow = Object.values(byRow).sort((a, b) => a[0].y - b[0].y)[0] || [];
  const seq = topRow.sort((a, b) => a.x - b.x).map((h) => h.label);
  row.headerSequence = seq.join(" > ");
  row.patterns = [...new Set(inventory.filter((v) => v.routeId === id).map((v) => v.bp))].join(" ");
  pageSummaries.push({ id, area, route, type, title, slug, seq, counts: pageData.reduce((n, p) => n + (p.items || []).length, 0) });
  rows.push(row);
}

// consistency: filter / export / action ordering within the header row
const orderFindings = [];
for (const p of pageSummaries) {
  const fns = p.seq.map((l) => ({ l, f: fnOf(l) }));
  const idx = (name) => fns.findIndex((x) => x.f === name);
  const f = idx("Filter"), e = idx("Export"), a = idx("Create / action");
  if (f < 0 && e < 0 && a < 0) continue;
  const parts = [];
  if (a >= 0 && f >= 0 && a < f) parts.push("action before filter");
  if (a >= 0 && e >= 0 && a < e) parts.push("action before export");
  if (e >= 0 && f >= 0 && e < f) parts.push("export before filter");
  orderFindings.push({ id: p.id, route: p.route, type: p.type, seq: p.seq, issues: parts });
}

const csv = (headers, list) =>
  [headers.join(",")].concat(list.map((o) => headers.map((h) => {
    const v = o[h] === undefined || o[h] === null ? "" : String(o[h]);
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }).join(","))).join("\r\n");

// Slot model: every page-level control belongs to exactly one slot and the slots
// have a fixed left-to-right precedence. A page may use any subset; it may not reorder.
// utility < destructive < secondary < action < export < filter
const SLOTS = { utility: 0, destructive: 1, secondary: 2, action: 3, export: 4, filter: 5 };
const slotOf = (label) => {
  const l = (label || "").toLowerCase().trim();
  if (!l) return null;
  if (/^filter|range filter|^reset$|^clear filters?/.test(l)) return "filter";
  if (/export|download/.test(l)) return "export";
  if (/^add|^new |^create|^upload$|^import actuals|^copy$|^import$/.test(l)) return "action";
  if (/^delete|^remove|force delete|delete selected|remove from calendar/.test(l)) return "destructive";
  if (/^sort by$|^sorted|^list view|^grid view|^refresh|^more actions|^expand |^previous|^next|^page |^items per page|^settings|switch sort/.test(l)) return "utility";
  if (/^edit|^link banner|^versions|^resume|^validate|^submit|^revoke|^push to|^view notes|^view comment|^about|^new folder|^select promo|^go to /.test(l)) return "secondary";
  return null;
};

// consistency status per route, measured against the agreed model:
// search / scope far left, then a fixed slot order on the right.
const searchX = {};
const cdir = path.join(ROOT, "raw", "controls");
if (has(cdir)) {
  const walk = (d, acc = []) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, acc); else if (e.name.endsWith(".json")) acc.push(p);
    }
    return acc;
  };
  for (const f of walk(cdir)) {
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    const c = (j.controls || []).find((x) => /search|select year/i.test(x.l || ""));
    if (c) searchX[path.relative(cdir, f).replace(/\\/g, "/").replace(".json", "")] = c.r.x;
  }
}

const consistency = {};
for (const p of pageSummaries) {
  const seq = p.seq || [];
  const slots = seq.map((l) => slotOf(l)).filter(Boolean);
  const problems = [];
  for (let i = 1; i < slots.length; i++) {
    if (SLOTS[slots[i]] < SLOTS[slots[i - 1]]) {
      problems.push("slot order breaks at '" + seq[i] + "' (after '" + seq[i - 1] + "')");
      break;
    }
  }
  const iDel = slots.indexOf("destructive");
  if (iDel >= 0 && slots[iDel + 1] === "action") problems.push("destructive button adjacent to the primary action");
  if (/Listing|Report/.test(p.type || "") && slots.includes("export") && !slots.includes("filter")) problems.push("no Filter in the action row");
  const sx = searchX[p.slug];
  if (sx !== undefined && sx > 150) problems.push("search or scope control not at the left edge (x = " + sx + ")");
  const noCluster = !seq.length;
  consistency[p.id] = problems.length
    ? "Inconsistent: " + problems.join("; ")
    : noCluster
      ? "No page-level actions (nothing to compare)"
      : "Consistent with the agreed order";
}

fs.writeFileSync(path.join(OUT, "route-matrix.csv"), csv(
  ["Route ID", "Platform area", "Route", "Page title", "Page type", "Inspection status", "Tabs identified", "Tabs inspected", "Button patterns found", "Consistency status", "Evidence reference", "Notes"],
  rows.map((r) => ({
    "Route ID": r.id, "Platform area": r.area, Route: r.route, "Page title": r.title || "",
    "Page type": r.type || "", "Inspection status": r.status, "Tabs identified": r.tabsIdentified || "",
    "Tabs inspected": r.tabsInspected || "", "Button patterns found": r.patterns || "",
    "Consistency status": consistency[r.id] || "", "Evidence reference": r.evidence || "", Notes: r.note || "",
  }))
));

fs.writeFileSync(path.join(OUT, "inventory.csv"), csv(
  ["routeId", "area", "route", "pageTitle", "tab", "label", "fn", "hierarchy", "bp", "align", "relative", "sticky", "group", "x", "y", "w", "h", "evidence"],
  inventory
).replace(/^routeId,area,route,pageTitle,tab,label,fn,hierarchy,bp,align,relative,sticky,group,x,y,w,h,evidence/,
  "Route ID,Platform area,Route,Page title,Tab,Button label,Button function,Button hierarchy,Placement classification,Horizontal alignment,Relative position,Sticky or fixed,Related button group,x,y,w,h,Evidence reference"));

fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify({
  routes: rows.length,
  inspected: rows.filter((r) => r.status === "Inspected").length,
  blocked: rows.filter((r) => r.status === "Blocked").length,
  buttons: inventory.length,
  bpCounts: inventory.reduce((m, i) => (m[i.bp] = (m[i.bp] || 0) + 1, m), {}),
  orderFindings,
  pages: pageSummaries,
}, null, 1));

console.log(JSON.stringify({
  routes: rows.length,
  inspected: rows.filter((r) => r.status === "Inspected").length,
  blocked: rows.filter((r) => r.status === "Blocked").length,
  buttons: inventory.length,
  bp: inventory.reduce((m, i) => (m[i.bp] = (m[i.bp] || 0) + 1, m), {}),
  orderIssues: orderFindings.filter((o) => o.issues.length).length,
}, null, 1));
