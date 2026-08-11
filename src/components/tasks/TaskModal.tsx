import { useEffect, useMemo, useState } from 'react'
import { Plus, ShoppingBag, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { Modal } from '@/components/ui/Modal'
import { useStore } from '@/store/useStore'
import { allEvents, findEvent } from '@/lib/events'
import { Avatar } from '@/components/ui/Avatar'
import { cn, inr, nowISO } from '@/lib/utils'
import type { ChecklistItem, EventKey, Task, TaskStatus } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  task?: Task | null
  defaultEvent?: EventKey
  defaultStatus?: TaskStatus
}

// Parse a money input string to a positive number (or 0).
const money = (v: string) => Math.max(0, Math.round(Number(v) || 0))

export function TaskModal({ open, onClose, task, defaultEvent, defaultStatus = 'todo' }: Props) {
  const users = useStore((s) => s.users)
  const eventsMeta = useStore((s) => s.settings.events)
  const currentUserId = useStore((s) => s.currentUserId)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const editing = Boolean(task)

  const allEv = allEvents(eventsMeta)
  const fallbackEvent = defaultEvent || allEv[1]?.id || 'common'
  const targetEventId = task ? task.eventKey : fallbackEvent
  const targetEvent = findEvent(eventsMeta, targetEventId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [newItem, setNewItem] = useState('')
  const [budgeted, setBudgeted] = useState('')
  const [actual, setActual] = useState('')
  const [shopping, setShopping] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setChecklist(task?.checklist ?? [])
    setNewItem('')
    setBudgeted(task?.budgeted ? String(task.budgeted) : '')
    setActual(task?.actual ? String(task.actual) : '')
    setShopping(task?.shopping ?? false)
  }, [open, task])

  // When any subtask carries an amount, the task's expense is the SUM of its
  // subtasks and the task-level fields are shown read-only (subtasks override).
  const sums = useMemo(() => {
    const b = checklist.reduce((s, c) => s + (c.budgeted ?? 0), 0)
    const a = checklist.reduce((s, c) => s + (c.actual ?? 0), 0)
    const itemized = checklist.some((c) => (c.budgeted ?? 0) > 0 || (c.actual ?? 0) > 0)
    return { b, a, itemized }
  }, [checklist])

  const shownBudget = sums.itemized ? sums.b : money(budgeted)
  const shownActual = sums.itemized ? sums.a : money(actual)

  const canSave = title.trim().length > 0

  const submit = () => {
    if (!canSave) return
    const payload = {
      title: title.trim(),
      description: description.trim(),
      checklist,
      budgeted: money(budgeted),
      actual: money(actual),
      shopping,
    }
    if (task) {
      updateTask(task.id, payload)
    } else {
      addTask({ ...payload, eventKey: fallbackEvent, status: defaultStatus })
    }
    onClose()
  }

  const addChecklistItem = () => {
    if (!newItem.trim()) return
    setChecklist((c) => [...c, { id: nanoid(6), text: newItem.trim(), done: false, checkedBy: null }])
    setNewItem('')
  }

  const patchItem = (id: string, patch: Partial<ChecklistItem>) =>
    setChecklist((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)))

  const toggleItem = (id: string) =>
    setChecklist((c) =>
      c.map((x) => {
        if (x.id !== id) return x
        const done = !x.done
        return { ...x, done, checkedBy: done ? currentUserId ?? null : null, checkedAt: done ? nowISO() : null }
      }),
    )

  const doneCount = checklist.filter((c) => c.done).length

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit task' : 'New task'}
      subtitle={
        <span className="inline-flex items-center gap-1">
          in <span className="font-medium text-ink">{targetEvent.emoji} {targetEvent.name}</span>
        </span>
      }
      size="md"
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-ink-faint">
            {shownBudget > 0 || shownActual > 0 ? (
              <>Budget <b className="text-ink-soft">{inr(shownBudget)}</b> · Actual <b className="text-ink-soft">{inr(shownActual)}</b></>
            ) : (
              'No expense added'
            )}
          </span>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-gold" onClick={submit} disabled={!canSave}>
              {editing ? 'Save' : 'Add task'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            value={title}
            autoFocus
            placeholder="e.g. Book Haldi decor"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.metaKey && submit()}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[64px] resize-none"
            value={description}
            placeholder="Any details, links, or context…"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Task-level flag: does this task's purchases show on the Shopping page? */}
        <label className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={shopping}
            onChange={(e) => setShopping(e.target.checked)}
            className="h-4 w-4 accent-champagne"
          />
          <ShoppingBag size={15} className="text-champagne-deep" />
          <span className="flex-1">
            Shopping task
            <span className="text-ink-faint">
              {' — '}
              {checklist.length > 0 ? 'its subtasks' : 'this item'} show on the Shopping page
            </span>
          </span>
        </label>

        {/* Task-level expense (optional). Disabled when subtasks carry amounts. */}
        <div>
          <label className="label flex items-center justify-between">
            <span>Expense (optional)</span>
            {sums.itemized && (
              <span className="font-normal normal-case tracking-normal text-champagne-deep">Summed from subtasks</span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <MoneyField label="Budgeted" value={sums.itemized ? String(sums.b) : budgeted} onChange={setBudgeted} disabled={sums.itemized} />
            <MoneyField label="Actual cost" value={sums.itemized ? String(sums.a) : actual} onChange={setActual} disabled={sums.itemized} />
          </div>
          <p className="mt-1.5 text-xs text-ink-faint">
            {sums.itemized
              ? 'This task’s total is the sum of its subtask amounts below.'
              : 'Set an amount for the whole task, or itemise it per subtask below.'}
          </p>
        </div>

        <div>
          <label className="label flex items-center justify-between">
            <span>Subtasks</span>
            {checklist.length > 0 && (
              <span className="font-normal normal-case tracking-normal text-ink-faint">
                {doneCount}/{checklist.length} done
              </span>
            )}
          </label>

          <div className="space-y-1.5">
            {checklist.map((item) => {
              const by = users.find((u) => u.id === item.checkedBy)
              return (
                <div key={item.id} className="rounded-xl border border-line bg-white px-2.5 py-2">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
                        item.done ? 'border-champagne bg-champagne text-white' : 'border-line hover:border-champagne'
                      }`}
                      aria-label={item.done ? 'Mark subtask undone' : 'Mark subtask done'}
                    >
                      {item.done && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                    <input
                      value={item.text}
                      onChange={(e) => patchItem(item.id, { text: e.target.value })}
                      className={`min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 text-sm outline-none focus:bg-ivory ${
                        item.done ? 'text-ink-faint line-through' : 'text-ink'
                      }`}
                    />
                    {item.done && by && (
                      <span className="flex items-center gap-1 rounded-full bg-champagne/10 py-0.5 pl-0.5 pr-2 text-[11px] font-medium text-champagne-deep">
                        <Avatar user={by} size={18} /> {by.name}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setChecklist((c) => c.filter((x) => x.id !== item.id))}
                      className="shrink-0 text-ink-faint transition hover:text-clay"
                      aria-label="Remove subtask"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 pl-[30px]">
                    <MoneySub label="Budget" value={item.budgeted} onChange={(n) => patchItem(item.id, { budgeted: n })} />
                    <MoneySub label="Actual" value={item.actual} onChange={(n) => patchItem(item.id, { actual: n })} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-2 flex gap-2">
            <input
              className="input"
              placeholder="Add a subtask…"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
            />
            <button className="btn-outline px-3" onClick={addChecklistItem}>
              <Plus size={16} />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-ink-faint">Tick a subtask and your name is shown next to it.</p>
        </div>
      </div>
    </Modal>
  )
}

/* Task-level money input with a ₹ prefix and a small caption. */
function MoneyField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</span>
      <div
        className={cn(
          'flex items-center rounded-lg border px-2.5',
          disabled ? 'border-line bg-ivory/70' : 'border-line bg-white focus-within:border-champagne focus-within:ring-4 focus-within:ring-champagne/15',
        )}
      >
        <span className="text-sm text-ink-faint">₹</span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={value}
          disabled={disabled}
          placeholder="0"
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-1.5 py-2 text-sm text-ink outline-none disabled:cursor-not-allowed disabled:text-ink-soft"
        />
      </div>
    </div>
  )
}

/* Compact per-subtask money input. Empty → undefined so it doesn't count. */
function MoneySub({
  label,
  value,
  onChange,
}: {
  label: string
  value?: number
  onChange: (n: number | undefined) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-line bg-white px-2 focus-within:border-champagne">
      <span className="text-xs text-ink-faint">₹</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value ?? ''}
        placeholder={label}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Math.max(0, Math.round(Number(e.target.value) || 0)))}
        className="w-24 bg-transparent py-1.5 text-xs text-ink outline-none placeholder:text-ink-faint"
      />
    </div>
  )
}
