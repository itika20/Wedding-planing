import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { useUI } from '@/components/layout/UIProvider'
import { allEvents, findEvent } from '@/lib/events'
import { STATUS_META } from '@/data/config'
import { taskExpense } from '@/lib/expenses'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { cn, fmtDate, inr, isOverdue } from '@/lib/utils'

// Every task across every event (including Common Planning), grouped by event.
// Reached from the Home "Total tasks" card. Click a row to open the task.
export function AllTasks() {
  const tasks = useStore((s) => s.tasks)
  const users = useStore((s) => s.users)
  const eventList = useStore((s) => s.settings.events)
  const { openTask } = useUI()
  const events = allEvents(eventList)

  const groups = useMemo(
    () =>
      events
        .map((ev) => ({ event: ev, items: tasks.filter((t) => findEvent(eventList, t.eventKey).id === ev.id) }))
        .filter((g) => g.items.length > 0),
    [events, tasks, eventList],
  )

  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">All tasks</h1>
        <p className="text-ink-soft">Every task across all events, including Common Planning.</p>
      </div>

      {total === 0 ? (
        <EmptyState
          emoji="📝"
          title="No tasks yet"
          hint="Add tasks inside any event and they'll all show up here."
        />
      ) : (
        <>
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">{completed}</span> of {total} completed
          </p>
          <div className="space-y-5">
            {groups.map(({ event, items }) => {
              const done = items.filter((t) => t.status === 'completed').length
              return (
                <div key={event.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="flex items-center gap-2 border-b border-line bg-offwhite/50 px-4 py-2.5">
                    <span className="text-base">{event.emoji}</span>
                    <span className="text-sm font-semibold text-ink">{event.name}</span>
                    <span className="ml-auto text-xs text-ink-faint">{done}/{items.length} done</span>
                  </div>
                  <div className="divide-y divide-line">
                    {items.map((t) => {
                      const meta = STATUS_META[t.status]
                      const assignee = users.find((u) => u.id === t.assignedTo)
                      const exp = taskExpense(t)
                      const hasExp = exp.budgeted > 0 || exp.actual > 0
                      const overdue = t.status !== 'completed' && t.status !== 'cancelled' && isOverdue(t.dueDate)
                      return (
                        <button
                          key={t.id}
                          onClick={() => openTask({ task: t })}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-offwhite/40"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: meta.color }}
                            title={meta.label}
                          />
                          <div className="min-w-0 flex-1">
                            <p className={cn('truncate text-sm font-medium', t.status === 'completed' ? 'text-ink-faint line-through' : 'text-ink')}>
                              {t.title}
                            </p>
                            <p className="truncate text-xs text-ink-faint">
                              {meta.label}
                              {t.dueDate ? ` · ${overdue ? 'Overdue ' : ''}${fmtDate(t.dueDate, 'd MMM')}` : ''}
                            </p>
                          </div>
                          {hasExp && (
                            <span className="shrink-0 text-xs tabular-nums text-ink-soft">
                              {inr(exp.actual || exp.budgeted, { compact: true })}
                            </span>
                          )}
                          {assignee && <Avatar user={assignee} size={22} />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
