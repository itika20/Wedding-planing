import { useEffect, useMemo, useState } from 'react'
import { Check, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { allEvents, findEvent } from '@/lib/events'
import { Modal } from '@/components/ui/Modal'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { cn, inr, nowISO } from '@/lib/utils'
import type { ChecklistItem, EventMeta, Task } from '@/lib/types'

const FOR_OPTIONS = ['Bride', 'Parents', 'Decor', 'Gifts', 'Accessories', 'Household', 'Other']

interface ShopRow {
  taskId: string
  task: Task
  item: ChecklistItem
}

export function Shopping() {
  const tasks = useStore((s) => s.tasks)
  const users = useStore((s) => s.users)
  const eventList = useStore((s) => s.settings.events)
  const toggleSubtask = useStore((s) => s.toggleSubtask)
  const removeSubtask = useStore((s) => s.removeSubtask)
  const setSubtask = useStore((s) => s.setSubtask)

  const events = allEvents(eventList)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ShopRow | null>(null)

  // Every subtask flagged as a purchase, across all tasks/events. One source of
  // truth — this is a live view of the tasks, not a separate list.
  const rows: ShopRow[] = useMemo(
    () =>
      tasks.flatMap((task) =>
        (task.checklist ?? [])
          .filter((item) => item.shopping)
          .map((item) => ({ taskId: task.id, task, item })),
      ),
    [tasks],
  )

  const totals = useMemo(() => {
    const bought = rows.filter((r) => r.item.done)
    return {
      count: rows.length,
      bought: bought.length,
      est: rows.reduce((s, r) => s + (r.item.budgeted || 0), 0),
      // Real money out: actual where known, else the estimate for bought items.
      spent: bought.reduce((s, r) => s + (r.item.actual || r.item.budgeted || 0), 0),
    }
  }, [rows])

  const groups = useMemo(() => {
    return events
      .map((ev) => ({ event: ev, items: rows.filter((r) => findEvent(eventList, r.task.eventKey).id === ev.id) }))
      .filter((g) => g.items.length > 0)
  }, [events, rows, eventList])

  const openNew = () => {
    setEditing(null)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Shopping</h1>
          <p className="text-ink-soft">Every purchase across your events — ticked off as you buy.</p>
        </div>
        <button className="btn-gold" onClick={openNew}>
          <Plus size={16} /> Add item
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard index={0} icon={<ShoppingBag size={16} />} label="Items" value={totals.count} accent="#D4AF37" />
        <StatCard index={1} icon={<Check size={16} />} label="Bought" value={`${totals.bought}/${totals.count}`} accent="#5F7A5F" />
        <StatCard index={2} icon={<ShoppingBag size={16} />} label="Est. cost" value={inr(totals.est, { compact: true })} accent="#8CA98C" />
        <StatCard index={3} icon={<ShoppingBag size={16} />} label="Actual spent" value={inr(totals.spent, { compact: true })} accent="#E0A458" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          emoji="🛍️"
          title="Nothing on the list yet"
          hint="Add an item here, or mark any task subtask as a purchase (the cart icon) — it shows up here, grouped by event."
          action={<button className="btn-gold" onClick={openNew}><Plus size={16} /> Add item</button>}
        />
      ) : (
        <div className="space-y-5">
          {groups.map(({ event, items }) => {
            const bought = items.filter((r) => r.item.done).length
            return (
              <div key={event.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="flex items-center gap-2 border-b border-line bg-offwhite/50 px-4 py-2.5">
                  <span className="text-base">{event.emoji}</span>
                  <span className="text-sm font-semibold text-ink">{event.name}</span>
                  <span className="ml-auto text-xs text-ink-faint">{bought}/{items.length} bought</span>
                </div>
                <div className="divide-y divide-line">
                  {items.map((row) => {
                    const { taskId, task, item } = row
                    const by = users.find((u) => u.id === item.checkedBy)
                    const meta = [item.forWhom, item.store, task.shoppingList ? null : `in ${task.title}`]
                      .filter(Boolean)
                      .join(' · ')
                    const est = item.budgeted || 0
                    const paid = item.actual || 0
                    return (
                      <div key={item.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-offwhite/40">
                        <button
                          onClick={() => toggleSubtask(taskId, item.id)}
                          className={cn(
                            'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition',
                            item.done ? 'border-sage-deep bg-sage-deep text-white' : 'border-line hover:border-champagne',
                          )}
                          title={item.done ? 'Mark as not bought' : 'Mark as bought'}
                        >
                          {item.done && <Check size={12} />}
                        </button>
                        {/* Click the name to edit — no separate edit icon. */}
                        <button
                          onClick={() => { setEditing(row); setOpen(true) }}
                          className="min-w-0 flex-1 text-left"
                          title="Edit item"
                        >
                          <p className={cn('truncate text-sm font-medium', item.done ? 'text-ink-faint line-through' : 'text-ink')}>
                            {item.text}
                          </p>
                          {meta && <p className="truncate text-xs text-ink-faint">{meta}</p>}
                        </button>
                        {item.done && by && <Avatar user={by} size={20} ring />}
                        {(est > 0 || paid > 0) && (
                          <div className="text-right leading-tight">
                            {paid > 0 && <p className="text-sm font-semibold tabular-nums text-ink">{inr(paid)}</p>}
                            {est > 0 && (
                              <p className="text-xs tabular-nums text-ink-faint">{paid > 0 ? `est ${inr(est)}` : inr(est)}</p>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => removeSubtask(taskId, item.id)}
                          className="shrink-0 rounded-md p-1.5 text-ink-faint opacity-0 transition hover:bg-clay-soft/50 hover:text-clay group-hover:opacity-100"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ShoppingModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        events={events}
        tasks={tasks}
        onSaveEdit={(patch) => {
          if (editing) setSubtask(editing.taskId, editing.item.id, patch)
          setOpen(false)
        }}
      />
    </div>
  )
}

function ShoppingModal({
  open,
  onClose,
  editing,
  events,
  tasks,
  onSaveEdit,
}: {
  open: boolean
  onClose: () => void
  editing: ShopRow | null
  events: EventMeta[]
  tasks: Task[]
  onSaveEdit: (patch: Partial<ChecklistItem>) => void
}) {
  const addShoppingItem = useStore((s) => s.addShoppingItem)
  const currentUserId = useStore((s) => s.currentUserId)
  const isEdit = Boolean(editing)

  const [name, setName] = useState('')
  const [eventKey, setEventKey] = useState('')
  const [taskId, setTaskId] = useState('') // '' → the event's Shopping bucket
  const [forWhom, setForWhom] = useState('')
  const [cost, setCost] = useState('') // estimated
  const [actualCost, setActualCost] = useState('')
  const [store, setStore] = useState('')
  const [purchased, setPurchased] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.item.text)
      setEventKey(editing.task.eventKey)
      setTaskId(editing.taskId)
      setForWhom(editing.item.forWhom ?? '')
      setCost(editing.item.budgeted ? String(editing.item.budgeted) : '')
      setActualCost(editing.item.actual ? String(editing.item.actual) : '')
      setStore(editing.item.store ?? '')
      setPurchased(editing.item.done)
    } else {
      setName('')
      setEventKey(events[1]?.id ?? events[0]?.id ?? 'common')
      setTaskId('')
      setForWhom('')
      setCost('')
      setActualCost('')
      setStore('')
      setPurchased(false)
    }
  }, [open, editing, events])

  const eventTasks = tasks.filter((t) => t.eventKey === eventKey && !t.shoppingList)
  const canSave = name.trim().length > 0
  const num = (v: string) => (Number(v) > 0 ? Math.round(Number(v)) : 0)

  const save = () => {
    if (!canSave) return
    if (isEdit && editing) {
      const patch: Partial<ChecklistItem> = {
        text: name.trim(),
        budgeted: num(cost) || undefined,
        actual: purchased ? num(actualCost) || undefined : undefined,
        forWhom: forWhom.trim() || undefined,
        store: store.trim() || undefined,
      }
      // Reflect a bought/unbought change (and attribute it) — same subtask record.
      if (purchased !== editing.item.done) {
        patch.done = purchased
        patch.checkedBy = purchased ? currentUserId ?? null : null
        patch.checkedAt = purchased ? nowISO() : null
      }
      onSaveEdit(patch)
    } else {
      addShoppingItem({
        eventKey,
        taskId: taskId || undefined,
        text: name.trim(),
        cost: num(cost),
        actual: purchased ? num(actualCost) : 0,
        forWhom,
        store,
        purchased,
      })
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit item' : 'Add item'}
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-gold" disabled={!canSave} onClick={save}>
            {isEdit ? 'Save' : 'Add item'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Item</label>
          <input className="input" autoFocus value={name} placeholder="e.g. Bridal sandals" onChange={(e) => setName(e.target.value)} />
        </div>

        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Event</label>
              <select className="input" value={eventKey} onChange={(e) => { setEventKey(e.target.value); setTaskId('') }}>
                {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.emoji} {ev.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Add to</label>
              <select className="input" value={taskId} onChange={(e) => setTaskId(e.target.value)}>
                <option value="">Shopping list (default)</option>
                {eventTasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          </div>
        )}
        {isEdit && editing && (
          <p className="rounded-xl border border-line bg-offwhite/40 px-3 py-2 text-xs text-ink-soft">
            In {findEventName(events, editing.task.eventKey)} · {editing.task.shoppingList ? 'Shopping list' : editing.task.title}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">For</label>
            <select className="input" value={forWhom} onChange={(e) => setForWhom(e.target.value)}>
              <option value="">General</option>
              {FOR_OPTIONS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Est. cost (₹)</label>
            <input type="number" min={0} className="input" value={cost} placeholder="Optional" onChange={(e) => setCost(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Store / source</label>
          <input className="input" value={store} placeholder="Optional" onChange={(e) => setStore(e.target.value)} />
        </div>

        <label className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink">
          <input type="checkbox" checked={purchased} onChange={(e) => setPurchased(e.target.checked)} className="h-4 w-4 accent-sage-deep" />
          Already bought
        </label>

        {purchased && (
          <div>
            <label className="label">Actual cost (₹)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={actualCost}
              placeholder="What you actually paid"
              onChange={(e) => setActualCost(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-ink-faint">Feeds this event's actual spend and the overall totals.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

function findEventName(events: EventMeta[], id: string): string {
  return events.find((e) => e.id === id)?.name ?? 'Common Planning'
}
