# 🧪 Wedding 101 — Testing Checklist

A feature-by-feature walkthrough for testing the app and noting what to fix. The app now starts as a
**blank first-run** (no sample data) — you add everything yourself and it's saved automatically.

## Run it

```bash
cd "D:/Itika Stuff/Coding/wedding-dashboard"
npm run dev -- --port 5180
```

Then open http://localhost:5180.

Legend: ✅ built & ready to test · ⬜ intentionally a stub (not a bug).

---

## 0. First-run setup wizard ✅
- [ ] On a brand-new/cleared workspace, the **setup wizard** appears before anything else.
- [ ] Step 1 asks for the **wedding date** (Continue is disabled until you pick one).
- [ ] Step 2 lets you **add / remove / rename** events (emoji + name + optional date) — not a fixed list.
- [ ] "Start planning" saves and drops you at the profile screen.
- [ ] The dashboard afterwards shows **your** date/countdown and **your** events — nothing is pre-assumed.
- [ ] Settings → **Events & dates → Edit** re-opens the wizard prefilled with your values.

## 1. Profile screen ✅
- [ ] Four cards: **👰 Big I**, **🙋‍♀️ Small I**, **👩 Mummy**, **👨 Papa** — names only, no subtext.
- [ ] Clicking a card signs in and lands on Home.
- [ ] Top-right avatar reflects who you picked.

## 2. Home dashboard ✅
- [ ] Greeting shows your name; wedding countdown + overall progress ring animate.
- [ ] Stat cards: Total / Completed / Pending / Overdue tasks; Total expenses / Paid / Outstanding.
- [ ] On first run everything reads 0 / empty (that's expected).
- [ ] Event progress rings (Roka, Kali Puja, Engagement, Haldi, Wedding) — click → opens that event.
- [ ] "Today & overdue", "Upcoming events", "Recent activity", "Recently completed" populate as you add data.
- [ ] **Add task** / **Add expense** buttons open the popups.

## 3. Event workspace (open any event) ✅
Test the four tabs:
- [ ] **Overview** — stats, spending donut, "Next up", "Who's on it".
- [ ] **Tasks** — Kanban board (see §4).
- [ ] **Expenses** — this event's Total / Paid / Outstanding + expense table (see §5).
- [ ] **Notes** — type; confirm it auto-saves ("Saved ✓").
- [ ] Header progress ring + "spent" chip update as tasks/expenses change (no budget).

## 4. Tasks / Kanban — test hard ✅
- [ ] **Drag a card** across To Do → In Progress → Completed → Cancelled.
- [ ] Click the **circle** on a card to mark complete / undo.
- [ ] **Add task** — title, assignee, priority, due date, checklist; it appears in the right column.
- [ ] **⋯ menu** on a card → Edit, Duplicate, Delete.
- [ ] **Search / Filters / Sort** narrow the board.
- [ ] Complete every task in an event → **confetti fires** at 100%.

## 5. Expenses ✅
- [ ] **Add expense** — name, category, amount, paid, method, date.
- [ ] Payment chip (Paid / Partial / Unpaid) + payment bar are correct.
- [ ] Edit / delete a row; totals update.

## 6. Expenses page ✅
- [ ] Total expenses (summed across events) / Paid / Outstanding / events-with-spend cards.
- [ ] "Spending by event" bars + "Spending by category" donut + full ledger. No budgets anywhere.

## 7. Activity · Search · Quick-add ✅
- [ ] Sidebar → **Activity**: timeline attributed to the right person.
- [ ] **Top search**: type a task/expense name → results → clicking jumps to it.
- [ ] **Quick add** (top-right) → New task / New expense from anywhere.

## 8. Settings ✅
- [ ] Switch profiles; "Back to profile screen".
- [ ] Sync status card (says **Local** until Supabase is configured).
- [ ] **Clear all data** — wipes everything back to a blank slate (use freely while testing).

## 9. Sidebar sections ✅ (now functional)
- [ ] **Vendors** — add/edit/delete; booking status; booked vs pending stats.
- [ ] **Guests** — add guests with side + head-count; quick RSVP toggle; totals + side filter.
- [ ] **Calendar** — month view plots your events on their dates; click one to open it; Upcoming panel.
- [ ] **Shopping** — add items, tick as purchased; est. cost vs spent totals.
- [ ] **Documents** — add a doc with a share link, grouped into folders; "Open" launches the link.
- [ ] These persist locally (their own store) — reload and they're still there.

## 10. Responsive / mobile ✅
- [ ] Narrow the window → sidebar collapses to a hamburger drawer; layout reflows.

---

## Where bugs are most likely (start here)
1. **Drag-and-drop** on the Kanban — most complex interaction.
2. **Add/Edit modals** — edge cases (empty fields, huge numbers, past dates).
3. **Confetti at 100%** + progress recalculation.
4. **Mobile drawer** open/close.

## How to report issues
For anything broken: **page + what you did + what happened** (a screenshot helps). Batch them and
I'll fix them together.

See [`progress.md`](progress.md) for the full built-vs-pending breakdown.
