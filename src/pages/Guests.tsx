import { useEffect, useMemo, useState } from 'react'
import { Check, Pencil, Plus, Trash2, UserRound, Users, X } from 'lucide-react'
import { useCollections } from '@/store/useCollections'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Guest, GuestSide, Rsvp } from '@/lib/types'

const RSVP_META: Record<Rsvp, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#6B6259', bg: '#F1EAE3' },
  yes: { label: 'Coming', color: '#5F7A5F', bg: '#DDE8DD' },
  no: { label: "Can't", color: '#9A9088', bg: '#EFE6DD' },
}
const SIDE_LABEL: Record<GuestSide, string> = { bride: "Bride's side", groom: "Groom's side", both: 'Both / mutual' }
const SIDES: GuestSide[] = ['bride', 'groom', 'both']
const RSVPS: Rsvp[] = ['pending', 'yes', 'no']

export function Guests() {
  const guests = useCollections((s) => s.guests)
  const add = useCollections((s) => s.add)
  const update = useCollections((s) => s.update)
  const remove = useCollections((s) => s.remove)

  const [editing, setEditing] = useState<Guest | null>(null)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | GuestSide>('all')

  const totals = useMemo(() => {
    const heads = guests.reduce((s, g) => s + (g.count || 1), 0)
    const coming = guests.filter((g) => g.rsvp === 'yes').reduce((s, g) => s + (g.count || 1), 0)
    const pending = guests.filter((g) => g.rsvp === 'pending').length
    return { heads, coming, pending }
  }, [guests])

  const shown = filter === 'all' ? guests : guests.filter((g) => g.side === filter)

  const openNew = () => {
    setEditing(null)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Guests</h1>
          <p className="text-ink-soft">Your list, RSVPs and head-count.</p>
        </div>
        <button className="btn-gold" onClick={openNew}>
          <Plus size={16} /> Add guest
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard index={0} icon={<Users size={16} />} label="Invites" value={guests.length} accent="#D4AF37" />
        <StatCard index={1} icon={<Users size={16} />} label="Total heads" value={totals.heads} accent="#8CA98C" />
        <StatCard index={2} icon={<Check size={16} />} label="Coming" value={totals.coming} accent="#5F7A5F" />
        <StatCard index={3} icon={<UserRound size={16} />} label="Awaiting RSVP" value={totals.pending} accent="#E0A458" />
      </div>

      {guests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(['all', ...SIDES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`chip transition ${filter === s ? 'bg-champagne text-white' : 'bg-white text-ink-soft hover:bg-ivory'}`}
            >
              {s === 'all' ? 'All' : SIDE_LABEL[s]}
            </button>
          ))}
        </div>
      )}

      {guests.length === 0 ? (
        <EmptyState
          emoji="👥"
          title="No guests yet"
          hint="Build your list with RSVPs, sides and head-count."
          action={<button className="btn-gold" onClick={openNew}><Plus size={16} /> Add guest</button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="divide-y divide-line">
            {shown.map((g) => (
              <div key={g.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-offwhite/40">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne-deep">
                  <UserRound size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {g.name} {g.count > 1 && <span className="text-xs font-normal text-ink-faint">+{g.count - 1}</span>}
                  </p>
                  <p className="truncate text-xs text-ink-faint">
                    {SIDE_LABEL[g.side]}
                    {g.notes ? ` · ${g.notes}` : ''}
                  </p>
                </div>
                <div className="hidden gap-1 sm:flex">
                  {RSVPS.map((r) => (
                    <button
                      key={r}
                      onClick={() => update('guests', g.id, { rsvp: r })}
                      className="grid h-7 w-7 place-items-center rounded-lg border text-xs transition"
                      style={g.rsvp === r ? { background: RSVP_META[r].bg, color: RSVP_META[r].color, borderColor: RSVP_META[r].color } : { borderColor: '#EFE6DD', color: '#9A9088' }}
                      title={RSVP_META[r].label}
                    >
                      {r === 'yes' ? <Check size={13} /> : r === 'no' ? <X size={13} /> : '…'}
                    </button>
                  ))}
                </div>
                <Badge className="sm:hidden" color={RSVP_META[g.rsvp].color} bg={RSVP_META[g.rsvp].bg}>
                  {RSVP_META[g.rsvp].label}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => { setEditing(g); setOpen(true) }} className="rounded-md p-1.5 text-ink-faint hover:bg-ink/5 hover:text-ink">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove('guests', g.id)} className="rounded-md p-1.5 text-ink-faint hover:bg-clay-soft/50 hover:text-clay">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <GuestModal
        open={open}
        onClose={() => setOpen(false)}
        guest={editing}
        onSave={(data) => {
          if (editing) update('guests', editing.id, data)
          else add('guests', data)
          setOpen(false)
        }}
      />
    </div>
  )
}

function GuestModal({
  open,
  onClose,
  guest,
  onSave,
}: {
  open: boolean
  onClose: () => void
  guest: Guest | null
  onSave: (data: Omit<Guest, 'id' | 'createdAt'>) => void
}) {
  const [name, setName] = useState('')
  const [side, setSide] = useState<GuestSide>('bride')
  const [count, setCount] = useState('1')
  const [rsvp, setRsvp] = useState<Rsvp>('pending')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setName(guest?.name ?? '')
    setSide(guest?.side ?? 'bride')
    setCount(String(guest?.count ?? 1))
    setRsvp(guest?.rsvp ?? 'pending')
    setNotes(guest?.notes ?? '')
  }, [open, guest])

  const canSave = name.trim().length > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={guest ? 'Edit guest' : 'Add guest'}
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-gold"
            disabled={!canSave}
            onClick={() => onSave({ name: name.trim(), side, count: Math.max(1, Number(count) || 1), rsvp, notes: notes.trim() })}
          >
            {guest ? 'Save' : 'Add guest'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Name (family / person)</label>
          <input className="input" autoFocus value={name} placeholder="e.g. Sharma family" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Side</label>
            <select className="input" value={side} onChange={(e) => setSide(e.target.value as GuestSide)}>
              {SIDES.map((s) => <option key={s} value={s}>{SIDE_LABEL[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Head-count</label>
            <input type="number" min={1} className="input" value={count} onChange={(e) => setCount(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">RSVP</label>
          <div className="flex gap-1.5">
            {RSVPS.map((r) => (
              <button
                key={r}
                onClick={() => setRsvp(r)}
                className="flex-1 rounded-lg border px-2 py-2 text-xs font-semibold transition"
                style={rsvp === r ? { background: RSVP_META[r].bg, color: RSVP_META[r].color, borderColor: RSVP_META[r].color } : { borderColor: '#EFE6DD', color: '#9A9088' }}
              >
                {RSVP_META[r].label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[60px] resize-none" value={notes} placeholder="Food preference, accommodation, gift…" onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
