# 🧪 Wedding 101 — Testing Checklist

A feature-by-feature walkthrough for testing the app and noting what to fix. The app starts as a
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

## 2. Navigation (regression) ✅
- [ ] Click every sidebar link (Home, Common Planning, each event, Expenses, Activity, Calendar,
      Vendors, Guests, Shopping, Documents, Settings) → the page **renders** (no blank/invisible page).
- [ ] Rapidly click between several links → each destination is fully visible, never stuck faded out.
- [ ] Mobile drawer links navigate and close the drawer.

## 3. Home dashboard ✅
- [ ] Greeting shows your name; wedding countdown + overall progress ring animate.
- [ ] Task stat cards: Total / Completed / Pending / Overdue.
- [ ] Money stat cards: **Budgeted / Actual spent / Over-or-Under budget** (variance).
- [ ] On first run everything reads 0 / empty (that's expected).
- [ ] **Event progress** cards: ≤4 events sit on one line; 5+ split into two rows (e.g. 3 above, 2 below).
      **Every card is the same size** and a short last row is **centred** — no card is wider than the rest.
- [ ] Each event card shows its **actual / budgeted** figure (once a task in it has a cost).
- [ ] Only an **Add task** button (there is no "Add expense" — expenses live on tasks).
- [ ] "Today & overdue", "Upcoming events", "Recent activity", "Recently completed" populate as you add data.

## 4. Tasks / Kanban — test hard ✅
- [ ] **Add task** — minimal modal: Title, Description, **Expense (optional)**, Subtasks.
- [ ] **Click a card's title** → opens the edit modal (no edit icon needed).
- [ ] **Drag a card** across To Do → In Progress → Completed → Cancelled.
- [ ] Click the **circle** on a card to mark complete / undo.
- [ ] **⋯ menu** on a card → Duplicate, Delete.
- [ ] Each subtask has a **cart toggle** — flag it to make it a purchase (shows in Shopping).
- [ ] **Search / Filters / Sort** narrow the board.
- [ ] A card shows a small **₹ chip** when the task has a cost, and a `n/n` chip for subtasks.
- [ ] Complete every task in an event → **confetti fires** at 100%.

## 5. Task expenses — budgeted vs. actual ✅ (the new core)
- [ ] In the task modal, set **Budgeted** and **Actual cost** for the whole task → footer shows the summary.
- [ ] Add subtasks; give a subtask its own **Budget** / **Actual** amounts.
- [ ] As soon as any subtask has an amount, the **task-level fields go read-only** and show the **sum**
      of the subtasks ("Summed from subtasks") — i.e. subtasks override the task-level figures.
- [ ] Remove all subtask amounts → the task-level fields become editable again.
- [ ] Click a subtask's **text** to rename it inline (no edit button); tick it → your name shows next to it.
- [ ] Save, reopen the task → all amounts persist.

## 6. Event workspace (open any event) ✅
- [ ] **Overview** — task stats; **Spending** card with Budgeted / Actual / Variance and an
      "actual vs budget" bar; "Next up"; "Who's on it".
- [ ] **Tasks** — Kanban board (see §4).
- [ ] **Expenses** — **read-only** roll-up: this event's Budgeted / Actual / Variance, plus a list of the
      tasks that carry a cost. Clicking a row opens that task to edit its amounts (no "add expense" here).
- [ ] **Notes** — type; confirm it auto-saves ("Saved ✓").
- [ ] Header "actual of budgeted" chip + mini-stats update as task amounts change.

## 7. Expenses page (Common) ✅
- [ ] Cards: **Budgeted / Actual spent / Over-or-Under budget / Events with spend**.
- [ ] "Spending by event" bars show each event's **actual / budgeted**; bar turns red when over budget.
- [ ] "All task expenses" lists every costed task across events (with an event tag + a "subtasks" badge
      when itemised); variance is `+` red over budget, `−` green under. Click a row → opens the task.
- [ ] With no costs anywhere, a friendly empty state explains where to add amounts. Everything is read-only.

## 8. Activity · Search · Quick-add ✅
- [ ] Sidebar → **Activity**: timeline attributed to the right person.
- [ ] **Top search**: type a task name → results → clicking jumps to it.
- [ ] **Add task** (top-right) opens the task modal from anywhere.

## 9. Settings ✅
- [ ] Switch profiles; "Back to profile screen".
- [ ] Sync status card (says **Local** until Supabase is configured).
- [ ] **Clear all data** — wipes everything back to a blank slate (use freely while testing).

## 10. Shopping — linked to tasks ✅
- [ ] Flag a task subtask with the **cart icon** → it appears on the **Shopping** page under its event.
- [ ] **Tick an item in Shopping** → the subtask shows checked in the task (and vice-versa — same record).
- [ ] **Add item** in Shopping → pick an event (and optionally a task) → it becomes a subtask on that task,
      or an auto-created "Shopping" bucket; it shows in the event's Tasks tab too.
- [ ] Tick **Already bought** → an **Actual cost** field appears; the amount feeds the event's **Actual
      spent** and the overall Expenses totals.
- [ ] **Click an item's name** to edit it (no edit icon); delete removes it from the task.
- [ ] Removing the last item from an auto "Shopping" bucket deletes that empty task.

## 11. Other sidebar sections ✅
- [ ] **Vendors** — add/edit/delete; booking status; booked vs pending stats.
- [ ] **Guests** — add guests, tick which **functions** they're invited to, head-count, **hotel rooms**,
      quick RSVP toggle; **filter by event** to see each function's list; totals (incl. **Rooms needed**)
      reflect the filter; a bed chip shows a family's room count on its row.
- [ ] **Documents** — add a doc with a share link, grouped into folders; "Open" launches the link.
- [ ] (Calendar has been removed.)

## 12. Responsive / mobile ✅
- [ ] Narrow the window → sidebar collapses to a hamburger drawer; layout reflows.
- [ ] Event progress cards drop to a 2-up grid on mobile.

---

## Where bugs are most likely (start here)
1. **Task expense roll-up** — mixing task-level and subtask amounts; the "subtasks override" switch.
2. **Drag-and-drop** on the Kanban — most complex interaction.
3. **Add/Edit modals** — edge cases (empty fields, huge numbers, past dates).
4. **Confetti at 100%** + progress recalculation.
5. **Mobile drawer** open/close.

## How to report issues
For anything broken: **page + what you did + what happened** (a screenshot helps). Batch them and
I'll fix them together.

See [`progress.md`](progress.md) for the full built-vs-pending breakdown and
[`README.md`](README.md#-make-it-yours) for customising it.
