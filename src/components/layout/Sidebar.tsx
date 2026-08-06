import { NavLink } from 'react-router-dom'
import {
  Calendar,
  FileText,
  Gauge,
  Gem,
  Home as HomeIcon,
  ReceiptIndianRupee,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { eventStats } from '@/lib/selectors'
import { cn } from '@/lib/utils'

const primary = [
  { to: '/app/home', label: 'Home', icon: HomeIcon },
  { to: '/app/event/common', label: 'Common Planning', icon: Gem },
]

const secondary = [
  { to: '/app/expenses', label: 'Expenses', icon: ReceiptIndianRupee },
  { to: '/app/activity', label: 'Activity', icon: Sparkles },
  { to: '/app/calendar', label: 'Calendar', icon: Calendar },
  { to: '/app/vendors', label: 'Vendors', icon: Store },
  { to: '/app/guests', label: 'Guests', icon: Users },
  { to: '/app/shopping', label: 'Shopping', icon: ShoppingBag },
  { to: '/app/documents', label: 'Documents', icon: FileText },
]

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const tasks = useStore((s) => s.tasks)
  const expenses = useStore((s) => s.expenses)
  const eventList = useStore((s) => s.settings.events)

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
              const st = eventStats(e.id, tasks, expenses)
              return (
                <NavLink
                  key={e.id}
                  to={`/app/event/${e.id}`}
                  onClick={onNavigate}
                  className={({ isActive }) => cn('nav-link group', isActive && 'nav-link-active')}
                >
                  <span className="text-base">{e.emoji}</span>
                  <span className="flex-1">{e.name}</span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                    style={{ background: `${e.accent}1f`, color: e.accent }}
                  >
                    {st.taskProgress}%
                  </span>
                </NavLink>
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
