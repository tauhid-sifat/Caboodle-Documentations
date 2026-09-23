// Ask Caboodle POC proxy: browser -> same-origin /api/ask -> OpenCode inference.
// Key stays server-side in Vercel env OPENCODE_API_KEY. Never ship it to the client.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.OPENCODE_API_KEY;
  if (!key) return res.status(500).json({ error: 'OPENCODE_API_KEY not configured' });
  const { question, headline } = req.body || {};
  if (!question || String(question).length > 500) return res.status(400).json({ error: 'bad question' });
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 25000);
  try {
    const r = await fetch('https://opencode.ai/inference/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: process.env.OPENCODE_MODEL || 'Muse Spark 1.3 Contributor',
        messages: [
          { role: 'system', content: 'You polish short BI answers for a food-broker demo. One or two sentences, plain language, no invented numbers. The deterministic headline with exact counts is provided and must stay consistent.' },
          { role: 'user', content: 'Question: ' + question + '\nDeterministic result: ' + (headline || 'n/a') + '\nReply with a polished one-sentence version.' }
        ],
        max_tokens: 120,
        temperature: 0.2
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'opencode ' + r.status, detail: (await r.text()).slice(0, 300), keyLen: key.length, keyPrefix: key.slice(0, 4) });
    const data = await r.json();
    const polished = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return res.status(200).json({ polished: (polished || '').trim().slice(0, 500) });
  } catch (e) {
    return res.status(504).json({ error: 'timeout or upstream error' });
  } finally {
    clearTimeout(t);
  }
}
