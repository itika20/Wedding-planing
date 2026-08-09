# 📋 Wedding 101 — Progress

Status of the **Wedding 101** wedding-planning dashboard. Legend: ✅ done · 🟡 partial · ⬜ not started.

Last updated: 2026-08-09

---

## 🧱 Foundation & architecture — ✅

| Area | Status | Notes |
| --- | --- | --- |
| Project scaffold (Vite + React + TS) | ✅ | `npm run dev` / `npm run build` both clean |
| Tailwind theme + luxury design tokens | ✅ | Ivory / champagne / rose palette, Fraunces + Inter |
| Routing (React Router) | ✅ | Profile gate + nested app shell |
| State management (Zustand store) | ✅ | Single source of truth, optimistic updates |
| Persistence — localStorage fallback | ✅ | Works offline, per-device |
| Cloud (Vercel + Neon) | ✅ | Serverless `/api` over Neon Postgres; refetch on focus + ~30s poll |
| Family-only access (prod) | ✅ | Shared passcode → signed HttpOnly cookie checked on every API call; see `DEPLOY.md` |
| DB schema (`neon/schema.sql`) | ✅ | users / tasks / activity tables |
| Blank first-run (no sample data) | ✅ | Starts empty; you add your own, saved automatically |
| First-run setup wizard | ✅ | Asks wedding date; add/remove/rename events with their own dates |
| Dynamic events (not fixed) | ✅ | Events are user-defined in setup; add/remove anytime via Settings → Edit |
| Task expenses (budgeted vs. actual) | ✅ | Amounts live on tasks/subtasks (subtasks override); roll up per event & overall |
| Config-driven customization | ✅ | Profiles in `src/data/config.ts`; events, dates via setup wizard |
| Responsive layout (desktop/tablet/mobile) | ✅ | Sidebar collapses to drawer on mobile |
| Loading / empty / error states | ✅ | Skeletons, empty states, cloud-error banner |
| Toasts + micro-interactions | ✅ | Framer Motion transitions, animated counters/rings |
| Code-splitting for production | ✅ | Vendor chunks (react/motion) |

---

## ✅ Features built (deep core loop)

### Access & profiles — ✅
- **Local mode:** no login — data is device-private; just pick a profile.
- **Cloud mode (deployed):** a **shared family passcode** gate shows before the dashboard; entering it
  sets a signed HttpOnly cookie the `/api` backend checks on every request. "Sign out" is in the profile
  menu. Deploy on Vercel + Neon — see `DEPLOY.md`.
- Netflix-style profile selection (4 cards, avatar, role, last-active, countdown); instant, no password.
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
- Profile switching, sync-mode status + a pointer to deploy for the family (`DEPLOY.md`).
- Events & dates summary, "make it your wedding" pointer, clear-all-data.

---

## ✅ Sidebar sections (now functional)

Vendors, Guests and Documents persist via a dedicated collections store
(`src/store/useCollections.ts`, localStorage). Shopping lives on tasks (see below).

### Vendors — ✅
Directory with name, category, phone, linked event, booking status (pending/booked/completed/cancelled),
notes; add/edit/delete; booked vs pending stats.

### Guests — ✅ (per event)
Bride-side only. Each guest is invited to one or more **functions** (multi-select), with head-count,
**hotel rooms**, RSVP (quick-toggle) and notes. Filter by event to see that function's list; totals
(invites, heads, coming, awaiting RSVP, **rooms needed**) reflect the current filter.

### Documents — ✅
Link-based document board grouped into folders (Contracts, Bills, Invitations, Designs, Guest lists);
each entry opens its share link. (Real file upload deferred — needs cloud file storage.)

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
- **Receipt / attachment uploads** ⬜ — expense receipts, task attachments (needs cloud file storage).
- **Task comments** ⬜ — per-task discussion thread (checklist + activity log exist; comments don't).
- **Event sub-tabs** ⬜ — dedicated Bookings / Checklist / Timeline / Photos tabs per event.
- **Per-record activity log view** 🟡 — global feed exists; per-task history not surfaced.

---

## 🧭 How to continue

1. **Make it yours:** set your wedding date & events in the setup wizard (Settings → Events & dates →
   Edit). Profiles live in `src/data/config.ts`; default events in `src/lib/events.ts`.
2. **Deploy for the family:** Vercel + Neon + a shared passcode — full runbook in `DEPLOY.md`.
3. **Build the next section:** follow the existing store + modal + table patterns (see `Vendors` /
   `Guests` pages, or `TaskModal` / `TaskExpenseList`, as templates).

## ⚠️ Known limitations
- Cross-device sync is by polling (refetch on focus + every ~30s), not realtime — changes appear within a
  few seconds, not instantly.
- Access is one shared family passcode (no per-person accounts) — fine for a family tool; rotate it in
  Vercel if it ever leaks.
- Notes are stored per-device (localStorage), not synced.
- No real file storage yet (receipts/documents) — needs cloud file storage wiring.
