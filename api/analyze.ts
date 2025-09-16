export default async function handler(req: any, res: any) {
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS, GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  }

  let body: any;
  try {
    body = req.body ?? {};
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { systemPrompt, userJson } = body;
  if (!systemPrompt || !userJson) {
    return res.status(400).json({ error: 'Missing systemPrompt or userJson' });
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const schemaHint = `Respond with strict JSON only, no markdown. Shape:\n{
  "humanSummary": "string",
  "json": {
    "overlap": {"title": "string", "reason": "string", "what_to_verify": ["string"]},
    "gap": {"title": "string", "reason": "string", "suggested_next_step": "string"},
    "priority_review": [{"coverage": "string", "why": "string"}],
    "assumptions": ["string"],
    "not_validated": ["string"],
    "disclaimer": "string"
  }
}`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        temperature: 0.2,
        messages: [
          { role: 'system', content: `${systemPrompt}\n\n${schemaHint}` },
          { role: 'user', content: JSON.stringify(userJson) },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return res.status(502).json({ error: 'OpenAI error', details: errText });
    }

    const data = await openaiRes.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: 'OpenAI returned no content' });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e: any) {
      return res.status(502).json({ error: 'Invalid JSON from model', content });
    }

    return res.status(200).json(parsed);
  } catch (e: any) {
    return res.status(500).json({ error: 'LLM request failed', details: e?.message || String(e) });
  }
}


