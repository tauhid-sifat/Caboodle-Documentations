const fs = require("node:fs");
const s = JSON.parse(fs.readFileSync("E:/My Code/Caboodle-Documentations/CS-1813/out/summary.json", "utf8"));
const fn = (l) => {
  const x = (l || "").toLowerCase();
  if (/^filter/.test(x)) return "filter";
  if (/export/.test(x)) return "export";
  if (/delete|remove|force delete/.test(x)) return "delete";
  if (/^add|new |create|upload|import|submit|push to|^validate|resume/.test(x)) return "action";
  if (/^back/.test(x)) return "back";
  if (/sort|list view|grid view|previous|next/.test(x)) return "utility";
  return "other";
};
const TARGET = { action: 0, export: 1, filter: 2 };
let ok = 0, bad = 0;
const badList = [], okList = [], noFilter = [];
for (const p of s.pages) {
  const seq = (p.seq || []).map(fn);
  const idx = [];
  ["action", "export", "filter"].forEach((f) => { const i = seq.indexOf(f); if (i >= 0) idx.push([f, i]); });
  if (idx.length < 2) continue;
  const ordered = idx.sort((a, b) => a[1] - b[1]).map((x) => x[0]);
  const monotone = ordered.every((v, k) => k === 0 || TARGET[v] > TARGET[ordered[k - 1]]);
  if (ordered.indexOf("filter") < 0) noFilter.push(p.id + ": " + (p.seq || []).join(" > "));
  if (monotone) { ok++; okList.push(p.id + ": " + (p.seq || []).join(" > ")); }
  else { bad++; badList.push(p.id + ": " + (p.seq || []).join(" > ")); }
}
console.log("MATCHES Action > Export > Filter:", ok);
okList.forEach((l) => console.log("  ok ", l.slice(0, 96)));
console.log("\nCONFLICTS:", bad);
badList.forEach((l) => console.log("  bad", l.slice(0, 96)));
console.log("\nno Filter in row:", noFilter.length);
noFilter.forEach((l) => console.log("  ", l.slice(0, 96)));
