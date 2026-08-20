import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  FileText,
  Gauge,
  GripVertical,
  Home as HomeIcon,
  ReceiptIndianRupee,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { eventStats } from '@/lib/selectors'
import { cn } from '@/lib/utils'

const primary = [
  { to: '/app/home', label: 'Home', icon: HomeIcon },
]

const secondary = [
  { to: '/app/expenses', label: 'Expenses', icon: ReceiptIndianRupee },
  { to: '/app/vendors', label: 'Vendors', icon: Store },
  { to: '/app/guests', label: 'Guests', icon: Users },
  { to: '/app/shopping', label: 'Shopping', icon: ShoppingBag },
  { to: '/app/documents', label: 'Documents', icon: FileText },
]

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const tasks = useStore((s) => s.tasks)
  const eventList = useStore((s) => s.settings.events)
  const reorderEvents = useStore((s) => s.reorderEvents)

  // Drag-to-reorder the event nav items. dragId = item being dragged,
  // overId = the item currently hovered as the drop target.
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const reorder = (targetId: string) => {
    if (dragId && dragId !== targetId) {
      const arr = [...eventList]
      const from = arr.findIndex((x) => x.id === dragId)
      const to = arr.findIndex((x) => x.id === targetId)
      if (from >= 0 && to >= 0) {
        const [moved] = arr.splice(from, 1)
        arr.splice(to, 0, moved)
        reorderEvents(arr)
      }
    }
    setDragId(null)
    setOverId(null)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-champagne/15 text-xl">💍</div>
        <div>
          <p className="font-display text-lg font-semibold leading-none text-ink">Wedding 101</p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-faint">Wedding Planner</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 no-scrollbar">
        <div className="space-y-1">
          {primary.map((item) => (
            <NavItem key={item.to} {...item} onNavigate={onNavigate} />
          ))}
        </div>

        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Events</p>
          <div className="space-y-1">
            {eventList.length === 0 && (
              <p className="px-3 py-2 text-xs text-ink-faint">No events yet — add some in Settings.</p>
            )}
            {eventList.map((e) => {
              const st = eventStats(e.id, tasks)
              return (
                <div
                  key={e.id}
                  draggable
                  onDragStart={(ev) => {
                    setDragId(e.id)
                    ev.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={() => {
                    setDragId(null)
                    setOverId(null)
                  }}
                  onDragOver={(ev) => {
                    ev.preventDefault()
                    if (dragId && dragId !== e.id && overId !== e.id) setOverId(e.id)
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault()
                    reorder(e.id)
                  }}
                  className={cn(
                    'rounded-xl transition',
                    dragId === e.id && 'opacity-40',
                    overId === e.id && dragId && dragId !== e.id && 'ring-2 ring-champagne/50',
                  )}
                >
                  <NavLink
                    to={`/app/event/${e.id}`}
                    onClick={onNavigate}
                    draggable={false}
                    title="Drag to reorder"
                    className={({ isActive }) => cn('nav-link group cursor-grab active:cursor-grabbing', isActive && 'nav-link-active')}
                  >
                    <GripVertical size={13} className="-ml-1 shrink-0 text-ink-faint/40 transition group-hover:text-ink-faint" />
                    <span className="text-base">{e.emoji}</span>
                    <span className="flex-1">{e.name}</span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                      style={{ background: `${e.accent}1f`, color: e.accent }}
                    >
                      {st.taskProgress}%
                    </span>
                  </NavLink>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Manage</p>
          <div className="space-y-1">
            {secondary.map((item) => (
              <NavItem key={item.to} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </nav>

      <NavLink
        to="/app/settings"
        onClick={onNavigate}
        className={({ isActive }) => cn('nav-link mx-3 mb-4', isActive && 'nav-link-active')}
      >
        <Gauge size={18} />
        <span>Settings</span>
      </NavLink>
    </div>
  )
}

function NavItem({
  to,
  label,
  icon: Icon,
  onNavigate,
}: {
  to: string
  label: string
  icon: typeof HomeIcon
  onNavigate?: () => void
}) {
  return (
    <NavLink to={to} onClick={onNavigate} className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}>
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  )
}
