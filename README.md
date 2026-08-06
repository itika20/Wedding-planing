# 💍 Wedding 101 — Wedding Planning Dashboard

A premium, collaborative wedding-planning workspace **any couple can make their own** — Netflix-style
family profiles, per-event Kanban task boards, expense tracking that rolls up per event and across all events, and progress rings
across every function. It ships configured for a multi-event Indian wedding (Roka, Kali Puja,
Engagement, Haldi, Wedding + shared Common Planning), but you add/remove/rename events and set the
dates yourself in setup — see [Make it yours](#-make-it-yours). There are no budgets: just log expenses
and they total up.

Built with **React + TypeScript + Vite + Tailwind + Framer Motion + Recharts**, with **Supabase**
for real-time cloud sync and a **local-storage fallback** so it runs the moment you install it.

---

## ✨ Features

- **Netflix-style profiles** — You, Partner, Mom, Dad by default (fully editable). Pick a profile to
  sign in (no password). Everyone sees & edits everything; the profile just tags who did what.
- **Home dashboard** — overall progress ring, task stats + expense totals (spent / paid / outstanding), per-event progress,
  today/overdue tasks, upcoming events, recent activity, recently completed, wedding countdown.
- **Event workspaces** (Roka · Kali Puja · Engagement · Haldi · Wedding · Common Planning), each with:
  - **Overview** — stats, spending donut, "next up", ownership breakdown
  - **Tasks** — drag-and-drop Kanban (To Do / In Progress / Completed / Cancelled) with priority,
    assignee, due dates, checklists, search, filter, sort, edit/duplicate/delete
  - **Expenses** — cost + paid + remaining, categories, payment status, per-row payment bars
  - **Notes** — auto-saving scratchpad
  - 🎉 **Confetti** when an event's tasks hit 100%
- **Expenses** — total spend (summed across events), per-event breakdown, category donut, full ledger. No budgets.
- **Activity feed** — every action, attributed to a family member.
- **Global search** across tasks & expenses. **Quick add** task/expense from anywhere.
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
There are no budgets — you just log expenses and they total up per event and overall.

Deeper defaults live in code:

- **`USERS`** in [`src/data/config.ts`](src/data/config.ts) — the people planning. Rename, re-emoji,
  add or remove profiles. Keep each `id` stable once in use (tasks/expenses remember owners by `id`).
- **`DEFAULT_EVENTS`** in [`src/lib/events.ts`](src/lib/events.ts) — the events the wizard pre-fills
  (fully editable in the wizard). Change these to seed different starting events.
- **`EXPENSE_CATEGORIES`, `PRIORITY_META`, `STATUS_META`** in `config.ts` — category and label vocabulary.

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
5. Restart `npm run dev`. The topbar badge flips from **Local** to **Synced**, the profiles are
   registered once, and changes now sync live across devices.

> Security note: for a password-less family tool the anon key has full table access via RLS
> policies. Keep the deployed URL private. Tighten the policies in `schema.sql` if you ever expose it.

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
  data/config.ts          Profiles, event list, categories, priority/status metadata
  lib/
    types.ts              Domain model (Task, Expense, Activity, User, WeddingSettings…)
    settings.ts           Wedding date + the user's events (from setup wizard); no budgets
    events.ts             Event helpers: Common bucket, default events, lookup by id
    supabase.ts           Supabase client (null in local mode)
    db.ts                 Persistence: localStorage cache + cloud CRUD + row mapping + realtime
    selectors.ts          Derived stats (event + overall progress, budget rollups)
    utils.ts              cn, INR formatting, date helpers
  store/useStore.ts       Zustand store — single source of truth + all actions + activity logging
  components/
    ui/                   ProgressRing, ProgressBar, StatCard, CountUp, Avatar, Badge, Modal,
                          EmptyState, Confetti, Toast
    layout/               AppShell, Sidebar, Topbar, UIProvider (global task/expense modals)
    tasks/                KanbanBoard, TaskCard, TaskModal
    expenses/             ExpenseTable, ExpenseModal
    charts/               CategoryDonut (Recharts)
    activity/             ActivityFeed
  pages/                  SetupWizard, ProfileSelect, Home, EventWorkspace, Expenses, ActivityPage,
                          Settings, Placeholder (Vendors/Guests/Calendar/Documents/Shopping)
```

**Data flow:** components read/write the Zustand store → the store updates in memory (optimistic),
writes the full snapshot to `localStorage`, and best-effort upserts the changed row to Supabase.
In cloud mode a realtime subscription refreshes the store when other devices make changes.

## 🎨 Design

Warm ivory + champagne gold + dusty rose palette, Fraunces display / Inter body type, soft shadows,
rounded corners, subtle glass, generous whitespace. Fully responsive (desktop → tablet → mobile).

## 🗺️ Roadmap

Deep, polished core first. Vendors, Guests, Calendar, Documents and Shopping have navigable pages
describing their planned scope and build on the same store/patterns already in place.
