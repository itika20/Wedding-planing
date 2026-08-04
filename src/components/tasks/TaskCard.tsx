import { CalendarDays, Check, CheckSquare, Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Task } from '@/lib/types'
import { PRIORITY_META, getEvent } from '@/data/config'
import { useStore } from '@/store/useStore'
import { Avatar } from '@/components/ui/Avatar'
import { cn, fmtDateShort, isOverdue } from '@/lib/utils'

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
  const deleteTask = useStore((s) => s.deleteTask)
  const duplicateTask = useStore((s) => s.duplicateTask)
  const updateTask = useStore((s) => s.updateTask)
  const [menu, setMenu] = useState(false)

  const assignee = users.find((u) => u.id === task.assignedTo)
  const prio = PRIORITY_META[task.priority]
  const done = task.checklist.filter((c) => c.done).length
  const overdue = task.status !== 'completed' && task.status !== 'cancelled' && isOverdue(task.dueDate)
  const isDone = task.status === 'completed'

  return (
    <motion.div
      ref={ref}
      layout
      draggable={draggable}
      onDragStart={(e) => {
        ;(e as unknown as DragEvent).dataTransfer?.setData('text/task', task.id)
      }}
      className={cn(
        'group card cursor-grab p-3.5 active:cursor-grabbing',
        isDone && 'opacity-80',
      )}
      style={{ borderLeft: `3px solid ${prio.color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <button
            onClick={() => updateTask(task.id, { status: isDone ? 'todo' : 'completed' })}
            className={cn(
              'mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full border transition',
              isDone ? 'border-sage-deep bg-sage-deep text-white' : 'border-line hover:border-sage',
            )}
            style={{ height: 18, width: 18 }}
            title={isDone ? 'Mark as to-do' : 'Mark complete'}
          >
            {isDone && <Check size={11} />}
          </button>
          <p className={cn('text-sm font-medium leading-snug text-ink', isDone && 'line-through text-ink-soft')}>
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

      <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-6">
        {showEvent && (
          <span className="chip bg-ivory text-ink-soft">
            {getEvent(task.eventKey).emoji} {getEvent(task.eventKey).name}
          </span>
        )}
        <span className="chip" style={{ background: prio.bg, color: prio.color }}>
          {prio.label}
        </span>
        {task.dueDate && (
          <span className={cn('chip', overdue ? 'bg-clay-soft text-clay' : 'bg-ivory text-ink-soft')}>
            <CalendarDays size={11} />
            {fmtDateShort(task.dueDate)}
          </span>
        )}
        {task.checklist.length > 0 && (
          <span className="chip bg-ivory text-ink-soft">
            <CheckSquare size={11} />
            {done}/{task.checklist.length}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between pl-6">
        <div className="flex items-center gap-1.5 text-xs text-ink-faint">
          {assignee ? (
            <>
              <Avatar user={assignee} size={20} />
              <span>{assignee.name}</span>
            </>
          ) : (
            <span className="text-ink-faint">Unassigned</span>
          )}
        </div>
        {!isDone && task.completionPct > 0 && (
          <span className="text-xs font-semibold text-champagne-deep">{task.completionPct}%</span>
        )}
      </div>
    </motion.div>
  )
})
