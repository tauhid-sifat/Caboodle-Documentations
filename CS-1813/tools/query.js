const fs = require("node:fs");
const p = "E:/My Code/Caboodle-Documentations/CS-1813/out/inventory.csv";
const text = fs.readFileSync(p, "utf8");
const lines = text.split(/\r\n/).filter(Boolean);
const parse = (l) => {
  const o = []; let c = ""; let q = false;
  for (const ch of l) {
    if (ch === '"') { q = !q; continue; }
    if (ch === "," && !q) { o.push(c); c = ""; } else c += ch;
  }
  o.push(c); return o;
};
const hdr = parse(lines[0]);
const idx = (n) => hdr.indexOf(n);
const rows = lines.slice(1).map(parse);
const q = (name) => rows.filter((r) => r[idx("fn")] === name);
console.log("rows", rows.length);
console.log("SEARCH", q("Search").length, q("Search / year select").length);
for (const r of q("Search").concat(q("Search / year select"))) {
  console.log(" ", r[idx("routeId")], r[idx("label")].slice(0, 34), "x=" + r[idx("x")], "y=" + r[idx("y")], r[idx("bp")], r[idx("align")]);
}
const byType = {};
for (const r of rows) {
  const k = r[idx("relative")] + " | " + r[idx("bp")] + " | " + r[idx("align")];
  byType[k] = (byType[k] || 0) + 1;
}
console.log("--- band/bp/align ---");
Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(v, k));
console.log("--- export labels ---");
const exported = q("Export").map((r) => r[idx("routeId")] + " '" + r[idx("label")] + "' " + r[idx("bp")] + " x=" + r[idx("x")]);
console.log(exported.length, [...new Set(exported.map(e => e.split(" '")[1]))].slice(0, 12));
console.log("--- filter labels ---");
console.log([...new Set(q("Filter").map((r) => r[idx("routeId")] + " '" + r[idx("label")] + "' " + r[idx("bp")]))].slice(0, 20));
console.log("--- create/action labels top ---");
const c = {};
q("Create / action").forEach((r) => (c[r[idx("label")]] = (c[r[idx("label")]] || 0) + 1));
console.log(Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 25));
console.log("--- delete labels ---");
const d = {};
q("Delete").forEach((r) => (d[r[idx("label")]] = (d[r[idx("label")]] || 0) + 1));
console.log(Object.entries(d).sort((a, b) => b[1] - a[1]).slice(0, 12));
console.log("--- save/cancel ---");
console.log("save", q("Save").length, "cancel", q("Cancel").length, "back", q("Back").length);
console.log(q("Back").map(r => r[idx("routeId")] + " " + r[idx("bp")]).slice(0, 12));
console.log(q("Save").map(r => r[idx("routeId")] + " '" + r[idx("label")] + "' " + r[idx("bp")] + " align=" + r[idx("align")] + " y=" + r[idx("y")]).slice(0, 12));
console.log("--- sticky buttons ---");
const st = rows.filter(r => r[idx("sticky")] !== "no" && r[idx("sticky")]);
console.log(st.length, [...new Set(st.map(r => r[idx("routeId")] + " " + r[idx("sticky")] + " '" + r[idx("label")] + "'"))].slice(0, 20));
console.log("--- primary-styled buttons in header band ---");
const prim = rows.filter(r => r[idx("hierarchy")] === "Primary" && /Page header/.test(r[idx("relative")]));
console.log(prim.length, [...new Set(prim.map(r => r[idx("routeId")] + ":" + r[idx("label")]))].slice(0, 40));
