# Calrix — Technical Reference

## 🛠️ Under the hood

Calrix is a modern, full-stack TypeScript application.

| Layer                          | Technology                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------- |
| **Framework**                  | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| **Language**                   | TypeScript                                                                      |
| **Auth**                       | [Better Auth](https://www.better-auth.com/) with Google sign-in                 |
| **Database**                   | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/)                           |
| **Background jobs & realtime** | [Inngest](https://www.inngest.com/) (triage pipelines, live notifications)      |
| **Gmail & Calendar**           | [Corsair](https://corsair.dev/) integrations                                    |
| **AI**                         | [Vercel AI SDK](https://sdk.vercel.ai/) + OpenAI models                         |
| **Caching & rate limiting**    | Redis (ioredis) + rate-limiter-flexible                                         |
| **UI**                         | MUI, Radix UI, shadcn/ui, Tailwind CSS, Motion                                  |
| **State & data**               | Zustand, TanStack Query                                                         |

### How triage works

#### 1. Email reception

Calrix integrates with Gmail via Corsair webhooks. When a message lands in the primary inbox the `messageChanged` hook fires immediately, filtering out SPAM, PROMOTIONS, and non-primary labels. This emits an Inngest `email/received` event carrying `{ userId, messageId }`, which kicks off real-time classification. Everything outside the primary inbox is ignored.

#### 2. Classification

Each email is passed to the triage classifier prompt (`src/server/ai/prompts/triage-classifier.prompt.ts`), which produces:

| Field             | Values / format                                               |
| ----------------- | ------------------------------------------------------------- |
| **category**      | `reply` · `approval` · `meeting` · `informational`           |
| **urgency**       | `critical` (needs action today) · `high` (24–48 h) · `normal` |
| **deadline**      | ISO 8601 date string — only if the sender stated one explicitly |
| **suggestedAction** | One short imperative sentence ("Reply to confirm Friday slot") |
| **aiSummary**     | 1–2 sentence plain-English gist of the thread                |

- **`reply`** — sender explicitly expects a written response
- **`approval`** — sender asks to approve, reject, or sign off on something
- **`meeting`** — invite, scheduling request, or calendar ask
- **`informational`** — no action needed (receipt, notification, newsletter)

`critical` urgency is set when the email contains explicit urgent/ASAP/emergency language or a same-day deadline. Classification is also shaped by the user's configured urgency signals (VIP senders, money/contracts, deadlines, scheduling, tasks, replies) from their settings.

#### 3. Autonomy scoring

A second prompt (`src/server/ai/prompts/triage-autonomy.prompt.ts`) evaluates how safely Calrix can act without asking, producing one of three levels:

| Level              | Meaning                                                         | Examples                                              |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------- |
| **`auto_safe`**    | Act immediately, no review needed                               | Declining an unavailable slot, "got it" acknowledgements, nudging your own thread |
| **`needs_review`** | Draft is ready but user should glance before sending            | Most replies, approval responses, meeting accepts     |
| **`needs_approval`** | Hard gate — user must explicitly approve before anything sends | Money / contracts / legal, commitments, first contact with unknown senders |

The scorer also returns up to three plain-language `riskFactors` explaining what influenced the decision.

#### 4. Real-time vs. batch

- **Critical / high-urgency items** are pushed to the dashboard the moment the Inngest function completes.
- **Normal-urgency items** are batched and processed during the daily inbox sweep, which pulls all recent primary mail, re-ranks by urgency, scores autonomy, and pre-drafts replies for actionable threads.

#### 5. Follow-up tracking

Every outbound email that expects a reply is watched. Inngest tracks the sent thread and surfaces it in one of two states:

- **Waiting** — no reply received yet, but still within a reasonable window
- **Overdue** — past the deadline or gone quiet for too long based on the user's `followUpSensitivity` setting (`minimal` · `balanced` · `aggressive`)

#### 6. Action items

Everything — newly classified emails, pre-drafted replies, overdue follow-ups — lands in a single prioritized action list backed by Postgres. Each item carries its category, urgency, autonomy level, AI summary, suggested action, and (if applicable) a pre-composed draft ready for one-click review and send.

---

## 🚀 Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database
- Redis
- Google OAuth credentials (for Gmail + Calendar)
- An OpenAI API key

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in your keys

# 3. Set up the database
npm run db:push              # apply schema
npm run db:reset             # (optional) seed sample data

# 4. Run the app
npm run dev                  # Next.js dev server
npm run dev:inngest          # Inngest dev server (background jobs)
```

The app runs at **http://localhost:3000**.

### Handy scripts

| Command               | What it does                       |
| --------------------- | ---------------------------------- |
| `npm run dev`         | Start the Next.js dev server       |
| `npm run dev:inngest` | Start the local Inngest dev server |
| `npm run build`       | Production build                   |
| `npm run start`       | Run the production build           |
| `npm run lint`        | Lint the codebase                  |
| `npm run db:generate` | Generate Drizzle migrations        |
| `npm run db:migrate`  | Run migrations                     |
| `npm run db:push`     | Push the schema to your database   |
| `npm run db:studio`   | Open Drizzle Studio                |
| `npm run db:reset`    | Seed the database                  |
