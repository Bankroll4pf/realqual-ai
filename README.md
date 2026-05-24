# RealQual AI - Real Estate Lead Qualification Agent

A production-ready MVP for real estate sales teams. Agents submit a lead, the backend asks OpenAI to return a compliant structured qualification, and every lead is saved for dashboard review.

## Features

- Next.js App Router with TypeScript
- Lead intake form for buyer, seller, renter, and investor leads
- API route with validation and error handling
- OpenAI Responses API qualification with structured JSON output
- Fair Housing compliance guardrails in the system prompt
- Supabase storage when configured
- Local JSON storage fallback for development
- Dashboard table with score, temperature, summary, and next action

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The app works without `OPENAI_API_KEY` by returning a manual fallback qualification. Add an API key for real AI scoring.

## Environment Variables

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_LEADS_TABLE=leads
```

`OPENAI_MODEL` defaults to `gpt-4.1-mini`. The implementation uses the OpenAI Responses API with JSON Schema structured output.

## Supabase Setup

If Supabase variables are present, the app writes to Supabase. Otherwise it writes to `data/leads.json`.

Create a `leads` table with this SQL:

```sql
create table if not exists leads (
  id text primary key,
  "createdAt" timestamptz not null,
  "fullName" text not null,
  email text not null,
  phone text not null,
  "leadType" text not null,
  "targetArea" text not null,
  "budgetOrValue" text not null,
  timeline text not null,
  "preApprovalStatus" text not null,
  "workingWithAgent" text not null,
  notes text not null default '',
  summary text not null,
  "qualifiedLeadType" text not null,
  temperature text not null check (temperature in ('hot', 'warm', 'cold')),
  score integer not null check (score >= 0 and score <= 100),
  reasoning text not null,
  "recommendedNextAction" text not null,
  "agentMessage" text not null,
  "complianceNotes" text not null
);
```

Use the service role key only on the server. Do not expose it to the browser.

## Google Forms Setup

Google Forms cannot post directly to a local `127.0.0.1` app. Deploy this app first, then use the included `google-apps-script.js` from the Google Sheet connected to your Form.

1. Deploy the app to Vercel or another public host.
2. Set `GOOGLE_FORM_WEBHOOK_SECRET` in your deployed app.
3. Open the Google Sheet receiving Form responses.
4. Go to `Extensions > Apps Script`.
5. Paste the contents of `google-apps-script.js`.
6. Replace `WEBHOOK_URL` with `https://your-domain.com/api/google-form-webhook`.
7. Replace `WEBHOOK_SECRET` with the same value as `GOOGLE_FORM_WEBHOOK_SECRET`.
8. In Apps Script, add a trigger:
   - function: `onFormSubmit`
   - event source: `From spreadsheet`
   - event type: `On form submit`

The webhook maps common Google Form headers to the lead fields. Recommended Google Form question titles:

- Full name
- Email
- Phone
- Lead type
- Target city/area
- Budget or estimated property value
- Timeline
- Pre-approval status
- Currently working with an agent
- Notes

When the webhook returns a result, the Apps Script writes these columns back to the submitted row:

- AI Summary
- AI Lead Type
- AI Score
- AI Temperature
- AI Reasoning
- AI Recommended Next Action
- AI Agent Message
- AI Qualified At
- AI Error

## Fair Housing Guardrails

The AI prompt instructs the model not to qualify, reject, rank, score, recommend, or infer suitability based on protected characteristics, including race, color, national origin, religion, sex, sexual orientation, gender identity, familial status, disability, age, source of income, veteran status, or protected classes under local law.

The model is instructed to use only business-relevant factors such as:

- stated timeline
- financing or pre-approval readiness
- budget or property value clarity
- stated property intent
- contactability
- current agent relationship
- requested next step

## API

### `POST /api/leads`

Accepts:

```json
{
  "fullName": "Avery Morgan",
  "email": "avery@example.com",
  "phone": "512-555-0184",
  "leadType": "buyer",
  "targetArea": "Austin, TX",
  "budgetOrValue": "$725,000",
  "timeline": "0-30 days",
  "preApprovalStatus": "pre-approved",
  "workingWithAgent": "no",
  "notes": "Relocating for work and wants private showings this weekend."
}
```

Returns:

```json
{
  "lead": {
    "id": "uuid",
    "createdAt": "2026-05-24T00:00:00.000Z",
    "summary": "Concise lead summary",
    "qualifiedLeadType": "buyer",
    "temperature": "hot",
    "score": 91,
    "reasoning": "Scored from near-term timeline, financing readiness, and clear location interest.",
    "recommendedNextAction": "Call within five minutes and book a showing consult.",
    "agentMessage": "Thanks for reaching out. I can help you compare options and plan next steps.",
    "complianceNotes": "No protected characteristics were used."
  }
}
```

### `GET /api/leads`

Returns all saved leads, newest first.

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
npm run lint
```
