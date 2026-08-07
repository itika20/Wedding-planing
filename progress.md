# 📋 Wedding 101 — Progress

Status of the **Wedding 101** wedding-planning dashboard. Legend: ✅ done · 🟡 partial · ⬜ not started.

Last updated: 2026-08-07

---

## 🧱 Foundation & architecture — ✅

| Area | Status | Notes |
| --- | --- | --- |
| Project scaffold (Vite + React + TS) | ✅ | `npm run dev` / `npm run build` both clean |
| Tailwind theme + luxury design tokens | ✅ | Ivory / champagne / rose palette, Fraunces + Inter |
| Routing (React Router) | ✅ | Profile gate + nested app shell |
| State management (Zustand store) | ✅ | Single source of truth, optimistic updates |
| Persistence — localStorage fallback | ✅ | Works offline, per-device |
| Persistence — Supabase cloud sync | ✅ | Auto-detects env vars, realtime subscription |
| DB schema (`supabase/schema.sql`) | ✅ | Tables, RLS policies, realtime publication |
| Blank first-run (no sample data) | ✅ | Starts empty; you add your own, saved automatically |
| First-run setup wizard | ✅ | Asks wedding date; add/remove/rename events with their own dates |
| Dynamic events (not fixed) | ✅ | Events are user-defined in setup; add/remove anytime via Settings → Edit |
| Task expenses (budgeted vs. actual) | ✅ | Amounts live on tasks/subtasks (subtasks override); roll up per event & overall |
| Config-driven customization | ✅ | Profiles in `src/data/config.ts`; events, dates via setup wizard |
| Responsive layout (desktop/tablet/mobile) | ✅ | Sidebar collapses to drawer on mobile |
| Loading / empty / error states | ✅ | Skeletons, empty states, cloud-error banner |
| Toasts + micro-interactions | ✅ | Framer Motion transitions, animated counters/rings |
| Code-splitting for production | ✅ | Vendor chunks (react/charts/motion/supabase) |

---

## ✅ Features built (deep core loop)

### Authentication / profiles — ✅
- Netflix-style profile selection screen (4 cards, avatar, role, last-active, countdown).
- Instant sign-in, no password. Switch profile from topbar or Settings.
- Generic default profiles: **You / Partner / Mom / Dad** (fully editable in config).
- Selected profile tags task ownership, subtask ticks and activity attribution.

### Home dashboard — ✅
- Overall progress ring + wedding countdown.
- Stat cards: total / completed / pending / overdue tasks; budgeted / actual / variance.
- Per-event progress rings (each showing actual / budgeted).
- Today & overdue tasks, upcoming events, recent activity, recently completed.
- Quick-add task.

### Event workspaces (user-defined events + Common Planning) — 🟡
Each event has its own workspace with tabs:
- **Overview** ✅ — task stats, budgeted vs. actual with an "actual vs budget" bar, "next up", ownership breakdown.
- **Tasks** ✅ — drag-and-drop Kanban (To Do / In Progress / Completed / Cancelled), priority,
  assignee, due dates, subtask checklists (each with its own budgeted/actual amounts), completion %,
  search / filter / sort, create / edit / duplicate / delete, mark-complete, **confetti at 100%**.
- **Expenses** ✅ — read-only roll-up: this event's Budgeted / Actual / Variance, plus the list of tasks that carry a cost.
- **Notes** ✅ — auto-saving scratchpad (local).
- **Bookings / Checklist / Timeline / Documents / Photos** ⬜ — not yet separate tabs (bookings are
  currently modelled as tasks).

### Task expenses (budgeted vs. actual) — ✅
- Every task has optional **budgeted** and **actual** amounts, set in the task modal.
- Can be itemised per subtask — if any subtask has an amount, the task total is the sum of its subtasks (subtasks override).
- Roll up per event (event tab) and combined at Common **Expenses** (budgeted / actual / variance, per-event bars, all-task list).
- No separate expense entity or "add expense" button — the amounts live on tasks; the views are read-only.

### Activity feed — ✅
- Chronological, attributed timeline of every task action.

### Global search & quick-add — ✅
- Topbar search across tasks.
- Quick-add task from anywhere.

### Settings — ✅
- Profile switching, sync-mode status + Supabase setup guide.
- Events & dates summary, "make it your wedding" pointer, clear-all-data.

---

## ✅ Sidebar sections (now functional)

Vendors, Guests and Documents persist via a dedicated collections store
(`src/store/useCollections.ts`, localStorage). Shopping lives on tasks (see below).

### Vendors — ✅
Directory with name, category, phone, linked event, booking status (pending/booked/completed/cancelled),
notes; add/edit/delete; booked vs pending stats.

### Guests — ✅
List with side (bride/groom/both), head-count, RSVP (quick-toggle), notes; totals for invites, heads,
coming, awaiting RSVP; filter by side.

### Documents — ✅
Link-based document board grouped into folders (Contracts, Bills, Invitations, Designs, Guest lists);
each entry opens its share link. (Real file upload deferred — needs Supabase Storage.)

### Shopping — ✅ (linked to tasks)
A live view of every task subtask flagged as a purchase (cart icon), grouped by event. One source of
truth: ticking/editing/deleting here changes the same subtask on the task, and vice-versa. "Add item"
attaches to a chosen task or an auto-created per-event "Shopping" bucket (removed when emptied). Cost
(`budgeted`) rolls into event expenses. Totals: items, bought, est. cost, spent.

### Cross-cutting features still pending
- **Cloud sync for the new collections** ⬜ — vendors/guests/documents are localStorage-only for now
  (shopping rides on tasks, so it already syncs).
- **Notifications** ⬜ — deadline / payment / overdue / booking reminders.
- **Analytics page** ⬜ — spending trend, budget-vs-actual over time, task-completion speed, readiness score
  (per-event budget/actual bars already exist on the Expenses page & event Overviews).
- **Receipt / attachment uploads** ⬜ — expense receipts, task attachments (needs Supabase Storage).
- **Task comments** ⬜ — per-task discussion thread (checklist + activity log exist; comments don't).
- **Event sub-tabs** ⬜ — dedicated Bookings / Checklist / Timeline / Photos tabs per event.
- **Per-record activity log view** 🟡 — global feed exists; per-task history not surfaced.

---

## 🧭 How to continue

1. **Make it yours:** set your wedding date & events in the setup wizard (Settings → Events & dates →
   Edit). Profiles live in `src/data/config.ts`; default events in `src/lib/events.ts`.
2. **Enable cloud sync:** create a Supabase project, run `supabase/schema.sql`, put the URL + anon
   key in `.env.local`, restart. See `README.md`.
3. **Build the next section:** follow the existing store + modal + table patterns (see `Vendors` /
   `Guests` pages, or `TaskModal` / `TaskExpenseList`, as templates).

## ⚠️ Known limitations
- Cloud mode uses permissive RLS policies (private family tool) — keep the deployed URL private.
- Notes are stored per-device (localStorage), not synced.
- No real file storage yet (receipts/documents) — needs Supabase Storage wiring.
