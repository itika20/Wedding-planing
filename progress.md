# 📋 Wedding 101 — Progress

Status of the **Wedding 101** wedding-planning dashboard. Legend: ✅ done · 🟡 partial · ⬜ not started.

Last updated: 2026-08-04

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
| Expense-only tracking (no budgets) | ✅ | Just log expenses; totals roll up per event and across all events |
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
- Selected profile tags task/expense ownership and activity attribution.

### Home dashboard — ✅
- Overall progress ring + wedding countdown.
- Stat cards: total / completed / pending / overdue tasks; total expenses / paid / outstanding.
- Per-event progress rings.
- Today & overdue tasks, upcoming events, recent activity, recently completed.
- Quick-add task & expense.

### Event workspaces (user-defined events + Common Planning) — 🟡
Each event has its own workspace with tabs:
- **Overview** ✅ — task stats, spending donut, event total/paid/due, "next up", ownership breakdown.
- **Tasks** ✅ — drag-and-drop Kanban (To Do / In Progress / Completed / Cancelled), priority,
  assignee, due dates, checklists, completion %, search / filter / sort, create / edit / duplicate /
  delete, mark-complete, **confetti at 100%**.
- **Expenses** ✅ — this event's Total / Paid / Outstanding, category donut, per-row payment tracking.
- **Notes** ✅ — auto-saving scratchpad (local).
- **Bookings / Checklist / Timeline / Documents / Photos** ⬜ — not yet separate tabs (bookings are
  currently modelled as tasks + expenses).

### Expenses (no budgets) — ✅
- Total spend summed across all events; paid / outstanding; events-with-spend count.
- Spending-by-event bars + spending-by-category donut.
- Full expense ledger with add / edit / delete. Totals also roll up on each event.

### Activity feed — ✅
- Chronological, attributed timeline of every task/expense action.

### Global search & quick-add — ✅
- Topbar search across tasks & expenses.
- Quick-add task / expense from anywhere.

### Settings — ✅
- Profile switching, sync-mode status + Supabase setup guide.
- Events & dates summary, "make it your wedding" pointer, clear-all-data.

---

## ✅ Sidebar sections (now functional)

All persist via a dedicated collections store (`src/store/useCollections.ts`, localStorage).

### Vendors — ✅
Directory with name, category, phone, linked event, booking status (pending/booked/completed/cancelled),
notes; add/edit/delete; booked vs pending stats.

### Guests — ✅
List with side (bride/groom/both), head-count, RSVP (quick-toggle), notes; totals for invites, heads,
coming, awaiting RSVP; filter by side.

### Calendar — ✅
Month view (prev/next/today) plotting each event on its date in its accent colour; click to open the
event; "Upcoming" side panel with countdowns.

### Documents — ✅
Link-based document board grouped into folders (Contracts, Bills, Invitations, Designs, Guest lists);
each entry opens its share link. (Real file upload deferred — needs Supabase Storage.)

### Shopping — ✅
Buy-list with for-whom, cost, store, purchased toggle, notes; totals for items, purchased, est. cost, spent.

### Cross-cutting features still pending
- **Cloud sync for the new collections** ⬜ — vendors/guests/shopping/documents are localStorage-only for now.
- **Notifications** ⬜ — deadline / payment / overdue / booking reminders.
- **Analytics page** ⬜ — spending trend, task-completion speed, vendor payments, readiness score
  (basic charts already exist on the Expenses page & event Overviews).
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
3. **Build the next section:** Vendors and Guests are the highest-value next pages; both follow the
   existing store + modal + table patterns (see `ExpenseTable` / `ExpenseModal` as a template).

## ⚠️ Known limitations
- Cloud mode uses permissive RLS policies (private family tool) — keep the deployed URL private.
- Notes are stored per-device (localStorage), not synced.
- No real file storage yet (receipts/documents) — needs Supabase Storage wiring.
