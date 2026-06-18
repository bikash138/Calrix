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

### Inngest pipelines

Calrix runs three distinct Inngest background functions. Each is independently triggered and handles a specific concern.

---

#### Pipeline 1 — Real-time urgent email (`email-received`)

**Trigger:** `email/received` event, emitted by the Gmail webhook (`/api/gmail/webhook`) the moment a new message arrives.

**Purpose:** Catch critical emails as they land and surface them immediately — without waiting for the next full sweep.

**Steps:**

1. **Fetch & gate** — Fetches the message metadata from Gmail. Checks `labelIds` against a blocklist (`NON_PRIMARY_LABELS`: SPAM, PROMOTIONS, SOCIAL, UPDATES, FORUMS). If the message isn't in `INBOX` or is in any non-primary label, the function exits early — `{ skipped: true }`.

2. **Classify** — Runs the triage classifier prompt (`triage-classifier.prompt.ts`) via `gpt-4o-mini` with structured output. Produces:

   | Field             | Values                                                        |
   | ----------------- | ------------------------------------------------------------- |
   | `category`        | `reply` · `approval` · `meeting` · `informational`           |
   | `urgency`         | `critical` · `high` · `normal`                               |
   | `deadline`        | ISO 8601 date string or `null`                               |
   | `suggestedAction` | One short imperative sentence                                 |
   | `aiSummary`       | 1–2 sentence plain-English gist                              |

3. **Early exit for non-critical** — If the email is `informational`, `high`, or `normal` urgency, the function stops: `{ skipped: true, reason: "deferred to batch" }`. Only `critical` emails proceed.

4. **Autonomy score** — Runs a second prompt (`triage-autonomy.prompt.ts`) to determine how safely Calrix can act without asking. Returns one of:

   | Level             | Meaning                                                       |
   | ----------------- | ------------------------------------------------------------- |
   | `needs_review`    | Draft ready — user should glance before sending              |
   | `needs_approval`  | Hard gate — user must explicitly approve before anything sends|

   Also returns up to three plain-language `riskFactors` explaining what influenced the decision.

5. **Persist** — Upserts the action item into `action_items` (Postgres). On conflict by `(userId, messageId)`, updates urgency, summary, suggested action, autonomy, and risk factors.

6. **Notify** — Publishes to the Inngest Realtime channel `urgent-email:{userId}`. The frontend `useUrgentEmails` hook is subscribed to this channel and triggers the notification bell immediately.

**Concurrency:** Max 5 concurrent executions per `userId` to avoid Gmail API rate limits.

---

#### Pipeline 2 — Full inbox sweep (`triage-user`)

**Trigger:** `triage/user.requested` event, fired either by the manual sync button (`POST /api/actions/triage`) or a scheduled job.

**Purpose:** Process the entire inbox window since the last completed run — classify, score, draft replies, check calendar availability, and update follow-up tracking.

**Steps:**

1. **Fetch emails** — Queries Postgres for the `finishedAt` timestamp of the last completed triage run. Falls back to 24 hours ago if none exists. Fetches in parallel:
   - `in:inbox category:primary after:{unix}` — up to 20 messages
   - `in:sent after:{unix}` — up to 10 messages

   Publishes a `progress-started` realtime event so the UI can show a live progress bar.

2. **Batch classify** — Sends all inbox messages in a single prompt call to `gpt-4o-mini` using structured output. Filters out `informational` items — only `reply`, `approval`, and `meeting` categories proceed. Publishes `progress-classifying` with the email count.

3. **Autonomy scoring** — Runs the autonomy prompt across all classified items in a single batch call. Produces `autonomy`, `autonomyReason`, and `riskFactors` for each.

4. **Calendar-aware context for meeting items** — For every email categorised as `meeting`, runs a third prompt (`meeting-extractor.prompt.ts`) to determine:
   - Whether the sender proposed a concrete time (`hasConcreteTime`)
   - Duration in minutes (`durationMins`, defaults to 30)
   - Any proposed time slots (`slots`)

   Then calls `checkAvailability` or `findFreeSlots` against the user's Google Calendar (respecting their configured timezone, work hours, and meeting buffer). The result — either a confirmed free slot, a list of conflict names + alternatives, or a set of open slots to propose — is stored as a `MeetingContext` and injected into the draft reply for that item.

5. **Pre-draft replies** — For every actionable item, calls `gpt-4o-mini` with the email composer prompt (`email-composer.prompt.ts`), passing the user's name, email signature, and the meeting context (if applicable). Strips markdown from the output for clean plain-text drafts. Publishes `progress-drafting`.

6. **Derive waiting / overdue** — Loads all open `thread_tracking` rows for the user (sent threads still expecting a reply). For each:
   - If the thread received an incoming message in this run → mark for fulfillment.
   - If `dueDate` has passed or `lastSentAt` is older than 3 days → categorise as `OVERDUE` (urgency: `HIGH`).
   - Otherwise → categorise as `WAITING` (urgency: `NORMAL`).

7. **Persist** — In a single step:
   - Upserts action items for all reply/approval/meeting drafts (deduped by `messageId`).
   - Upserts action items for all waiting/overdue threads.
   - Upserts `thread_tracking` rows for each sent email in this window (keeps only the most recent send per thread to avoid Postgres conflict key collisions).
   - Marks threads where a reply arrived this run as `FULFILLED`.

8. **Complete** — Publishes `progress-completed` with counts of actionable, waiting, and overdue items. Writes a `triage_runs` row with `status: COMPLETED` and `finishedAt`.

**Failure handling:** If any step throws, an `onFailure` handler publishes `progress-failed` to the realtime channel so the UI can show an error state rather than spinning indefinitely.

---

#### Pipeline 3 — Contact sync (`contacts-sync`)

**Trigger:** `contacts/sync` event, fired once after onboarding completes and re-fired on each manual sync.

**Purpose:** Build and maintain a contact book of real humans the user has emailed — used by the AI agent for name-to-email resolution in chat.

**Steps:**

1. **Resolve self** — Fetches the authenticated user's own email address from Postgres. Used to filter self-sends out of the harvest.

2. **List sent mail** — Fetches message IDs from the `SENT` label. Scan depth scales with the user's onboarding `volume` preference:

   | Volume setting   | Messages scanned |
   | ---------------- | ---------------- |
   | Under 20/day     | 25               |
   | 20–50/day        | 50               |
   | 50–100/day       | 100              |
   | Over 100/day     | 200              |

3. **Harvest recipients** — For each message, fetches metadata and extracts all `To` and `Cc` addresses using `parseAddressList`. Each address is passed through `isHarvestableContact`, which rejects:
   - The user's own email
   - Addresses containing `noreply`, `no-reply`, `mailer-daemon`, `postmaster`, `donotreply`
   - Addresses from common automated domains (`notifications.`, `bounce.`, `mail.`, etc.)

4. **Upsert contacts** — Calls `contactsRepo.upsertMany`. On conflict by `(userId, email)`:
   - Keeps the richer (longer) display name.
   - Increments `interactionCount`.
   - Updates `lastSeenAt`.

**Concurrency:** Max 3 concurrent executions per `userId`.

---

### Contact memory & search

Contacts are stored in the `contacts` table with `name`, `email`, `interactionCount`, `lastSeenAt`, and `source` (`gmail_harvest`).

Search is exposed via `GET /api/contacts/search?q=` and used in two places:
- The chat input's `@mention` autocomplete (`useContactMentions` hook).
- The AI agent's `searchContacts` tool when it needs to resolve a name to an email.

The search query hits `contactsRepo.search`, which runs a PostgreSQL query with three match strategies ranked in order:

1. **Substring match** — `name ILIKE %q%` or `email ILIKE %q%` — catches exact and partial matches.
2. **Trigram similarity** — `name % q` using `pg_trgm` — adds typo tolerance ("Bikahs" → "Bikash"). Falls back to plain `ILIKE` if the extension is not installed.

Results are ordered by:
1. `GREATEST(similarity(name, q), word_similarity(q, name), word_similarity(q, email))` — best fuzzy match first.
2. `interactionCount DESC` — people you email most rank higher.
3. `lastSeenAt DESC` — most recently seen as a tiebreaker.

Returns up to 5 matches.

---

## 🚀 Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database
- Redis
- Google OAuth credentials (for Gmail + Calendar)
- An OpenAI API key

### Setup (local)

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

### Setup (Docker)

Requires Docker and Docker Compose. PostgreSQL and Redis are included in the compose file — no separate installs needed.

```bash
# 1. Configure environment
cp .env.example .env.prod    # then fill in your keys

# 2. Run migrations and seed (first time only)
docker compose --profile setup up migrate

# 3. Start the app
docker compose up app
```

The app runs at **http://localhost:3001**.

> **Note:** The `app` service overrides `DATABASE_URL` and `REDIS_URL` to point at the bundled Postgres (`calrix_postgres`) and Valkey (`calrix_valkey`) containers, so those values in `.env.prod` are ignored at runtime.

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
