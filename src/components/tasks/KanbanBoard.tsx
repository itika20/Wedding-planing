import { useMemo, useState } from 'react'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import type { EventKey, Priority, Task, TaskStatus } from '@/lib/types'
import { KANBAN_COLUMNS, PRIORITY_META, STATUS_META } from '@/data/config'
import { useStore } from '@/store/useStore'
import { useUI } from '@/components/layout/UIProvider'
import { TaskCard } from './TaskCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

type SortKey = 'due' | 'priority' | 'created'
const PRIORITY_RANK: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export function KanbanBoard({ eventKey }: { eventKey: EventKey }) {
  const tasks = useStore((s) => s.tasks)
  const moveTask = useStore((s) => s.moveTask)
  const users = useStore((s) => s.users)
  const { openTask } = useUI()

  const [search, setSearch] = useState('')
  const [assignee, setAssignee] = useState('')
  const [priority, setPriority] = useState('')
  const [sort, setSort] = useState<SortKey>('due')
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const eventTasks = useMemo(() => {
    let list = tasks.filter((t) => t.eventKey === eventKey)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    }
    if (assignee) list = list.filter((t) => t.assignedTo === assignee)
    if (priority) list = list.filter((t) => t.priority === priority)
    list = [...list].sort((a, b) => {
      if (sort === 'priority') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      if (sort === 'created') return b.createdAt.localeCompare(a.createdAt)
      // due
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    })
    return list
  }, [tasks, eventKey, search, assignee, priority, sort])

  const columns = KANBAN_COLUMNS.map((status) => ({
    status,
    items: eventTasks.filter((t) => t.status === status),
  }))

  const filtersActive = Boolean(search || assignee || priority)

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            className="input pl-9"
            placeholder="Search tasks in this event…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={cn('btn-outline', showFilters && 'border-champagne text-champagne-deep')}
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal size={15} />
          Filters
          {filtersActive && <span className="h-1.5 w-1.5 rounded-full bg-champagne" />}
        </button>
        <button className="btn-gold" onClick={() => openTask({ defaultEvent: eventKey })}>
          <Plus size={16} /> Add task
        </button>
      </div>

      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white/70 p-3">
          <select className="input max-w-[160px]" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">All assignees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.emoji} {u.name}
              </option>
            ))}
          </select>
          <select className="input max-w-[160px]" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All priorities</option>
            {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-2 text-sm text-ink-soft">
            <span>Sort by</span>
            <select className="input max-w-[140px]" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="due">Due date</option>
              <option value="priority">Priority</option>
              <option value="created">Recently added</option>
            </select>
          </div>
        </div>
      )}

      {/* Board */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map(({ status, items }) => (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(status)
            }}
            onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData('text/task')
              if (id) moveTask(id, status)
              setDragOver(null)
            }}
            className={cn(
              'flex flex-col rounded-2xl border p-3 transition-colors',
              dragOver === status ? 'border-champagne bg-champagne/5' : 'border-line bg-offwhite/50',
            )}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[status].color }} />
                <span className="text-sm font-semibold text-ink">{STATUS_META[status].label}</span>
              </div>
              <span className="chip bg-white text-ink-soft">{items.length}</span>
            </div>

            <div className="flex flex-1 flex-col gap-2.5">
              <AnimatePresence>
                {items.map((t) => (
                  <TaskCard key={t.id} task={t} onEdit={(task) => openTask({ task })} />
                ))}
              </AnimatePresence>
              {items.length === 0 && (
                <button
                  onClick={() => openTask({ defaultEvent: eventKey, defaultStatus: status })}
                  className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-line py-6 text-xs text-ink-faint transition hover:border-champagne hover:text-champagne-deep"
                >
                  <Plus size={13} /> Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {eventTasks.length === 0 && !filtersActive && (
        <div className="mt-4">
          <EmptyState
            emoji="📝"
            title="No tasks yet"
            hint="Break this event down into to-dos. Add your first task to get the ball rolling."
            action={
              <button className="btn-gold" onClick={() => openTask({ defaultEvent: eventKey })}>
                <Plus size={16} /> Add first task
              </button>
            }
          />
        </div>
      )}
    </div>
  )
}
