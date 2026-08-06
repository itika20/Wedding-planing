import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cloud, HardDrive, Menu, Plus, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, useCurrentUser } from '@/store/useStore'
import { useUI } from './UIProvider'
import { Avatar } from '@/components/ui/Avatar'
import { findEvent } from '@/lib/events'
import { inr } from '@/lib/utils'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const mode = useStore((s) => s.mode)
  const tasks = useStore((s) => s.tasks)
  const expenses = useStore((s) => s.expenses)
  const events = useStore((s) => s.settings.events)
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const { openTask, openExpense } = useUI()

  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return { tasks: [], expenses: [] }
    return {
      tasks: tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 5),
      expenses: expenses.filter((e) => e.name.toLowerCase().includes(q) || e.vendor.toLowerCase().includes(q)).slice(0, 4),
    }
  }, [query, tasks, expenses])

  const hasResults = results.tasks.length > 0 || results.expenses.length > 0

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ivory/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button onClick={onMenu} className="btn-ghost p-2 lg:hidden">
          <Menu size={20} />
        </button>

        <div className="hidden sm:block">
          <p className="text-xs text-ink-faint">{greeting()},</p>
          <p className="-mt-0.5 font-display text-base font-semibold text-ink">{user?.name ?? 'there'} 👋</p>
        </div>

        {/* Search */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, vendors, expenses…"
              className="input pl-9 pr-8"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {query.trim().length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
              >
                {!hasResults && <div className="px-4 py-6 text-center text-sm text-ink-soft">No matches found</div>}
                {results.tasks.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Tasks</p>
                    {results.tasks.map((t) => (
                      <button
                        key={t.id}
                        onMouseDown={() => {
                          navigate(`/app/event/${t.eventKey}`)
                          setQuery('')
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-ivory"
                      >
                        <span>{findEvent(events, t.eventKey).emoji}</span>
                        <span className="flex-1 truncate text-ink">{t.title}</span>
                        <span className="text-xs text-ink-faint">{findEvent(events, t.eventKey).name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {results.expenses.length > 0 && (
                  <div className="border-t border-line p-2">
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Expenses</p>
                    {results.expenses.map((e) => (
                      <button
                        key={e.id}
                        onMouseDown={() => {
                          navigate(`/app/event/${e.eventKey}`)
                          setQuery('')
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-ivory"
                      >
                        <span className="flex-1 truncate text-ink">{e.name}</span>
                        <span className="text-xs font-medium text-ink-soft">{inr(e.amount, { compact: true })}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sync badge */}
        <div
          className="hidden items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink-soft md:flex"
          title={mode === 'cloud' ? 'Synced with the cloud' : 'Saved on this device only'}
        >
          {mode === 'cloud' ? <Cloud size={13} className="text-sage-deep" /> : <HardDrive size={13} className="text-ink-faint" />}
          {mode === 'cloud' ? 'Synced' : 'Local'}
        </div>

        {/* Quick add */}
        <div className="relative">
          <button className="btn-gold px-3 py-2.5" onClick={() => setAddOpen((v) => !v)} onBlur={() => setTimeout(() => setAddOpen(false), 150)}>
            <Plus size={16} />
            <span className="hidden sm:inline">Quick add</span>
          </button>
          <AnimatePresence>
            {addOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 top-12 z-40 w-44 overflow-hidden rounded-xl border border-line bg-white p-1 shadow-lift"
              >
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-ivory"
                  onMouseDown={() => openTask()}
                >
                  ✅ New task
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-ivory"
                  onMouseDown={() => openExpense()}
                >
                  💰 New expense
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} onBlur={() => setTimeout(() => setMenuOpen(false), 150)}>
            <Avatar user={user} size={38} ring />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 top-12 z-40 w-48 overflow-hidden rounded-xl border border-line bg-white p-1 shadow-lift"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-ink">{user?.name}</p>
                  <p className="text-xs text-ink-faint">{user?.role}</p>
                </div>
                <div className="my-1 h-px bg-line" />
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-ivory"
                  onMouseDown={() => navigate('/app/settings')}
                >
                  Settings
                </button>
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-clay hover:bg-clay-soft/40"
                  onMouseDown={() => {
                    setCurrentUser(null)
                    navigate('/')
                  }}
                >
                  Switch profile
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
