import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useUI } from '@/components/layout/UIProvider'
import { allEvents, findEvent } from '@/lib/events'
import { STATUS_META } from '@/data/config'
import { taskExpense } from '@/lib/expenses'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { cn, fmtDate, inr, isOverdue } from '@/lib/utils'
import type { Task } from '@/lib/types'

type State = 'all' | 'todo' | 'in_progress' | 'completed'

const STATE_TABS: { key: State; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
]

const TITLES: Record<State, { h1: string; sub: string; empty: string }> = {
  all: { h1: 'All tasks', sub: 'Every task across all events, including Common Planning.', empty: 'No tasks yet' },
  todo: { h1: 'To-do tasks', sub: 'Not started yet, by event.', empty: 'Nothing to do 🎉' },
  in_progress: { h1: 'In-progress tasks', sub: 'Underway, by event.', empty: 'Nothing in progress' },
  completed: { h1: 'Completed tasks', sub: 'Everything that’s done, by event.', empty: 'Nothing completed yet' },
}

function matchesState(t: Task, state: State): boolean {
  return state === 'all' || t.status === state
}

// Reached from the Home stat cards. Filters by task state and event, and shows
// each task's subtasks beneath it. Click a task to open it.
export function AllTasks() {
  const tasks = useStore((s) => s.tasks)
  const users = useStore((s) => s.users)
  const eventList = useStore((s) => s.settings.events)
  const { openTask } = useUI()
  const events = allEvents(eventList)

  const [params, setParams] = useSearchParams()
  const state = (params.get('state') as State) || 'all'
  const eventFilter = params.get('event') || 'all'
  const validState: State = STATE_TABS.some((t) => t.key === state) ? state : 'all'

  const setParam = (key: 'state' | 'event', value: string) => {
    const next = new URLSearchParams(params)
    if (value === (key === 'state' ? 'all' : 'all')) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const filtered = useMemo(() => tasks.filter((t) => matchesState(t, validState)), [tasks, validState])

  const groups = useMemo(
    () =>
      events
        .filter((ev) => eventFilter === 'all' || ev.id === eventFilter)
        .map((ev) => ({ event: ev, items: filtered.filter((t) => findEvent(eventList, t.eventKey).id === ev.id) }))
        .filter((g) => g.items.length > 0),
    [events, filtered, eventFilter, eventList],
  )

  const meta = TITLES[validState]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">{meta.h1}</h1>
        <p className="text-ink-soft">{meta.sub}</p>
      </div>

      {/* State filter */}
      <div className="flex flex-wrap gap-1.5">
        {STATE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setParam('state', t.key)}
            className={`chip transition ${validState === t.key ? 'bg-champagne text-white' : 'bg-white text-ink-soft hover:bg-ivory'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Event filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setParam('event', 'all')}
          className={`chip transition ${eventFilter === 'all' ? 'bg-ink text-white' : 'bg-white text-ink-soft hover:bg-ivory'}`}
        >
          All events
        </button>
        {events.map((ev) => (
          <button
            key={ev.id}
            onClick={() => setParam('event', ev.id)}
            className={`chip transition ${eventFilter === ev.id ? 'bg-ink text-white' : 'bg-white text-ink-soft hover:bg-ivory'}`}
          >
            {ev.emoji} {ev.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 || groups.length === 0 ? (
        <EmptyState emoji="📝" title={meta.empty} hint="Try a different filter, or add tasks inside any event." />
      ) : (
        <div className="space-y-5">
          {groups.map(({ event, items }) => (
            <div key={event.id} className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="flex items-center gap-2 border-b border-line bg-offwhite/50 px-4 py-2.5">
                <span className="text-base">{event.emoji}</span>
                <span className="text-sm font-semibold text-ink">{event.name}</span>
                <span className="ml-auto text-xs text-ink-faint">{items.length} task{items.length === 1 ? '' : 's'}</span>
              </div>
              <div className="divide-y divide-line">
                {items.map((t) => {
                  const statusMeta = STATUS_META[t.status]
                  const assignee = users.find((u) => u.id === t.assignedTo)
                  const exp = taskExpense(t)
                  const hasExp = exp.budgeted > 0 || exp.actual > 0
                  const overdue = t.status !== 'completed' && t.status !== 'cancelled' && isOverdue(t.dueDate)
                  return (
                    <button
                      key={t.id}
                      onClick={() => openTask({ task: t })}
                      className="block w-full px-4 py-3 text-left transition hover:bg-offwhite/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: statusMeta.color }} title={statusMeta.label} />
                        <div className="min-w-0 flex-1">
                          <p className={cn('truncate text-sm font-medium', t.status === 'completed' ? 'text-ink-faint line-through' : 'text-ink')}>
                            {t.title}
                          </p>
                          <p className="truncate text-xs text-ink-faint">
                            {statusMeta.label}
                            {t.dueDate ? ` · ${overdue ? 'Overdue ' : ''}${fmtDate(t.dueDate, 'd MMM')}` : ''}
                            {t.checklist.length > 0 ? ` · ${t.checklist.filter((c) => c.done).length}/${t.checklist.length} subtasks` : ''}
                          </p>
                        </div>
                        {hasExp && (
                          <span className="shrink-0 text-xs tabular-nums text-ink-soft">{inr(exp.actual || exp.budgeted, { compact: true })}</span>
                        )}
                        {assignee && <Avatar user={assignee} size={22} />}
                      </div>

                      {t.checklist.length > 0 && (
                        <div className="ml-1.5 mt-2 space-y-1 border-l-2 border-line pl-3">
                          {t.checklist.map((sub) => {
                            const cost = sub.actual || sub.budgeted || 0
                            return (
                              <div key={sub.id} className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'grid h-3.5 w-3.5 shrink-0 place-items-center rounded border',
                                    sub.done ? 'border-sage-deep bg-sage-deep text-white' : 'border-line',
                                  )}
                                >
                                  {sub.done && <Check size={9} />}
                                </span>
                                <span className={cn('min-w-0 flex-1 truncate text-xs', sub.done ? 'text-ink-faint line-through' : 'text-ink-soft')}>
                                  {sub.text}
                                </span>
                                {cost > 0 && <span className="shrink-0 text-[11px] tabular-nums text-ink-faint">{inr(cost, { compact: true })}</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
