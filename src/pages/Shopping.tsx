import { useEffect, useMemo, useState } from 'react'
import { Check, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { allEvents, findEvent } from '@/lib/events'
import { Modal } from '@/components/ui/Modal'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { cn, inr, nowISO } from '@/lib/utils'
import type { ChecklistItem, EventMeta } from '@/lib/types'

const FOR_OPTIONS = ['Bride', 'Parents', 'Decor', 'Gifts', 'Accessories', 'Household', 'Other']

// A shopping item is derived from a "shopping task". If the task has subtasks,
// each subtask is an item; otherwise the task itself is the item.
interface ShopRow {
  key: string
  kind: 'task' | 'subtask'
  taskId: string
  itemId?: string
  event: EventMeta
  name: string
  done: boolean
  budgeted: number
  actual: number
  forWhom?: string
  store?: string
  checkedBy?: string | null
  context?: string // "in <task>" for a subtask of a named (non-bucket) task
}

export function Shopping() {
  const tasks = useStore((s) => s.tasks)
  const users = useStore((s) => s.users)
  const eventList = useStore((s) => s.settings.events)
  const toggleSubtask = useStore((s) => s.toggleSubtask)
  const removeSubtask = useStore((s) => s.removeSubtask)
  const updateTask = useStore((s) => s.updateTask)

  const events = allEvents(eventList)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ShopRow | null>(null)

  const rows: ShopRow[] = useMemo(() => {
    const out: ShopRow[] = []
    for (const task of tasks) {
      if (!(task.shopping || task.shoppingList)) continue
      const event = findEvent(eventList, task.eventKey)
      const subs = task.checklist ?? []
      if (subs.length > 0) {
        for (const item of subs) {
          out.push({
            key: `s:${item.id}`,
            kind: 'subtask',
            taskId: task.id,
            itemId: item.id,
            event,
            name: item.text,
            done: item.done,
            budgeted: item.budgeted || 0,
            actual: item.actual || 0,
            forWhom: item.forWhom,
            store: item.store,
            checkedBy: item.checkedBy,
            context: task.shoppingList ? undefined : task.title,
          })
        }
      } else {
        out.push({
          key: `t:${task.id}`,
          kind: 'task',
          taskId: task.id,
          event,
          name: task.title,
          done: task.status === 'completed',
          budgeted: task.budgeted || 0,
          actual: task.actual || 0,
        })
      }
    }
    return out
  }, [tasks, eventList])

  const totals = useMemo(() => {
    const bought = rows.filter((r) => r.done)
    return {
      count: rows.length,
      bought: bought.length,
      est: rows.reduce((s, r) => s + r.budgeted, 0),
      spent: bought.reduce((s, r) => s + (r.actual || r.budgeted), 0),
    }
  }, [rows])

  const groups = useMemo(
    () => events.map((ev) => ({ event: ev, items: rows.filter((r) => r.event.id === ev.id) })).filter((g) => g.items.length > 0),
    [events, rows],
  )

  const toggleBought = (row: ShopRow) => {
    if (row.kind === 'subtask') toggleSubtask(row.taskId, row.itemId!)
    else updateTask(row.taskId, { status: row.done ? 'todo' : 'completed' })
  }

  const removeRow = (row: ShopRow) => {
    if (row.kind === 'subtask') removeSubtask(row.taskId, row.itemId!)
    else updateTask(row.taskId, { shopping: false }) // leave the shopping list, keep the task
  }

  const openNew = () => {
    setEditing(null)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Shopping</h1>
          <p className="text-ink-soft">Purchases from your shopping tasks — ticked off as you buy.</p>
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
          hint="Add an item here, or open a task and turn on “Shopping task” — its items (or the task itself, if it has no subtasks) show up here."
          action={<button className="btn-gold" onClick={openNew}><Plus size={16} /> Add item</button>}
        />
      ) : (
        <div className="space-y-5">
          {groups.map(({ event, items }) => {
            const bought = items.filter((r) => r.done).length
            return (
              <div key={event.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="flex items-center gap-2 border-b border-line bg-offwhite/50 px-4 py-2.5">
                  <span className="text-base">{event.emoji}</span>
                  <span className="text-sm font-semibold text-ink">{event.name}</span>
                  <span className="ml-auto text-xs text-ink-faint">{bought}/{items.length} bought</span>
                </div>
                <div className="divide-y divide-line">
                  {items.map((row) => {
                    const by = users.find((u) => u.id === row.checkedBy)
                    const meta = [row.forWhom, row.store, row.context ? `in ${row.context}` : null].filter(Boolean).join(' · ')
                    const est = row.budgeted
                    const paid = row.actual
                    return (
                      <div key={row.key} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-offwhite/40">
                        <button
                          onClick={() => toggleBought(row)}
                          className={cn(
                            'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition',
                            row.done ? 'border-sage-deep bg-sage-deep text-white' : 'border-line hover:border-champagne',
                          )}
                          title={row.done ? 'Mark as not bought' : 'Mark as bought'}
                        >
                          {row.done && <Check size={12} />}
                        </button>
                        <button onClick={() => { setEditing(row); setOpen(true) }} className="min-w-0 flex-1 text-left" title="Edit item">
                          <p className={cn('truncate text-sm font-medium', row.done ? 'text-ink-faint line-through' : 'text-ink')}>
                            {row.name}
                          </p>
                          {meta && <p className="truncate text-xs text-ink-faint">{meta}</p>}
                        </button>
                        {row.done && by && <Avatar user={by} size={20} ring />}
                        {(est > 0 || paid > 0) && (
                          <div className="text-right leading-tight">
                            {paid > 0 && <p className="text-sm font-semibold tabular-nums text-ink">{inr(paid)}</p>}
                            {est > 0 && <p className="text-xs tabular-nums text-ink-faint">{paid > 0 ? `est ${inr(est)}` : inr(est)}</p>}
                          </div>
                        )}
                        <button
                          onClick={() => removeRow(row)}
                          className="shrink-0 rounded-md p-1.5 text-ink-faint opacity-0 transition hover:bg-clay-soft/50 hover:text-clay group-hover:opacity-100"
                          title={row.kind === 'subtask' ? 'Remove' : 'Remove from shopping'}
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

      <ShoppingModal open={open} onClose={() => setOpen(false)} editing={editing} events={events} />
    </div>
  )
}

function ShoppingModal({
  open,
  onClose,
  editing,
  events,
}: {
  open: boolean
  onClose: () => void
  editing: ShopRow | null
  events: EventMeta[]
}) {
  const addShoppingItem = useStore((s) => s.addShoppingItem)
  const setSubtask = useStore((s) => s.setSubtask)
  const updateTask = useStore((s) => s.updateTask)
  const currentUserId = useStore((s) => s.currentUserId)
  const isEdit = Boolean(editing)
  const isSubtask = editing?.kind === 'subtask'

  const [name, setName] = useState('')
  const [eventKey, setEventKey] = useState('')
  const [forWhom, setForWhom] = useState('')
  const [cost, setCost] = useState('')
  const [actualCost, setActualCost] = useState('')
  const [store, setStore] = useState('')
  const [purchased, setPurchased] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name)
      setEventKey(editing.event.id)
      setForWhom(editing.forWhom ?? '')
      setCost(editing.budgeted ? String(editing.budgeted) : '')
      setActualCost(editing.actual ? String(editing.actual) : '')
      setStore(editing.store ?? '')
      setPurchased(editing.done)
    } else {
      setName('')
      setEventKey(events[1]?.id ?? events[0]?.id ?? 'common')
      setForWhom('')
      setCost('')
      setActualCost('')
      setStore('')
      setPurchased(false)
    }
  }, [open, editing, events])

  const canSave = name.trim().length > 0
  const num = (v: string) => (Number(v) > 0 ? Math.round(Number(v)) : 0)
  // Show For / Store only for the shopping-list-item shape (add + subtask edit).
  const showMeta = !isEdit || isSubtask

  const save = () => {
    if (!canSave) return
    if (!isEdit) {
      addShoppingItem({
        eventKey,
        text: name.trim(),
        cost: num(cost),
        actual: purchased ? num(actualCost) : 0,
        forWhom,
        store,
        purchased,
      })
      onClose()
      return
    }
    if (isSubtask && editing) {
      const patch: Partial<ChecklistItem> = {
        text: name.trim(),
        budgeted: num(cost) || undefined,
        actual: purchased ? num(actualCost) || undefined : undefined,
        forWhom: forWhom.trim() || undefined,
        store: store.trim() || undefined,
      }
      if (purchased !== editing.done) {
        patch.done = purchased
        patch.checkedBy = purchased ? currentUserId ?? null : null
        patch.checkedAt = purchased ? nowISO() : null
      }
      setSubtask(editing.taskId, editing.itemId!, patch)
    } else if (editing) {
      // The whole task is the item.
      const patch: any = { title: name.trim(), budgeted: num(cost), actual: purchased ? num(actualCost) : 0 }
      if (purchased && !editing.done) patch.status = 'completed'
      if (!purchased && editing.done) patch.status = 'todo'
      updateTask(editing.taskId, patch)
    }
    onClose()
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

        {!isEdit ? (
          <div>
            <label className="label">Event</label>
            <select className="input" value={eventKey} onChange={(e) => setEventKey(e.target.value)}>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.emoji} {ev.name}</option>)}
            </select>
          </div>
        ) : (
          <p className="rounded-xl border border-line bg-offwhite/40 px-3 py-2 text-xs text-ink-soft">
            In {editing?.event.emoji} {editing?.event.name}
            {editing?.context ? ` · ${editing.context}` : ''}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {showMeta && (
            <div>
              <label className="label">For</label>
              <select className="input" value={forWhom} onChange={(e) => setForWhom(e.target.value)}>
                <option value="">General</option>
                {FOR_OPTIONS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          )}
          <div className={showMeta ? '' : 'col-span-2'}>
            <label className="label">Est. cost (₹)</label>
            <input type="number" min={0} className="input" value={cost} placeholder="Optional" onChange={(e) => setCost(e.target.value)} />
          </div>
        </div>

        {showMeta && (
          <div>
            <label className="label">Store / source</label>
            <input className="input" value={store} placeholder="Optional" onChange={(e) => setStore(e.target.value)} />
          </div>
        )}

        <label className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink">
          <input type="checkbox" checked={purchased} onChange={(e) => setPurchased(e.target.checked)} className="h-4 w-4 accent-sage-deep" />
          Already bought
        </label>

        {purchased && (
          <div>
            <label className="label">Actual cost (₹)</label>
            <input type="number" min={0} className="input" value={actualCost} placeholder="What you actually paid" onChange={(e) => setActualCost(e.target.value)} />
            <p className="mt-1.5 text-xs text-ink-faint">Feeds this event's actual spend and the overall totals.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
