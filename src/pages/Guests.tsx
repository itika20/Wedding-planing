import { useEffect, useMemo, useState } from 'react'
import { Check, Pencil, Plus, Trash2, UserRound, Users, X } from 'lucide-react'
import { useCollections } from '@/store/useCollections'
import { useStore } from '@/store/useStore'
import { findEvent } from '@/lib/events'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { EventMeta, Guest, Rsvp } from '@/lib/types'

const RSVP_META: Record<Rsvp, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#6B6259', bg: '#F1EAE3' },
  yes: { label: 'Coming', color: '#5F7A5F', bg: '#DDE8DD' },
  no: { label: "Can't", color: '#9A9088', bg: '#EFE6DD' },
}
const RSVPS: Rsvp[] = ['pending', 'yes', 'no']

export function Guests() {
  const guests = useCollections((s) => s.guests)
  const add = useCollections((s) => s.add)
  const update = useCollections((s) => s.update)
  const remove = useCollections((s) => s.remove)
  const eventList = useStore((s) => s.settings.events)

  const [editing, setEditing] = useState<Guest | null>(null)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | string>('all') // 'all' or an event id

  const shown = filter === 'all' ? guests : guests.filter((g) => (g.events ?? []).includes(filter))

  const totals = useMemo(() => {
    const heads = shown.reduce((s, g) => s + (g.count || 1), 0)
    const coming = shown.filter((g) => g.rsvp === 'yes').reduce((s, g) => s + (g.count || 1), 0)
    const pending = shown.filter((g) => g.rsvp === 'pending').length
    return { invites: shown.length, heads, coming, pending }
  }, [shown])

  const scoped = filter !== 'all'

  const openNew = () => {
    setEditing(null)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Guests</h1>
          <p className="text-ink-soft">Your list and RSVPs, organised by function.</p>
        </div>
        <button className="btn-gold" onClick={openNew}>
          <Plus size={16} /> Add guest
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard index={0} icon={<Users size={16} />} label={scoped ? 'Invited' : 'Invites'} value={totals.invites} accent="#D4AF37" />
        <StatCard index={1} icon={<Users size={16} />} label="Total heads" value={totals.heads} accent="#8CA98C" />
        <StatCard index={2} icon={<Check size={16} />} label="Coming" value={totals.coming} accent="#5F7A5F" />
        <StatCard index={3} icon={<UserRound size={16} />} label="Awaiting RSVP" value={totals.pending} accent="#E0A458" />
      </div>

      {guests.length > 0 && eventList.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`chip transition ${filter === 'all' ? 'bg-champagne text-white' : 'bg-white text-ink-soft hover:bg-ivory'}`}
          >
            All guests
          </button>
          {eventList.map((e) => (
            <button
              key={e.id}
              onClick={() => setFilter(e.id)}
              className={`chip transition ${filter === e.id ? 'bg-champagne text-white' : 'bg-white text-ink-soft hover:bg-ivory'}`}
            >
              {e.emoji} {e.name}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState
          emoji="👥"
          title={scoped ? 'No guests for this function yet' : 'No guests yet'}
          hint={scoped ? 'Add a guest and tick this function, or edit an existing guest to include it.' : 'Build your list with head-count and which functions each guest is invited to.'}
          action={<button className="btn-gold" onClick={openNew}><Plus size={16} /> Add guest</button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="divide-y divide-line">
            {shown.map((g) => {
              const evs = (g.events ?? []).map((id) => findEvent(eventList, id))
              return (
                <div key={g.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-offwhite/40">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne-deep">
                    <UserRound size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {g.name} {g.count > 1 && <span className="text-xs font-normal text-ink-faint">+{g.count - 1}</span>}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      {evs.length > 0 ? (
                        evs.map((e) => (
                          <span key={e.id} className="inline-flex items-center gap-1 rounded-full bg-ivory px-1.5 py-0.5 text-[11px] text-ink-soft" title={e.name}>
                            <span>{e.emoji}</span>
                            <span className="hidden sm:inline">{e.name}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-ink-faint">No function set</span>
                      )}
                      {g.notes && <span className="truncate text-xs text-ink-faint">· {g.notes}</span>}
                    </div>
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
              )
            })}
          </div>
        </div>
      )}

      <GuestModal
        open={open}
        onClose={() => setOpen(false)}
        guest={editing}
        events={eventList}
        defaultEvent={scoped ? filter : undefined}
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
  events,
  defaultEvent,
  onSave,
}: {
  open: boolean
  onClose: () => void
  guest: Guest | null
  events: EventMeta[]
  defaultEvent?: string
  onSave: (data: Omit<Guest, 'id' | 'createdAt'>) => void
}) {
  const [name, setName] = useState('')
  const [invited, setInvited] = useState<string[]>([])
  const [count, setCount] = useState('1')
  const [rsvp, setRsvp] = useState<Rsvp>('pending')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setName(guest?.name ?? '')
    setInvited(guest?.events ?? (defaultEvent ? [defaultEvent] : []))
    setCount(String(guest?.count ?? 1))
    setRsvp(guest?.rsvp ?? 'pending')
    setNotes(guest?.notes ?? '')
  }, [open, guest, defaultEvent])

  const toggleEvent = (id: string) =>
    setInvited((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

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
            onClick={() => onSave({ name: name.trim(), events: invited, count: Math.max(1, Number(count) || 1), rsvp, notes: notes.trim() })}
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

        <div>
          <label className="label">Invited to</label>
          {events.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line bg-offwhite/40 px-3 py-2.5 text-xs text-ink-soft">
              No functions yet — add your events in Settings → Events &amp; dates.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {events.map((e) => {
                const on = invited.includes(e.id)
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleEvent(e.id)}
                    className={`chip transition ${on ? 'bg-champagne text-white' : 'bg-white text-ink-soft hover:bg-ivory'}`}
                  >
                    {e.emoji} {e.name}
                  </button>
                )
              })}
            </div>
          )}
          <p className="mt-1.5 text-xs text-ink-faint">Pick every function this guest is invited to.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Head-count</label>
            <input type="number" min={1} className="input" value={count} onChange={(e) => setCount(e.target.value)} />
          </div>
          <div>
            <label className="label">RSVP</label>
            <div className="flex gap-1.5">
              {RSVPS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRsvp(r)}
                  className="flex-1 rounded-lg border px-2 py-2 text-xs font-semibold transition"
                  style={rsvp === r ? { background: RSVP_META[r].bg, color: RSVP_META[r].color, borderColor: RSVP_META[r].color } : { borderColor: '#EFE6DD', color: '#9A9088' }}
                >
                  {RSVP_META[r].label}
                </button>
              ))}
            </div>
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
