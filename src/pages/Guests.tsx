import { useEffect, useMemo, useState } from 'react'
import { BedDouble, Check, Pencil, Plus, Trash2, UserRound, Users, X } from 'lucide-react'
import { useCollections } from '@/store/useCollections'
import { useStore } from '@/store/useStore'
import { findEvent } from '@/lib/events'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { EventMeta, Guest, GuestEventCount, Rsvp } from '@/lib/types'

type OverrideRow = { invited: string; expected: string; coming: string }
const blankRow = (): OverrideRow => ({ invited: '', expected: '', coming: '' })

const RSVP_META: Record<Rsvp, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#6B6259', bg: '#F1EAE3' },
  yes: { label: 'Coming', color: '#5F7A5F', bg: '#DDE8DD' },
  no: { label: "Can't", color: '#9A9088', bg: '#EFE6DD' },
}
const RSVPS: Rsvp[] = ['pending', 'yes', 'no']

// Guest categories, in the order the list is grouped by. Anything without a
// (known) category falls into a trailing "Other" bucket.
const GUEST_CATEGORIES: { id: string; label: string }[] = [
  { id: 'moms_side', label: "Mom's side" },
  { id: 'dads_side', label: "Dad's side" },
  { id: 'tpclps', label: 'TPCLPS' },
  { id: 'friends', label: 'Friends' },
  { id: 'colleagues', label: 'Colleagues' },
  { id: 'neighbors', label: 'Neighbors' },
]
const OTHER_CATEGORY = '__other'
const categoryLabel = (id?: string) => GUEST_CATEGORIES.find((c) => c.id === id)?.label ?? 'Other'

// Overall (whole-wedding) head math, with sensible fallbacks for guests saved
// before expected/coming existed: everyone invited is expected, and a "yes"
// RSVP means the whole party is coming until the actual count is edited.
const overallInvited = (g: Guest) => g.count || 1
const overallExpected = (g: Guest) => g.expected ?? overallInvited(g)
const overallComing = (g: Guest) => g.coming ?? (g.rsvp === 'yes' ? overallInvited(g) : 0)

// Head math for a given view: a specific function (using its per-event override
// when set) or the family's overall figure when viewing all guests.
const invitedFor = (g: Guest, ev?: string) =>
  ev && g.perEvent?.[ev]?.invited != null ? g.perEvent[ev]!.invited! : overallInvited(g)
const expectedFor = (g: Guest, ev?: string) =>
  ev && g.perEvent?.[ev]?.expected != null ? g.perEvent[ev]!.expected! : overallExpected(g)
const comingFor = (g: Guest, ev?: string) =>
  ev && g.perEvent?.[ev]?.coming != null ? g.perEvent[ev]!.coming! : overallComing(g)

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
  const scoped = filter !== 'all'
  const activeEv = scoped ? filter : undefined

  const totals = useMemo(() => {
    const invited = shown.reduce((s, g) => s + invitedFor(g, activeEv), 0)
    const expected = shown.reduce((s, g) => s + expectedFor(g, activeEv), 0)
    const coming = shown.reduce((s, g) => s + comingFor(g, activeEv), 0)
    const rooms = shown.reduce((s, g) => s + (g.rooms || 0), 0)
    return { families: shown.length, invited, expected, coming, rooms }
  }, [shown, activeEv])

  // Group the shown guests by category, in the fixed GUEST_CATEGORIES order,
  // with an "Other" bucket last. Only non-empty groups are kept.
  const groups = useMemo(() => {
    const buckets = new Map<string, Guest[]>()
    for (const g of shown) {
      const key = GUEST_CATEGORIES.some((c) => c.id === g.category) ? g.category! : OTHER_CATEGORY
      const list = buckets.get(key) ?? []
      list.push(g)
      buckets.set(key, list)
    }
    return [...GUEST_CATEGORIES.map((c) => c.id), OTHER_CATEGORY]
      .filter((id) => buckets.has(id))
      .map((id) => ({ id, label: id === OTHER_CATEGORY ? 'Other' : categoryLabel(id), items: buckets.get(id)! }))
  }, [shown])

  const openNew = () => {
    setEditing(null)
    setOpen(true)
  }

  const renderRow = (g: Guest) => {
    const evs = (g.events ?? []).map((id) => findEvent(eventList, id))
    const inv = invitedFor(g, activeEv)
    const exp = expectedFor(g, activeEv)
    const com = comingFor(g, activeEv)
    const hasOverrides = Object.keys(g.perEvent ?? {}).length > 0
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
            <span
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium"
              style={{ background: '#DDE8DD', color: '#5F7A5F' }}
              title={`${inv} invited · ${exp} expected · ${com} coming${!scoped && hasOverrides ? ' — varies by function' : ''}`}
            >
              <Users size={11} /> {com}/{inv} coming{!scoped && hasOverrides ? '*' : ''}
            </span>
            {g.rooms > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose/10 px-1.5 py-0.5 text-[11px] font-medium text-clay" title={`${g.rooms} hotel room${g.rooms === 1 ? '' : 's'}`}>
                <BedDouble size={11} /> {g.rooms}
              </span>
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard index={0} icon={<Users size={16} />} label="Families" value={totals.families} accent="#D4AF37" />
        <StatCard index={1} icon={<Users size={16} />} label="Guests invited" value={totals.invited} accent="#8CA98C" />
        <StatCard index={2} icon={<UserRound size={16} />} label="Expected" value={totals.expected} accent="#E0A458" />
        <StatCard index={3} icon={<Check size={16} />} label="Coming" value={totals.coming} accent="#5F7A5F" />
        <StatCard index={4} icon={<BedDouble size={16} />} label="Rooms needed" value={totals.rooms} accent="#B87883" />
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
        <div className="space-y-5">
          {groups.map((grp) => (
            <div key={grp.id} className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="flex items-center gap-2 border-b border-line bg-offwhite/50 px-4 py-2.5">
                <span className="text-sm font-semibold text-ink">{grp.label}</span>
                <span className="ml-auto text-xs text-ink-faint">
                  {grp.items.length} famil{grp.items.length === 1 ? 'y' : 'ies'}
                </span>
              </div>
              <div className="divide-y divide-line">{grp.items.map(renderRow)}</div>
            </div>
          ))}
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
  const [category, setCategory] = useState('')
  const [invited, setInvited] = useState<string[]>([])
  const [count, setCount] = useState('1')
  const [expected, setExpected] = useState('1')
  const [coming, setComing] = useState('0')
  const [rooms, setRooms] = useState('0')
  const [rsvp, setRsvp] = useState<Rsvp>('pending')
  const [notes, setNotes] = useState('')
  const [perEvent, setPerEvent] = useState<Record<string, OverrideRow>>({})
  const [showOverrides, setShowOverrides] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(guest?.name ?? '')
    setCategory(guest?.category ?? '')
    setInvited(guest?.events ?? (defaultEvent ? [defaultEvent] : []))
    setCount(String(guest?.count ?? 1))
    setExpected(String(guest?.expected ?? guest?.count ?? 1))
    setComing(String(guest?.coming ?? (guest?.rsvp === 'yes' ? guest?.count ?? 1 : 0)))
    setRooms(String(guest?.rooms ?? 0))
    setRsvp(guest?.rsvp ?? 'pending')
    setNotes(guest?.notes ?? '')
    const pe: Record<string, OverrideRow> = {}
    for (const [id, v] of Object.entries(guest?.perEvent ?? {})) {
      pe[id] = {
        invited: v.invited != null ? String(v.invited) : '',
        expected: v.expected != null ? String(v.expected) : '',
        coming: v.coming != null ? String(v.coming) : '',
      }
    }
    setPerEvent(pe)
    setShowOverrides(Object.keys(pe).length > 0)
  }, [open, guest, defaultEvent])

  const toggleEvent = (id: string) =>
    setInvited((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  const setPE = (id: string, field: keyof OverrideRow, val: string) =>
    setPerEvent((cur) => ({ ...cur, [id]: { ...blankRow(), ...cur[id], [field]: val } }))

  const canSave = name.trim().length > 0

  const handleSave = () => {
    // Only multi-function guests carry per-event overrides; a single function
    // is fully described by the overall numbers.
    const pe: Record<string, GuestEventCount> = {}
    if (invited.length >= 2) {
      for (const id of invited) {
        const row = perEvent[id]
        if (!row) continue
        const o: GuestEventCount = {}
        if (row.invited.trim() !== '') o.invited = Math.max(0, Number(row.invited) || 0)
        if (row.expected.trim() !== '') o.expected = Math.max(0, Number(row.expected) || 0)
        if (row.coming.trim() !== '') o.coming = Math.max(0, Number(row.coming) || 0)
        if (Object.keys(o).length) pe[id] = o
      }
    }
    onSave({
      name: name.trim(),
      events: invited,
      count: Math.max(1, Number(count) || 1),
      expected: Math.max(0, Number(expected) || 0),
      coming: Math.max(0, Number(coming) || 0),
      perEvent: Object.keys(pe).length ? pe : undefined,
      category: category || undefined,
      rooms: Math.max(0, Number(rooms) || 0),
      rsvp,
      notes: notes.trim(),
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={guest ? 'Edit guest' : 'Add guest'}
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-gold" disabled={!canSave} onClick={handleSave}>
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
          <label className="label">Side / group</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Uncategorized</option>
            {GUEST_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
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

        <div>
          <label className="label">Head-count</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">Invited</span>
              <input type="number" min={1} className="input" value={count} onChange={(e) => setCount(e.target.value)} />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">Expected</span>
              <input type="number" min={0} className="input" value={expected} onChange={(e) => setExpected(e.target.value)} />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">Coming</span>
              <input type="number" min={0} className="input" value={coming} onChange={(e) => setComing(e.target.value)} />
            </div>
          </div>
          <p className="mt-1.5 text-xs text-ink-faint">
            Invited is the party size. Expected is how many you think will attend; Coming is the final confirmed count.
            {invited.length >= 2 && ' These apply across every function unless you set different numbers below.'}
          </p>
        </div>

        {invited.length >= 2 && (
          <div>
            <button
              type="button"
              onClick={() => setShowOverrides((v) => !v)}
              className="text-xs font-semibold text-champagne-deep hover:underline"
            >
              {showOverrides ? '– Hide per-function numbers' : '+ Different numbers for a function?'}
            </button>

            {showOverrides && (
              <div className="mt-2 space-y-2 rounded-xl border border-line bg-offwhite/40 p-3">
                <p className="text-[11px] text-ink-faint">
                  Leave a box blank to use the overall number above — only fill where a function differs.
                </p>
                <div className="grid grid-cols-[minmax(0,1fr)_2.4fr] items-center gap-2">
                  <span />
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-medium uppercase tracking-wide text-ink-faint">
                    <span>Invited</span>
                    <span>Expected</span>
                    <span>Coming</span>
                  </div>
                </div>
                {invited.map((id) => {
                  const ev = events.find((e) => e.id === id)
                  if (!ev) return null
                  const row = perEvent[id] ?? blankRow()
                  return (
                    <div key={id} className="grid grid-cols-[minmax(0,1fr)_2.4fr] items-center gap-2">
                      <span className="truncate text-xs text-ink-soft" title={ev.name}>
                        {ev.emoji} {ev.name}
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <input type="number" min={0} className="input !py-1.5 text-sm" placeholder={count || '0'} value={row.invited} onChange={(e) => setPE(id, 'invited', e.target.value)} />
                        <input type="number" min={0} className="input !py-1.5 text-sm" placeholder={expected || '0'} value={row.expected} onChange={(e) => setPE(id, 'expected', e.target.value)} />
                        <input type="number" min={0} className="input !py-1.5 text-sm" placeholder={coming || '0'} value={row.coming} onChange={(e) => setPE(id, 'coming', e.target.value)} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="label">Hotel rooms</label>
          <input type="number" min={0} className="input" value={rooms} placeholder="0" onChange={(e) => setRooms(e.target.value)} />
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

        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[60px] resize-none" value={notes} placeholder="Food preference, accommodation, gift…" onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
