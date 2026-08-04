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
| Persistence — Supabase cloud sync | ✅ | Auto-detects env vars, realtime subscription, auto-seed |
| DB schema (`supabase/schema.sql`) | ✅ | Tables, RLS policies, realtime publication |
| Sample seeded data | ✅ | ~38 tasks, ~23 expenses, activity feed |
| Config-driven customization | ✅ | Everything in `src/data/config.ts` ("make it yours") |
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
- Stat cards: total / completed / pending / overdue tasks; total budget / spent / remaining.
- Per-event progress rings.
- Today & overdue tasks, upcoming events, recent activity, recently completed.
- Quick-add task & expense.

### Event workspaces (Roka, Kali Puja, Engagement, Haldi, Wedding, Common Planning) — 🟡
Each event has its own workspace with tabs:
- **Overview** ✅ — stats, spending donut, "next up", ownership breakdown.
- **Tasks** ✅ — drag-and-drop Kanban (To Do / In Progress / Completed / Cancelled), priority,
  assignee, due dates, checklists, completion %, search / filter / sort, create / edit / duplicate /
  delete, mark-complete, **confetti at 100%**.
- **Expenses** ✅ — budget vs committed vs paid, category donut, per-row payment tracking.
- **Notes** ✅ — auto-saving scratchpad (local).
- **Bookings / Checklist / Timeline / Documents / Photos** ⬜ — not yet separate tabs (bookings are
  currently modelled as tasks + expenses).

### Budget — ✅
- Total / committed / paid / remaining stat cards.
- Overall budget-health dual bar (paid vs committed vs budget).
- Budget-vs-spent bar chart by event, spending-by-category donut.
- Full expense ledger with add / edit / delete.

### Activity feed — ✅
- Chronological, attributed timeline of every task/expense action.

### Global search & quick-add — ✅
- Topbar search across tasks & expenses.
- Quick-add task / expense from anywhere.

### Settings — ✅
- Profile switching, sync-mode status + Supabase setup guide.
- Events & dates summary, "make it your wedding" pointer, reset-to-sample-data.

---

## ⬜ Pending / not yet built

These are navigable in the sidebar with a "what's coming" placeholder page, but not yet functional:

### Vendors — ⬜
Business name, contact, phone/email/address, services, quoted/final/advance/remaining amounts,
documents, rating, status (booked/pending/cancelled/completed).

### Guests — ⬜
Guest list by family/friends/bride-side/groom-side/VIP; invitation sent, RSVP, attending, food
preference, accommodation, gift received, notes.

### Calendar — ⬜
Monthly colour-coded view of events, task deadlines, vendor meetings, payment reminders; drag to
reschedule; reminder badges.

### Documents — ⬜
Central storage with folders (Contracts, Bills, Invitations, Designs, Guest Lists, Receipts, Notes);
upload PDF / image / Excel / Word.

### Shopping — ⬜
Categories (Bride, Groom, Parents, Decor, Gifts, Accessories, Household); name, budget, actual cost,
purchased, store, receipt, priority, status.

### Cross-cutting features still pending
- **Notifications** ⬜ — deadline / payment / overdue / booking reminders.
- **Analytics page** ⬜ — spending trend, task-completion speed, vendor payments, readiness score
  (basic charts already exist on Budget & event Overviews).
- **Receipt / attachment uploads** ⬜ — expense receipts, task attachments (needs Supabase Storage).
- **Task comments** ⬜ — per-task discussion thread (checklist + activity log exist; comments don't).
- **Event sub-tabs** ⬜ — dedicated Bookings / Checklist / Timeline / Photos tabs per event.
- **Per-record activity log view** 🟡 — global feed exists; per-task history not surfaced.

---

## 🧭 How to continue

1. **Make it yours:** edit `src/data/config.ts` (profiles, events, dates, budgets), then
   Settings → Reset to sample data.
2. **Enable cloud sync:** create a Supabase project, run `supabase/schema.sql`, put the URL + anon
   key in `.env.local`, restart. See `README.md`.
3. **Build the next section:** Vendors and Guests are the highest-value next pages; both follow the
   existing store + modal + table patterns (see `ExpenseTable` / `ExpenseModal` as a template).

## ⚠️ Known limitations
- Cloud mode uses permissive RLS policies (private family tool) — keep the deployed URL private.
- Notes are stored per-device (localStorage), not synced.
- No real file storage yet (receipts/documents) — needs Supabase Storage wiring.
