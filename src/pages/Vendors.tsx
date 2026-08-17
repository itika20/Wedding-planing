import { useEffect, useState } from 'react'
import { Pencil, Phone, Plus, Store, Trash2, Wallet } from 'lucide-react'
import { useCollections } from '@/store/useCollections'
import { useStore } from '@/store/useStore'
import { allEvents, findEvent } from '@/lib/events'
import { sumVendorExpenses } from '@/lib/expenses'
import { inr } from '@/lib/utils'
import type { EventMeta } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Vendor, VendorStatus } from '@/lib/types'

const STATUS: Record<VendorStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#6B6259', bg: '#F1EAE3' },
  booked: { label: 'Booked', color: '#B8912A', bg: '#F6E9CC' },
  completed: { label: 'Completed', color: '#5F7A5F', bg: '#DDE8DD' },
  cancelled: { label: 'Cancelled', color: '#9A9088', bg: '#EFE6DD' },
}
const CATEGORIES = ['Photographer', 'Caterer', 'Decorator', 'Makeup', 'Venue', 'Music/DJ', 'Priest', 'Transport', 'Other']

export function Vendors() {
  const vendors = useCollections((s) => s.vendors)
  const add = useCollections((s) => s.add)
  const update = useCollections((s) => s.update)
  const remove = useCollections((s) => s.remove)
  const events = allEvents(useStore((s) => s.settings.events))

  const [editing, setEditing] = useState<Vendor | null>(null)
  const [open, setOpen] = useState(false)

  const booked = vendors.filter((v) => v.status === 'booked' || v.status === 'completed').length
  const cost = sumVendorExpenses(vendors)

  const openNew = () => {
    setEditing(null)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Vendors</h1>
          <p className="text-ink-soft">Everyone you're hiring, and where they stand.</p>
        </div>
        <button className="btn-gold" onClick={openNew}>
          <Plus size={16} /> Add vendor
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} icon={<Store size={16} />} label="Vendors" value={vendors.length} accent="#D4AF37" />
        <StatCard index={1} icon={<Store size={16} />} label="Booked" value={booked} accent="#5F7A5F" />
        <StatCard index={2} icon={<Store size={16} />} label="Pending" value={vendors.length - booked} accent="#B8912A" />
        <StatCard index={3} icon={<Wallet size={16} />} label="Vendor cost" value={inr(cost.budgeted, { compact: true })} sub={`${inr(cost.actual, { compact: true })} paid`} accent="#8CA98C" />
      </div>

      {vendors.length === 0 ? (
        <EmptyState
          emoji="🏪"
          title="No vendors yet"
          hint="Add photographers, caterers, decorators and more — with contacts and booking status."
          action={<button className="btn-gold" onClick={openNew}><Plus size={16} /> Add vendor</button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="divide-y divide-line">
            {vendors.map((v) => (
              <div key={v.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-offwhite/40">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-champagne/10 text-champagne-deep">
                  <Store size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{v.name}</p>
                  <p className="truncate text-xs text-ink-faint">
                    {v.category || 'Vendor'}
                    {v.eventKey ? ` · ${findEvent(events, v.eventKey).name}` : ''}
                    {v.phone && (
                      <>
                        {' · '}
                        <a href={`tel:${v.phone}`} className="inline-flex items-center gap-0.5 text-champagne-deep">
                          <Phone size={10} /> {v.phone}
                        </a>
                      </>
                    )}
                  </p>
                  {v.notes && <p className="mt-0.5 truncate text-xs text-ink-soft">{v.notes}</p>}
                </div>
                {((v.budgeted ?? 0) > 0 || (v.actual ?? 0) > 0) && (
                  <div className="hidden text-right leading-tight sm:block">
                    {(v.actual ?? 0) > 0 && <p className="text-sm font-semibold tabular-nums text-ink">{inr(v.actual!)}</p>}
                    {(v.budgeted ?? 0) > 0 && (
                      <p className="text-xs tabular-nums text-ink-faint">{(v.actual ?? 0) > 0 ? `of ${inr(v.budgeted!)}` : inr(v.budgeted!)}</p>
                    )}
                  </div>
                )}
                <Badge color={STATUS[v.status].color} bg={STATUS[v.status].bg} dot>
                  {STATUS[v.status].label}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => { setEditing(v); setOpen(true) }} className="rounded-md p-1.5 text-ink-faint hover:bg-ink/5 hover:text-ink">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove('vendors', v.id)} className="rounded-md p-1.5 text-ink-faint hover:bg-clay-soft/50 hover:text-clay">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <VendorModal
        open={open}
        onClose={() => setOpen(false)}
        vendor={editing}
        events={events}
        onSave={(data) => {
          if (editing) update('vendors', editing.id, data)
          else add('vendors', data)
          setOpen(false)
        }}
      />
    </div>
  )
}

function VendorModal({
  open,
  onClose,
  vendor,
  events,
  onSave,
}: {
  open: boolean
  onClose: () => void
  vendor: Vendor | null
  events: EventMeta[]
  onSave: (data: Omit<Vendor, 'id' | 'createdAt'>) => void
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [phone, setPhone] = useState('')
  const [eventKey, setEventKey] = useState('')
  const [status, setStatus] = useState<VendorStatus>('pending')
  const [budgeted, setBudgeted] = useState('')
  const [actual, setActual] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setName(vendor?.name ?? '')
    setCategory(vendor?.category ?? '')
    setPhone(vendor?.phone ?? '')
    setEventKey(vendor?.eventKey ?? '')
    setStatus(vendor?.status ?? 'pending')
    setBudgeted(vendor?.budgeted ? String(vendor.budgeted) : '')
    setActual(vendor?.actual ? String(vendor.actual) : '')
    setNotes(vendor?.notes ?? '')
  }, [open, vendor])

  const money = (v: string) => Math.max(0, Math.round(Number(v) || 0))
  const canSave = name.trim().length > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vendor ? 'Edit vendor' : 'Add vendor'}
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-gold"
            disabled={!canSave}
            onClick={() =>
              onSave({
                name: name.trim(),
                category,
                phone: phone.trim(),
                eventKey,
                status,
                budgeted: money(budgeted),
                actual: money(actual),
                notes: notes.trim(),
              })
            }
          >
            {vendor ? 'Save' : 'Add vendor'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Business name</label>
          <input className="input" autoFocus value={name} placeholder="e.g. Candid Frames Studio" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={phone} placeholder="Optional" onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">For event</label>
            <select className="input" value={eventKey} onChange={(e) => setEventKey(e.target.value)}>
              <option value="">General</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.emoji} {ev.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as VendorStatus)}>
              {(Object.keys(STATUS) as VendorStatus[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Cost (₹)</label>
            <input type="number" min={0} className="input" value={budgeted} placeholder="Quoted / agreed" onChange={(e) => setBudgeted(e.target.value)} />
          </div>
          <div>
            <label className="label">Paid (₹)</label>
            <input type="number" min={0} className="input" value={actual} placeholder="Paid so far" onChange={(e) => setActual(e.target.value)} />
          </div>
        </div>
        <p className="-mt-1 text-xs text-ink-faint">Cost and paid amounts roll up into the Expenses page.</p>
        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[60px] resize-none" value={notes} placeholder="Quote, advance paid, contact person…" onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
