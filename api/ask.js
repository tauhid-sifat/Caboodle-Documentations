// Ask Caboodle POC proxy: browser -> same-origin /api/ask -> OpenCode Go.
// Key stays server-side in Vercel env OPENCODE_API_KEY. Never ship it to the client.
// Per https://opencode.ai/docs/go: Muse Spark 1.3 Contributor uses the Responses API at
// https://opencode.ai/zen/go/v1/responses with model id 'muse-spark-1.3-contributor'.
// Go requires an identifying User-Agent plus a stable x-opencode-session header.
// Modes: default polish {question, headline} -> {polished};
// plan {question, kb} -> {plan} (structured query spec for the deterministic executor).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.OPENCODE_API_KEY;
  if (!key) return res.status(500).json({ error: 'OPENCODE_API_KEY not configured' });
  const { question, headline, mode, kb } = req.body || {};
  if (!question || String(question).length > 500) return res.status(400).json({ error: 'bad question' });
  const isPlan = mode === 'plan';
  const input = isPlan
    ? 'You plan data questions for a food-broker demo assistant. Reply with JSON ONLY, no other text: {"intent":"query|greeting|help|unknown","dataset":"mo|promo|cr|apl|item","filters":[{"col":"exact column name","op":"eq|contains|in","value":"string or array"}],"groupBy":"column name or null","metric":"count","chart":"bar|donut|kpi|table|null","showTable":true,"title":"short title","reply":"one-line summary with no numbers"}. Datasets: mo=Market Overview distribution (Brand,Retailer,Banner,Region,Store,DC,SKU,SKU Status,Date), promo=promotions (Brand,Distributor,Retailer,Banner,Product,Event Name,Month,Start Date,End Date,Event Status,SKU Status), cr=category reviews (Region,Retailer,Category,Review Month,Submission Due Date), apl=wholesale costs (Distribution Center Name,Brand Name,Product Description,Unit UPC,Wholesale Case Cost), item=item status (Brand Name,Retailer Name,Banner Name,Product Name,UPC Number,Status). Use ONLY column names from the knowledge base. groupBy=null means return matching rows. Dates in data look like MM/DD/YYYY or month names.'
      + '\nKnowledge base: ' + JSON.stringify(kb || {}).slice(0, 6000) + '\nQuestion: ' + question
    : 'You polish short BI answers for a food-broker demo. One or two sentences, plain language, no invented numbers. The deterministic headline with exact counts is provided and must stay consistent.'
      + '\nQuestion: ' + question + '\nDeterministic result: ' + (headline || 'n/a') + '\nReply with a polished one-sentence version.';
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 25000);
  try {
    const r = await fetch('https://opencode.ai/zen/go/v1/responses', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key, 'User-Agent': 'ask-caboodle-poc/1.0', 'x-opencode-session': 'ask-caboodle-broker-poc' },
      body: JSON.stringify({
        model: process.env.OPENCODE_MODEL || 'muse-spark-1.3-contributor',
        input,
        max_output_tokens: 2000,
        temperature: 0.2
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'opencode ' + r.status, detail: (await r.text()).slice(0, 300) });
    const data = await r.json();
    let text = '';
    const out = data.output;
    if (Array.isArray(out)) {
      for (const item of out) {
        const content = item && item.content;
        if (Array.isArray(content)) {
          for (const c of content) {
            if (c && (c.type === 'output_text' || c.type === 'text') && c.text) text += c.text;
          }
        }
      }
    }
    if (!text && typeof data.output_text === 'string') text = data.output_text;
    text = String(text || '').trim();
    if (isPlan) {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) return res.status(502).json({ error: 'no plan json' });
      let plan;
      try { plan = JSON.parse(m[0]); } catch (e) { return res.status(502).json({ error: 'bad plan json' }); }
      return res.status(200).json({ plan });
    }
    return res.status(200).json({ polished: text.slice(0, 500) });
  } catch (e) {
    return res.status(504).json({ error: 'timeout or upstream error' });
  } finally {
    clearTimeout(t);
  }
}
