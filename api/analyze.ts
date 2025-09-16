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

  const policyPilotJsonSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      humanSummary: { type: 'string' },
      json: {
        type: 'object',
        additionalProperties: false,
        properties: {
          overlap: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              reason: { type: 'string' },
              what_to_verify: { type: 'array', items: { type: 'string' } }
            },
            required: ['title', 'reason', 'what_to_verify']
          },
          gap: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              reason: { type: 'string' },
              suggested_next_step: { type: 'string' }
            },
            required: ['title', 'reason', 'suggested_next_step']
          },
          priority_review: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                coverage: { type: 'string' },
                why: { type: 'string' }
              },
              required: ['coverage', 'why']
            }
          },
          assumptions: { type: 'array', items: { type: 'string' } },
          not_validated: { type: 'array', items: { type: 'string' } },
          disclaimer: { type: 'string' }
        },
        required: ['overlap', 'gap', 'priority_review', 'assumptions', 'not_validated', 'disclaimer']
      }
    },
    required: ['humanSummary', 'json']
  } as const;

  try {
    const useJsonSchema = (process.env.OPENAI_USE_JSON_SCHEMA ?? 'true') !== 'false';
    const instructionsWithJson = `${systemPrompt}\n\nPlease respond with json only, no markdown or prose.`;
    const inputWithJsonLead = `Respond with json. User intake JSON follows.\n${JSON.stringify(userJson)}`;

    const payload: any = {
      model,
      instructions: instructionsWithJson,
      input: inputWithJsonLead,
      text: {
        format: useJsonSchema
          ? { type: 'json_schema', json_schema: { name: 'PolicyPilotOutput', schema: policyPilotJsonSchema, strict: true } }
          : { type: 'json_object' }
      }
    };
    if (process.env.OPENAI_TEMPERATURE) {
      const t = Number(process.env.OPENAI_TEMPERATURE);
      if (!Number.isNaN(t)) payload.temperature = t;
    }

    let openaiRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      try {
        const errJson = JSON.parse(errText);
        const msg: string = errJson?.error?.message || '';
        // If schema or text.format rejected, fallback to simple JSON object format
        const shouldFallback = msg.includes('json_schema') || msg.includes('text.format') || msg.includes('response_format');
        if (shouldFallback) {
          const fallbackPayload: any = { ...payload, text: { format: { type: 'json_object' } } };
          openaiRes = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(fallbackPayload),
          });
          if (!openaiRes.ok) {
            const secondErr = await openaiRes.text();
            return res.status(502).json({ error: 'OpenAI error', details: secondErr });
          }
        } else {
          return res.status(502).json({ error: 'OpenAI error', details: errText });
        }
      } catch {
        return res.status(502).json({ error: 'OpenAI error', details: errText });
      }
    }

    const data = await openaiRes.json();
    // Prefer convenience field if present
    let textOut: any = (data && (data.output_text ?? data?.output?.[0]?.content?.find((c: any) => c?.type === 'output_text' || c?.type === 'text')?.text ?? data?.output?.[0]?.content?.[0]?.text)) || null;
    let jsonOut: any = data?.output?.[0]?.content?.find((c: any) => c?.type === 'json')?.json ?? null;

    if (!textOut && !jsonOut) {
      return res.status(502).json({ error: 'OpenAI returned no content' });
    }

    if (jsonOut) {
      return res.status(200).json(jsonOut);
    }

    let parsed: any;
    try {
      parsed = typeof textOut === 'string' ? JSON.parse(textOut) : textOut;
    } catch (e: any) {
      return res.status(502).json({ error: 'Invalid JSON from model', content: textOut });
    }

    return res.status(200).json(parsed);
  } catch (e: any) {
    return res.status(500).json({ error: 'LLM request failed', details: e?.message || String(e) });
  }
}


