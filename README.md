## PolicyPilot

Minimal insurance guidance app. Hybrid analysis that prefers an LLM (OpenAI Responses API) and gracefully falls back to a deterministic rules engine. Frontend is Vite + React + TypeScript + Tailwind. LLM calls are handled by a serverless function.

### Tech stack
- **Frontend**: Vite, React, TypeScript, Tailwind CSS
- **LLM backend**: Vercel serverless function at `api/analyze.ts`
- **LLM API**: OpenAI Responses API with structured outputs (JSON Schema or JSON object)

### How it works
- **Primary path**: `src/utils/analysisEngine.ts` posts `{ systemPrompt, userJson }` to `/api/analyze`.
- **Serverless**: `api/analyze.ts` calls OpenAI Responses API and enforces structured JSON output.
  - Uses `text.format` with JSON Schema by default (can be toggled off).
  - Falls back automatically to `json_object` text format when the schema isn’t supported.
  - Ensures the word "json" appears in the prompt/input to satisfy provider checks.
- **Fallback**: If the API fails or is not configured, it returns results from the built‑in rules engine.

### Types / Contract
- Input (Intake) fields are defined in `src/types.ts` (e.g., `age`, `household`, `income_range`, `employment`, `assets`, `existing_policies`, `notes`).
- Output (Response) shape is also in `src/types.ts`:
  - `humanSummary: string`
  - `json: { overlap, gap, priority_review[], assumptions[], not_validated[], disclaimer }`

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (only needed in the deployment environment or when running serverless locally)

### Installation
```bash
npm install
```

### Running locally
There are two simple ways to run locally:

1) Minimal (rules fallback):
- Start the app; LLM calls will fallback to rules if no serverless is available.
```bash
npm run dev
```

2) Use the deployed serverless function from local dev (recommended):
- Create `.env.local` at the project root with your deployed domain:
```bash
VITE_DEV_API_PROXY_TARGET=https://<your-vercel-domain>
```
- Start the dev server:
```bash
npm run dev
```
- All local `/api/*` requests will proxy to your deployed Vercel function.

Optional: run serverless locally with Vercel
```bash
npm i -g vercel
vercel dev
```

### Environment variables
- App (frontend) optional:
  - `VITE_LLM_API_URL` (override; defaults to `/api/analyze`)
  - `VITE_DEV_API_PROXY_TARGET` (local dev only; proxy `/api` to deployed domain)
- Serverless (Vercel function):
  - `OPENAI_API_KEY` (required)
  - `OPENAI_MODEL` (e.g., `gpt-4o-mini`, or another Responses-capable model)
  - `OPENAI_USE_JSON_SCHEMA` (optional, default `true`): set to `false` to force simple JSON object outputs
  - `OPENAI_TEMPERATURE` (optional)

### Deploying to Vercel (free tier friendly)
1) Push this repo to GitHub.
2) Import into Vercel.
3) In Vercel → Project → Settings → Environment Variables, set:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - (optional) `OPENAI_USE_JSON_SCHEMA=true`
4) Deploy. The frontend will call `/api/analyze` in the same project.

### API contract and testing
- Endpoint: `POST /api/analyze`
- Request body:
```json
{
  "systemPrompt": "...",
  "userJson": { "age": 30, "household": 2, "assets": ["car","renting"], "existing_policies": ["auto state-min"], "notes": "..." }
}
```
- Response: JSON matching the `Output` type (see `src/types.ts`).

Quick test with curl (deployed):
```bash
curl -s -X POST https://<your-vercel-domain>/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"systemPrompt":"ping","userJson":{"age":30}}' | jq .
```

### Troubleshooting
- **Local 404 for `/api/*`**: add `VITE_DEV_API_PROXY_TARGET=https://<your-vercel-domain>` in `.env.local` and restart `npm run dev`.
- **405/OPTIONS or CORS errors**: the function already supports OPTIONS and CORS. Ensure you are POSTing JSON to `/api/analyze`.
- **OpenAI errors (unsupported parameter/format)**: the function automatically falls back from JSON Schema to a plain JSON object text format. Ensure `OPENAI_MODEL` supports the Responses API and structured outputs.
- **502 from function**: check Vercel deployment logs; verify `OPENAI_API_KEY` is set.

### Notes on structured outputs
- Primary mode: Responses API with `text.format` structured outputs.
- JSON Schema is stricter; if your model rejects it, the function retries with `json_object`.

### License
No license specified. Add one if you plan to distribute.


