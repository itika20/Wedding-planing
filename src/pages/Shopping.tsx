import { useEffect, useMemo, useState } from 'react'
import { Check, Pencil, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCollections } from '@/store/useCollections'
import { Modal } from '@/components/ui/Modal'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn, inr } from '@/lib/utils'
import type { ShoppingItem } from '@/lib/types'

const FOR_OPTIONS = ['Bride', 'Groom', 'Parents', 'Decor', 'Gifts', 'Accessories', 'Household', 'Other']

export function Shopping() {
  const items = useCollections((s) => s.shopping)
  const add = useCollections((s) => s.add)
  const update = useCollections((s) => s.update)
  const remove = useCollections((s) => s.remove)

  const [editing, setEditing] = useState<ShoppingItem | null>(null)
  const [open, setOpen] = useState(false)

  const totals = useMemo(() => {
    const bought = items.filter((i) => i.purchased)
    return {
      bought: bought.length,
      cost: items.reduce((s, i) => s + (i.cost || 0), 0),
      spent: bought.reduce((s, i) => s + (i.cost || 0), 0),
    }
  }, [items])

  const openNew = () => {
    setEditing(null)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Shopping</h1>
          <p className="text-ink-soft">Everything to buy — ticked off as you go.</p>
        </div>
        <button className="btn-gold" onClick={openNew}>
          <Plus size={16} /> Add item
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard index={0} icon={<ShoppingBag size={16} />} label="Items" value={items.length} accent="#D4AF37" />
        <StatCard index={1} icon={<Check size={16} />} label="Purchased" value={`${totals.bought}/${items.length}`} accent="#5F7A5F" />
        <StatCard index={2} icon={<ShoppingBag size={16} />} label="Est. cost" value={inr(totals.cost, { compact: true })} accent="#8CA98C" />
        <StatCard index={3} icon={<ShoppingBag size={16} />} label="Spent" value={inr(totals.spent, { compact: true })} accent="#E0A458" />
      </div>

      {items.length === 0 ? (
        <EmptyState
          emoji="🛍️"
          title="Nothing on the list yet"
          hint="Add outfits, decor, gifts and more — tick them off as you buy."
          action={<button className="btn-gold" onClick={openNew}><Plus size={16} /> Add item</button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="divide-y divide-line">
            {items.map((i) => (
              <div key={i.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-offwhite/40">
                <button
                  onClick={() => update('shopping', i.id, { purchased: !i.purchased })}
                  className={cn(
                    'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition',
                    i.purchased ? 'border-sage-deep bg-sage-deep text-white' : 'border-line hover:border-champagne',
                  )}
                  title={i.purchased ? 'Mark as not bought' : 'Mark as bought'}
                >
                  {i.purchased && <Check size={12} />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-sm font-medium', i.purchased ? 'text-ink-faint line-through' : 'text-ink')}>
                    {i.name}
                  </p>
                  <p className="truncate text-xs text-ink-faint">
                    {i.forWhom || 'General'}
                    {i.store ? ` · ${i.store}` : ''}
                    {i.notes ? ` · ${i.notes}` : ''}
                  </p>
                </div>
                {i.cost > 0 && <span className="text-sm font-semibold text-ink">{inr(i.cost)}</span>}
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => { setEditing(i); setOpen(true) }} className="rounded-md p-1.5 text-ink-faint hover:bg-ink/5 hover:text-ink">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove('shopping', i.id)} className="rounded-md p-1.5 text-ink-faint hover:bg-clay-soft/50 hover:text-clay">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ShoppingModal
        open={open}
        onClose={() => setOpen(false)}
        item={editing}
        onSave={(data) => {
          if (editing) update('shopping', editing.id, data)
          else add('shopping', data)
          setOpen(false)
        }}
      />
    </div>
  )
}

function ShoppingModal({
  open,
  onClose,
  item,
  onSave,
}: {
  open: boolean
  onClose: () => void
  item: ShoppingItem | null
  onSave: (data: Omit<ShoppingItem, 'id' | 'createdAt'>) => void
}) {
  const [name, setName] = useState('')
  const [forWhom, setForWhom] = useState('')
  const [cost, setCost] = useState('')
  const [store, setStore] = useState('')
  const [purchased, setPurchased] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setName(item?.name ?? '')
    setForWhom(item?.forWhom ?? '')
    setCost(item?.cost ? String(item.cost) : '')
    setStore(item?.store ?? '')
    setPurchased(item?.purchased ?? false)
    setNotes(item?.notes ?? '')
  }, [open, item])

  const canSave = name.trim().length > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? 'Edit item' : 'Add item'}
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-gold"
            disabled={!canSave}
            onClick={() => onSave({ name: name.trim(), forWhom, cost: Number(cost) || 0, store: store.trim(), purchased, notes: notes.trim() })}
          >
            {item ? 'Save' : 'Add item'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Item</label>
          <input className="input" autoFocus value={name} placeholder="e.g. Bridal sandals" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">For</label>
            <select className="input" value={forWhom} onChange={(e) => setForWhom(e.target.value)}>
              <option value="">General</option>
              {FOR_OPTIONS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Cost (₹)</label>
            <input type="number" className="input" value={cost} placeholder="Optional" onChange={(e) => setCost(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Store / source</label>
          <input className="input" value={store} placeholder="Optional" onChange={(e) => setStore(e.target.value)} />
        </div>
        <label className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink">
          <input type="checkbox" checked={purchased} onChange={(e) => setPurchased(e.target.checked)} className="h-4 w-4 accent-sage-deep" />
          Already purchased
        </label>
        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[60px] resize-none" value={notes} placeholder="Size, colour, priority…" onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
