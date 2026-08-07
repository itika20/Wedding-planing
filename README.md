# 💍 Wedding 101 — Wedding Planning Dashboard

A premium, collaborative wedding-planning workspace **any couple can make their own** — Netflix-style
family profiles, per-event Kanban task boards, per-task expense tracking (budgeted vs. actual) that
rolls up per event and across all events, and progress rings across every function. It ships configured
for a multi-event Indian wedding (Roka, Kali Puja, Engagement, Haldi, Wedding + shared Common Planning),
but you add/remove/rename events and set the dates yourself in setup — see [Make it yours](#-make-it-yours).
There are no separate expense entries: every task carries an optional **budgeted** and **actual** amount
(set on the task, or itemised across its subtasks), and they total up per event and overall.

Built with **React + TypeScript + Vite + Tailwind + Framer Motion + Recharts**, with **Supabase**
for real-time cloud sync and a **local-storage fallback** so it runs the moment you install it.

---

## ✨ Features

- **Netflix-style profiles** — You, Partner, Mom, Dad by default (fully editable). Pick a profile to
  sign in (no password). Everyone sees & edits everything; the profile just tags who did what.
- **Home dashboard** — overall progress ring, task stats + expense totals (budgeted / actual / variance), per-event progress,
  today/overdue tasks, upcoming events, recent activity, recently completed, wedding countdown.
- **Task expenses** — every task has an optional **budgeted** and **actual** amount. Enter them on the
  task, or itemise per subtask — if any subtask has an amount, the task total is the sum of its subtasks
  (subtasks override). No separate "add expense" step; the amounts live on the task.
- **Event workspaces** (Roka · Kali Puja · Engagement · Haldi · Wedding · Common Planning), each with:
  - **Overview** — stats, budgeted vs. actual with an "actual vs budget" bar, "next up", ownership breakdown
  - **Tasks** — drag-and-drop Kanban (To Do / In Progress / Completed / Cancelled) with priority,
    assignee, due dates, subtask checklists (each with its own amounts), search, filter, sort, edit/duplicate/delete
  - **Expenses** — a read-only roll-up: budgeted, actual and variance for the event, plus the list of tasks that carry a cost
  - **Notes** — auto-saving scratchpad
  - 🎉 **Confetti** when an event's tasks hit 100%
- **Expenses (Common)** — budgeted vs. actual summed across events, per-event breakdown, and a combined
  list of every task expense. Read-only — edit amounts on the task itself.
- **Activity feed** — every action, attributed to a family member.
- **Global search** across tasks. **Quick add** a task from anywhere.
- Loading, empty & error states; animated counters, progress bars, page transitions; responsive.

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open the printed URL. It runs in **local mode** immediately (data saved in your browser) and starts as
a **blank first-run** — no sample data. A quick **setup wizard** asks for your wedding date and lets you
add/remove your events, then you pick a profile and start adding tasks & expenses; everything saves automatically.

## 🎨 Make it yours

Your **wedding date and events** (add / remove / rename, each with its own date) are set in the in-app
setup wizard on first run — no code needed. Re-open it anytime via **Settings → Events & dates → Edit**.
There are no budgets to set up front — each task carries its own optional budgeted/actual amounts, and
they total up per event and overall.

Deeper defaults live in code:

- **`USERS`** in [`src/data/config.ts`](src/data/config.ts) — the people planning. Rename, re-emoji,
  add or remove profiles. Keep each `id` stable once in use (tasks/expenses remember owners by `id`).
- **`DEFAULT_EVENTS`** in [`src/lib/events.ts`](src/lib/events.ts) — the events the wizard pre-fills
  (fully editable in the wizard). Change these to seed different starting events.
- **`PRIORITY_META`, `STATUS_META`** in `config.ts` — task priority and status label vocabulary.

The app starts empty, so once the config is yours just start adding tasks & expenses.

## ☁️ Enable cloud sync (shared across the whole family)

Local mode stores data per-browser. To let Mom's phone and your laptop see the same live data,
connect a free Supabase project:

1. Create a project at **supabase.com** (free tier is plenty).
2. In the Supabase dashboard → **SQL Editor** → paste & run [`supabase/schema.sql`](supabase/schema.sql).
   This creates the tables, permissive family-access policies, and enables realtime.
3. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
4. Create `.env.local` (copy from [`.env.example`](.env.example)) and paste them:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
5. Restart `npm run dev`. The topbar badge flips from **Local** to **Synced** and changes sync live
   across devices.

> ⚠️ **Before you deploy to the internet, read [`SECURITY.md`](SECURITY.md).** `schema.sql` ships with
> a permissive policy meant for local/dev — anyone with the URL could read/write. For production, turn
> on Supabase Auth (invite your family), run [`supabase/policies-prod.sql`](supabase/policies-prod.sql),
> and the app will require a family sign-in. This is the only robust way to keep it family-only, because
> the anon key is public by design.

## 🏗️ Build & deploy

```bash
npm run build      # type-checks then builds to dist/
npm run preview    # preview the production build
```

Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages). Add the two `VITE_SUPABASE_*`
env vars in the host's dashboard for cloud sync in production.

## 🧱 Architecture

```
src/
  data/config.ts          Profiles, priority/status metadata
  lib/
    types.ts              Domain model (Task w/ budgeted+actual, ChecklistItem w/ amounts, Activity, User, WeddingSettings…)
    settings.ts           Wedding date + the user's events (from setup wizard)
    events.ts             Event helpers: Common bucket, default events, lookup by id
    expenses.ts           Task expense roll-up (subtasks override task-level) + totals
    supabase.ts           Supabase client (null in local mode)
    db.ts                 Persistence: localStorage cache + cloud CRUD + row mapping + realtime
    selectors.ts          Derived stats (event + overall progress, budgeted/actual/variance rollups)
    utils.ts              cn, INR formatting, date helpers
  store/useStore.ts       Zustand store — single source of truth + all actions + activity logging
  components/
    ui/                   ProgressRing, ProgressBar, StatCard, CountUp, Avatar, Badge, Modal,
                          EmptyState, Confetti, Toast
    layout/               AppShell, Sidebar, Topbar, UIProvider (global task modal)
    tasks/                KanbanBoard, TaskCard, TaskModal (title, description, budgeted/actual, subtasks)
    expenses/             TaskExpenseList (read-only roll-up of task expenses)
    activity/             ActivityFeed
  pages/                  SetupWizard, Login, ProfileSelect, Home, EventWorkspace, Expenses,
                          ActivityPage, Settings, Vendors, Guests, Documents, Shopping
```

**Data flow:** components read/write the Zustand store → the store updates in memory (optimistic),
writes the full snapshot to `localStorage`, and best-effort upserts the changed row to Supabase.
In cloud mode a realtime subscription refreshes the store when other devices make changes. Expenses
aren't stored separately — they're fields on tasks/subtasks, summed on read via `lib/expenses.ts`.

## 🎨 Design

Warm ivory + champagne gold + dusty rose palette, Fraunces display / Inter body type, soft shadows,
rounded corners, subtle glass, generous whitespace. Fully responsive (desktop → tablet → mobile).

## 🛍️ Shopping

Shopping isn't a separate list — a **purchase is a task subtask** flagged with the cart icon (`done` =
bought, `budgeted` = estimated cost). The **Shopping** page is a live view of every flagged subtask,
grouped by event; ticking, editing or deleting there changes the same subtask on the task (and vice
versa). "Add item" from the Shopping page drops the purchase into the chosen task, or an auto-created
per-event "Shopping" bucket. So purchases you note against an event show up in Shopping without
re-entry, and their cost rolls into that event's expenses.

## 🗺️ Roadmap

Deep, polished core first. Vendors, Guests, Documents and Shopping build on the same store/patterns
already in place.
