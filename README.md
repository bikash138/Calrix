<div align="center">

<img src="public/icon.svg" alt="Calrix logo" width="96" height="96" />

<h1>Calrix</h1>

<p><strong>Your inbox and calendar, on autopilot.</strong></p>

<p>Calrix is an AI chief-of-staff for your Gmail and Google Calendar. It reads, sorts, and ranks every email, drafts replies that sound like you, guards your calendar, and chases down the replies you're still waiting on — so you only ever touch what actually needs you.</p>

<img src="public/og-image.webp" alt="Calrix product preview" width="100%" />

</div>

---

## ✨ What Calrix does for you

Calrix works quietly in the background and surfaces only what matters. Here's everything it handles.

### 📥 Inbox Zero, on autopilot

- **Smart triage** — Calrix reads every primary email and sorts it into clear buckets: _reply needed_, _approval_, _meeting_, or _just FYI_. Promotions, social, and noise are filtered out automatically.
- **Priority ranking** — Each email is tagged by urgency (critical, high, or normal) so the things that can't wait rise straight to the top.
- **One-line summaries** — Instead of opening a long thread, you get the gist: _"David needs the signed contract by Friday."_
- **Live alerts for the urgent stuff** — The moment a truly time-sensitive email lands, your dashboard lights up in real time.

### ✍️ Drafts that sound like you

- **Replies in your voice** — Calrix studies your past emails and writes drafts that match your tone — ready to send, not generic filler.
- **Approve in a click** — Routine replies can be pre-drafted and waiting. Review, tweak, send.
- **Smart confidence levels** — Every suggested action is graded: _safe to auto-handle_, _worth a quick review_, or _needs your approval_ — so Calrix never oversteps on anything sensitive.

### 📅 A calendar that defends itself

- **Natural-language scheduling** — Just say _"set up a 30-min call with Sarah next Tuesday afternoon"_ and Calrix finds the slot, checks for conflicts, and books it.
- **Conflict-aware** — Before booking, Calrix checks your availability and suggests open slots when your first choice is taken.
- **Reschedule & cancel with a sentence** — Move or clear events conversationally; Calrix confirms the new time is actually free before touching anything.
- **Invites handled end-to-end** — It creates the event _and_ drafts the invitation email to attendees.

### 🔁 Never drop the ball on follow-ups

- **Tracks what you're waiting on** — Every email you send that expects a reply is quietly watched.
- **Surfaces stalled threads** — See exactly who hasn't gotten back to you, ranked by what matters most right now.
- **Knows when something's overdue** — Threads past their deadline or gone quiet for days get flagged so you can nudge at the right moment.

### 💬 Chat with your inbox

- **Talk to Calrix in plain English** — Ask _"what did Acme say about the renewal?"_ or _"reply to Jane and tell her I'm in."_ It reads, searches, drafts, sends, schedules — all from one chat box.
- **Interactive widgets** — Instead of typing everything, Calrix hands you clean controls: an event form to confirm a meeting, a draft preview to edit-and-send an email, quick pick-lists for time slots and attendees.
- **Contact memory** — Mention someone by name and Calrix remembers their email for next time — no more digging for addresses.
- **Stays in its lane** — Calrix is a focused Gmail + Calendar specialist and won't wander off-topic or take a risky action without your okay.

### 🎯 Built around how _you_ work

A quick onboarding tailors Calrix to you:

- **Your role** — founder, sales, engineering, ops, or your own description.
- **Your volume** — how busy your inbox really is.
- **What "urgent" means to you** — VIP senders, deadlines, money/contracts, replies, scheduling, or assigned tasks.
- **Summary style** — a one-line gist or the full picture.
- **Follow-up intensity** — from a gentle nudge only when overdue, to staying on top of everything.
- **VIP senders** — people who should always land at the top.
- **Privacy first** — opt out of anything model-improvement related at any time.

### 🔒 Private and secure by design

- Your emails and contacts are **never shared**. Connections are encrypted and Calrix is built SOC 2-ready.
- Secure sign-in with your Google account.
- Granular, per-user data isolation across everything Calrix touches.

---

## 🛠️ Under the hood

Calrix is a modern, full-stack TypeScript application.

| Layer                          | Technology                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------ |
| **Framework**                  | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| **Language**                   | TypeScript                                                                     |
| **Auth**                       | [Better Auth](https://www.better-auth.com/) with Google sign-in                |
| **Database**                   | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/)                          |
| **Background jobs & realtime** | [Inngest](https://www.inngest.com/) (triage pipelines, live notifications)     |
| **Gmail & Calendar**           | [Corsair](https://corsair.dev/) integrations                                   |
| **AI**                         | [Vercel AI SDK](https://sdk.vercel.ai/) + OpenAI models                        |
| **Caching & rate limiting**    | Redis (ioredis) + rate-limiter-flexible                                        |
| **UI**                         | MUI, Radix UI, shadcn/ui, Tailwind CSS, Motion                                 |
| **State & data**               | Zustand, TanStack Query                                                        |

### How triage works

1. **New mail arrives** → an Inngest function classifies it instantly. Critical items are pushed to your dashboard in real time; everything else is deferred to the daily batch.
2. **Daily inbox sweep** → Calrix pulls recent primary mail, classifies and ranks it, scores how safely it can be handled, and pre-drafts replies for actionable items.
3. **Follow-up tracking** → sent emails are tracked for expected replies; threads gone quiet or past due are surfaced as _waiting_ or _overdue_.
4. **Action items** → everything lands in a single, prioritized action list backed by Postgres.

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

---

## 💎 Plans

|                | **Pilot**                                           | **Team**                                                      | **Scale**                                              |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| **For**        | Proving value on one inbox                          | Putting your team on autopilot                                | Orgs that live in the inbox                            |
| **Price**      | From $99/mo                                         | $199/mo                                                       | Custom                                                 |
| **Seats**      | 1 inbox + calendar                                  | Up to 7                                                       | Unlimited                                              |
| **AI actions** | 500 / month                                         | 5,000 / month                                                 | Custom                                                 |
| **Highlights** | Smart triage, on-brand drafts, automated follow-ups | Shared scheduling, meeting prep & summaries, priority support | SSO, advanced security, dedicated success manager, SLA |

---

<div align="center">
<sub>Built to give you back the hours your inbox quietly steals. ✦ Calrix</sub>
</div>
