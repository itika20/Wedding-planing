import { ListChecks } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useUI } from '@/components/layout/UIProvider'
import { findEvent } from '@/lib/events'
import { taskExpense } from '@/lib/expenses'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn, inr } from '@/lib/utils'
import type { EventKey } from '@/lib/types'

// A read-only ledger of task expenses. All figures come from tasks (and their
// subtasks) — this is just a view. Click a row to open the task and edit amounts.
export function TaskExpenseList({ eventKey, showEvent }: { eventKey?: EventKey; showEvent?: boolean }) {
  const tasks = useStore((s) => s.tasks)
  const events = useStore((s) => s.settings.events)
  const { openTask } = useUI()

  const rows = tasks
    .filter((t) => (eventKey ? t.eventKey === eventKey : true))
    .map((t) => ({ task: t, e: taskExpense(t) }))
    .filter((r) => r.e.budgeted > 0 || r.e.actual > 0)
    .sort((a, b) => Math.max(b.e.actual, b.e.budgeted) - Math.max(a.e.actual, a.e.budgeted))

  if (rows.length === 0) {
    return (
      <EmptyState
        emoji="🧾"
        title="No expenses yet"
        hint="Open a task and add a budget or actual amount — on the task itself, or itemised across its subtasks. It rolls up here automatically."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      {/* header */}
      <div className="hidden items-center gap-3 border-b border-line bg-offwhite/50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint sm:flex">
        <span className="flex-1">Task</span>
        <span className="w-24 text-right">Budgeted</span>
        <span className="w-24 text-right">Actual</span>
        <span className="w-24 text-right">Variance</span>
      </div>
      <div className="divide-y divide-line">
        {rows.map(({ task, e }) => {
          const ev = findEvent(events, task.eventKey)
          const variance = e.actual - e.budgeted
          const over = variance > 0
          return (
            <button
              key={task.id}
              onClick={() => openTask({ task })}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-offwhite/40"
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                  {showEvent && <span className="text-base">{ev.emoji}</span>}
                  <span className="truncate">{task.title}</span>
                  {e.itemized && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-champagne/10 px-1.5 py-0.5 text-[10px] font-semibold text-champagne-deep">
                      <ListChecks size={10} /> subtasks
                    </span>
                  )}
                </p>
                {showEvent && <p className="truncate text-xs text-ink-faint">{ev.name}</p>}
              </div>
              <span className="w-24 text-right text-sm tabular-nums text-ink-soft">{e.budgeted ? inr(e.budgeted) : '—'}</span>
              <span className="w-24 text-right text-sm font-semibold tabular-nums text-ink">{e.actual ? inr(e.actual) : '—'}</span>
              <span
                className={cn(
                  'w-24 text-right text-sm tabular-nums',
                  variance === 0 ? 'text-ink-faint' : over ? 'text-clay' : 'text-sage-deep',
                )}
              >
                {variance === 0 ? '—' : `${over ? '+' : '−'}${inr(Math.abs(variance))}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
