import { Check, CheckSquare, Copy, MoreHorizontal, Pencil, Trash2, Wallet } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Task } from '@/lib/types'
import { findEvent } from '@/lib/events'
import { taskExpense } from '@/lib/expenses'
import { useStore } from '@/store/useStore'
import { Avatar } from '@/components/ui/Avatar'
import { cn, inr } from '@/lib/utils'

interface Props {
  task: Task
  onEdit: (t: Task) => void
  showEvent?: boolean
  draggable?: boolean
}

export const TaskCard = forwardRef<HTMLDivElement, Props>(function TaskCard(
  { task, onEdit, showEvent, draggable = true },
  ref,
) {
  const users = useStore((s) => s.users)
  const events = useStore((s) => s.settings.events)
  const deleteTask = useStore((s) => s.deleteTask)
  const duplicateTask = useStore((s) => s.duplicateTask)
  const updateTask = useStore((s) => s.updateTask)
  const [menu, setMenu] = useState(false)

  const event = findEvent(events, task.eventKey)
  const done = task.checklist.filter((c) => c.done).length
  const isDone = task.status === 'completed'
  const exp = taskExpense(task)
  const hasExp = exp.budgeted > 0 || exp.actual > 0

  // Unique people who ticked a subtask.
  const checkerIds = Array.from(
    new Set(task.checklist.filter((c) => c.done && c.checkedBy).map((c) => c.checkedBy as string)),
  )
  const checkers = checkerIds.map((id) => users.find((u) => u.id === id)).filter(Boolean)

  return (
    <motion.div
      ref={ref}
      layout
      draggable={draggable}
      onDragStart={(e) => {
        ;(e as unknown as DragEvent).dataTransfer?.setData('text/task', task.id)
      }}
      className={cn('group card cursor-grab p-3.5 active:cursor-grabbing', isDone && 'opacity-80')}
      style={{ borderLeft: `3px solid ${event.accent}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <button
            onClick={() => updateTask(task.id, { status: isDone ? 'todo' : 'completed' })}
            className={cn(
              'mt-0.5 grid shrink-0 place-items-center rounded-full border transition',
              isDone ? 'border-sage-deep bg-sage-deep text-white' : 'border-line hover:border-champagne',
            )}
            style={{ height: 18, width: 18 }}
            title={isDone ? 'Mark as to-do' : 'Mark complete'}
          >
            {isDone && <Check size={11} />}
          </button>
          <p className={cn('text-sm font-medium leading-snug text-ink', isDone && 'text-ink-soft line-through')}>
            {task.title}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenu((v) => !v)}
            onBlur={() => setTimeout(() => setMenu(false), 150)}
            className="rounded-md p-1 text-ink-faint opacity-0 transition hover:bg-ink/5 hover:text-ink group-hover:opacity-100"
          >
            <MoreHorizontal size={16} />
          </button>
          {menu && (
            <div className="absolute right-0 top-7 z-20 w-36 overflow-hidden rounded-lg border border-line bg-white p-1 shadow-lift">
              <button className="menu-item" onMouseDown={() => onEdit(task)}>
                <Pencil size={13} /> Edit
              </button>
              <button className="menu-item" onMouseDown={() => duplicateTask(task.id)}>
                <Copy size={13} /> Duplicate
              </button>
              <button className="menu-item text-clay" onMouseDown={() => deleteTask(task.id)}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && <p className="mt-1.5 line-clamp-2 pl-6 text-xs text-ink-soft">{task.description}</p>}

      {(showEvent || task.checklist.length > 0 || checkers.length > 0 || hasExp) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-6">
          {showEvent && (
            <span className="chip bg-ivory text-ink-soft">
              {event.emoji} {event.name}
            </span>
          )}
          {task.checklist.length > 0 && (
            <span className="chip bg-ivory text-ink-soft">
              <CheckSquare size={11} />
              {done}/{task.checklist.length}
            </span>
          )}
          {hasExp && (
            <span
              className="chip bg-ivory text-ink-soft"
              title={`Budget ${inr(exp.budgeted)} · Actual ${inr(exp.actual)}`}
            >
              <Wallet size={11} />
              {inr(exp.actual || exp.budgeted, { compact: true })}
            </span>
          )}
          {checkers.length > 0 && (
            <span className="ml-auto flex items-center -space-x-1.5" title="Ticked subtasks">
              {checkers.slice(0, 3).map((u) => (
                <Avatar key={u!.id} user={u} size={20} ring />
              ))}
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
})
