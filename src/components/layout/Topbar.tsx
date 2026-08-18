import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cloud, HardDrive, Menu, Plus, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, useCurrentUser } from '@/store/useStore'
import { useUI } from './UIProvider'
import { Avatar } from '@/components/ui/Avatar'
import { findEvent } from '@/lib/events'

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
  const events = useStore((s) => s.settings.events)
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const signOut = useStore((s) => s.signOut)
  const authed = useStore((s) => s.authed)
  const { openTask } = useUI()

  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Match task titles AND subtask text. A subtask hit points at its parent task
  // (opening the task lets you see/tick that subtask).
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    const out: { key: string; kind: 'task' | 'subtask'; task: (typeof tasks)[number]; label: string; done?: boolean }[] = []
    for (const t of tasks) {
      if (t.title.toLowerCase().includes(q)) out.push({ key: `t:${t.id}`, kind: 'task', task: t, label: t.title })
      for (const c of t.checklist ?? []) {
        if (c.text.toLowerCase().includes(q)) out.push({ key: `s:${c.id}`, kind: 'subtask', task: t, label: c.text, done: c.done })
      }
      if (out.length >= 8) break
    }
    return out.slice(0, 8)
  }, [query, tasks])

  const hasResults = results.length > 0

  const openResult = (task: (typeof tasks)[number]) => {
    openTask({ task })
    setQuery('')
    searchRef.current?.blur()
  }

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
              placeholder="Search tasks…"
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
                {hasResults && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Tasks &amp; items</p>
                    {results.map((r) => (
                      <button
                        key={r.key}
                        onMouseDown={() => openResult(r.task)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-ivory"
                      >
                        <span>{findEvent(events, r.task.eventKey).emoji}</span>
                        <span className={`flex-1 truncate ${r.done ? 'text-ink-faint line-through' : 'text-ink'}`}>
                          {r.label}
                          {r.kind === 'subtask' && <span className="text-ink-faint"> · in {r.task.title}</span>}
                        </span>
                        <span className="text-xs text-ink-faint">{findEvent(events, r.task.eventKey).name}</span>
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
        <button className="btn-gold px-3 py-2.5" onClick={() => openTask()}>
          <Plus size={16} />
          <span className="hidden sm:inline">Add task</span>
        </button>

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
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-ivory"
                  onMouseDown={() => {
                    setCurrentUser(null)
                    navigate('/')
                  }}
                >
                  Switch profile
                </button>
                {authed && (
                  <button
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-clay hover:bg-clay-soft/40"
                    onMouseDown={() => {
                      void signOut()
                      navigate('/')
                    }}
                  >
                    Sign out
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
