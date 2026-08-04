# 💍 Wedding 101 — Wedding Planning Dashboard

A premium, collaborative wedding-planning workspace **any couple can make their own** — Netflix-style
family profiles, per-event Kanban task boards, live budget & payment tracking, and progress rings
across every function. It ships configured for a multi-event Indian wedding (Roka, Kali Puja,
Engagement, Haldi, Wedding + shared Common Planning), but the profiles, events, dates and budgets are
all editable in one file — see [Make it yours](#-make-it-yours).

Built with **React + TypeScript + Vite + Tailwind + Framer Motion + Recharts**, with **Supabase**
for real-time cloud sync and a **local-storage fallback** so it runs the moment you install it.

---

## ✨ Features

- **Netflix-style profiles** — You, Partner, Mom, Dad by default (fully editable). Pick a profile to
  sign in (no password). Everyone sees & edits everything; the profile just tags who did what.
- **Home dashboard** — overall progress ring, task & budget stat cards, per-event progress,
  today/overdue tasks, upcoming events, recent activity, recently completed, wedding countdown.
- **Event workspaces** (Roka · Kali Puja · Engagement · Haldi · Wedding · Common Planning), each with:
  - **Overview** — stats, spending donut, "next up", ownership breakdown
  - **Tasks** — drag-and-drop Kanban (To Do / In Progress / Completed / Cancelled) with priority,
    assignee, due dates, checklists, search, filter, sort, edit/duplicate/delete
  - **Expenses** — cost + paid + remaining, categories, payment status, per-row payment bars
  - **Notes** — auto-saving scratchpad
  - 🎉 **Confetti** when an event's tasks hit 100%
- **Budget** — total/committed/paid/remaining, budget-vs-spent bar chart, category donut, full ledger.
- **Activity feed** — every action, attributed to a family member.
- **Global search** across tasks & expenses. **Quick add** task/expense from anywhere.
- Loading, empty & error states; animated counters, progress bars, page transitions; responsive.

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open the printed URL. It runs in **local mode** immediately (data saved in your browser), seeded with
realistic sample tasks & expenses.

## 🎨 Make it yours

Everything specific to a wedding lives in **one file**: [`src/data/config.ts`](src/data/config.ts).
Edit it, then in the app go to **Settings → Reset to sample data** to start from a clean slate.

- **`WEDDING_DATE`** — the anchor date everything counts down to.
- **`USERS`** — the people planning. Rename, re-emoji, add or remove profiles. Keep each `id` stable
  once in use (tasks/expenses remember owners by `id`).
- **`EVENTS`** — your functions/ceremonies. Change names, emojis, dates, budgets and accent colours,
  or swap the Indian-wedding defaults (Roka, Kali Puja, Haldi…) for whatever your wedding has. The
  sidebar, dashboard, charts and per-event workspaces update automatically.
- **`EXPENSE_CATEGORIES`, `PRIORITY_META`, `STATUS_META`** — tune the category and label vocabulary.

The seeded sample tasks & expenses (in `src/lib/seed.ts`) are just examples to explore — reset the
data once you've made the config yours and start adding your own.

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
5. Restart `npm run dev`. The topbar badge flips from **Local** to **Synced**, the database
   auto-seeds once, and changes now sync live across devices.

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
  data/config.ts          Users, events, dates, budgets, categories, priority/status metadata
  lib/
    types.ts              Domain model (Task, Expense, Activity, User…)
    supabase.ts           Supabase client (null in local mode)
    db.ts                 Persistence: localStorage cache + cloud CRUD + row mapping + realtime
    seed.ts               Deterministic sample data
    selectors.ts          Derived stats (event + overall progress, budget rollups)
    utils.ts              cn, INR formatting, date helpers
  store/useStore.ts       Zustand store — single source of truth + all actions + activity logging
  components/
    ui/                   ProgressRing, ProgressBar, StatCard, CountUp, Avatar, Badge, Modal,
                          EmptyState, Confetti, Toast
    layout/               AppShell, Sidebar, Topbar, UIProvider (global task/expense modals)
    tasks/                KanbanBoard, TaskCard, TaskModal
    expenses/             ExpenseTable, ExpenseModal
    charts/               CategoryDonut, BudgetBars (Recharts)
    activity/             ActivityFeed
  pages/                  ProfileSelect, Home, EventWorkspace, Budget, ActivityPage,
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
