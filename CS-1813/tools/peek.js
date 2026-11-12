const fs = require("node:fs");
const base = "E:/My Code/Caboodle-Documentations/CS-1813/raw/pages/";
const show = (slug) => {
  const f = base + slug + "/default.json";
  const d = JSON.parse(fs.readFileSync(f, "utf8"));
  console.log("\n=== " + slug + " | title:", (d.h1 || (d.h2s || [])[0] || "").slice(0, 50), "| grid:", d.hasGrid, "| scrollH:", d.scrollH);
  console.log("text:", (d.text || "").slice(0, 180));
  d.items.forEach((i) => {
    if (!i.l) return;
    console.log("  ", String(i.r.x).padStart(4), String(i.r.y).padStart(5), String(i.r.w).padStart(3), i.l.slice(0, 44).padEnd(44), i.cls.slice(0, 40));
  });
};
["Brand/Products-Add", "Brand/Products-Edit", "Brand/Simple-entries-Create", "Brand/Promo-planning-Create"].forEach(show);
