import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, LayoutGrid, ReceiptIndianRupee, StickyNote, Wallet } from 'lucide-react'
import { findEvent } from '@/lib/events'
import type { EventKey } from '@/lib/types'
import { useStore } from '@/store/useStore'
import { useUI } from '@/components/layout/UIProvider'
import { eventStats } from '@/lib/selectors'
import { varianceView } from '@/lib/expenses'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskExpenseList } from '@/components/expenses/TaskExpenseList'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Confetti } from '@/components/ui/Confetti'
import { Avatar } from '@/components/ui/Avatar'
import { cn, daysUntil, fmtDate, inr } from '@/lib/utils'

type Tab = 'overview' | 'tasks' | 'expenses' | 'notes'
const TABS: { key: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'tasks', label: 'Tasks', icon: LayoutGrid },
  { key: 'expenses', label: 'Expenses', icon: ReceiptIndianRupee },
  { key: 'notes', label: 'Notes', icon: StickyNote },
]

export function EventWorkspace() {
  const { key } = useParams<{ key: string }>()
  const tasks = useStore((s) => s.tasks)
  const settings = useStore((s) => s.settings)
  const [tab, setTab] = useState<Tab>('overview')
  const [fireConfetti, setFireConfetti] = useState(false)
  const prevProgress = useRef<number | null>(null)

  const eventKey = key as EventKey
  const isValid = eventKey === 'common' || settings.events.some((e) => e.id === eventKey)
  const st = useMemo(
    () => (isValid ? eventStats(eventKey, tasks) : null),
    [eventKey, isValid, tasks],
  )

  useEffect(() => {
    if (!st) return
    if (prevProgress.current !== null && prevProgress.current < 100 && st.taskProgress === 100 && st.totalTasks > 0) {
      setFireConfetti(true)
      setTimeout(() => setFireConfetti(false), 100)
    }
    prevProgress.current = st.taskProgress
  }, [st?.taskProgress, st?.totalTasks])

  // reset tab when navigating between events
  useEffect(() => {
    setTab('overview')
    prevProgress.current = null
  }, [eventKey])

  if (!isValid || !st) return <Navigate to="/app/home" replace />
  const event = findEvent(settings.events, eventKey)
  const eventDate = event.date
  const days = eventDate ? daysUntil(eventDate) : null

  return (
    <div className="space-y-6">
      <Confetti fire={fireConfetti} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-soft"
        style={{ background: `linear-gradient(135deg, ${event.accent}0f, #ffffff 55%)` }}
      >
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div
              className="grid h-16 w-16 place-items-center rounded-2xl text-3xl"
              style={{ background: `${event.accent}22` }}
            >
              {event.emoji}
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">{event.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                {event.id !== 'common' && (
                  <span className="chip bg-ivory">
                    <CalendarDays size={12} /> {eventDate ? fmtDate(eventDate) : 'Date TBD'}
                  </span>
                )}
                {event.id !== 'common' && days !== null && (
                  <span className="chip bg-ivory">{days >= 0 ? `${days} days to go` : 'Completed'}</span>
                )}
                <span className="chip bg-ivory">
                  <Wallet size={12} /> {inr(st.actual, { compact: true })} of {inr(st.budgeted, { compact: true })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <ProgressRing value={st.taskProgress} size={92} stroke={9} color={event.accent} sublabel="tasks" />
            <div className="min-w-[130px] space-y-3">
              <MiniStat label="Completed" value={`${st.completed}/${st.totalTasks}`} />
              <MiniStat label="Pending" value={String(st.pending)} accent={st.overdue ? '#D98A7B' : undefined} />
              <MiniStat label="Actual spent" value={inr(st.actual, { compact: true })} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-line no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.key ? 'text-ink' : 'text-ink-faint hover:text-ink-soft',
            )}
          >
            {t.label}
            {tab === t.key && (
              <motion.span layoutId="event-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-champagne" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === 'overview' && <Overview eventKey={eventKey} />}
        {tab === 'tasks' && <KanbanBoard eventKey={eventKey} />}
        {tab === 'expenses' && <ExpensesTab eventKey={eventKey} />}
        {tab === 'notes' && <NotesTab eventKey={eventKey} />}
      </motion.div>
    </div>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink-soft">{label}</span>
      <span className="text-sm font-semibold" style={{ color: accent ?? '#2B2622' }}>
        {value}
      </span>
    </div>
  )
}

function Overview({ eventKey }: { eventKey: EventKey }) {
  const tasks = useStore((s) => s.tasks)
  const users = useStore((s) => s.users)
  const { openTask } = useUI()
  const st = eventStats(eventKey, tasks)
  const vv = varianceView(st.budgeted, st.actual)
  const usedPct = st.budgeted > 0 ? Math.round((st.actual / st.budgeted) * 100) : 0

  // who owns what
  const byOwner = users
    .map((u) => ({
      user: u,
      count: tasks.filter((t) => t.eventKey === eventKey && t.assignedTo === u.id && t.status !== 'completed').length,
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)

  const upcomingTasks = tasks
    .filter((t) => t.eventKey === eventKey && t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:col-span-3">
        <SmallCard label="Total tasks" value={st.totalTasks} tone="#8CA98C" />
        <SmallCard label="Completed" value={st.completed} tone="#5F7A5F" />
        <SmallCard label="In progress" value={st.inProgress} tone="#D4AF37" />
        <SmallCard label="Overdue" value={st.overdue} tone="#D98A7B" />
      </div>

      <div className="card p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Spending</h3>
          <span className="text-xs text-ink-faint">
            {st.expenseTaskCount} task{st.expenseTaskCount === 1 ? '' : 's'} with a cost
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-ink-faint">Budgeted</p>
            <p className="font-display text-lg font-semibold text-ink">{inr(st.budgeted, { compact: true })}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">Actual</p>
            <p className="font-display text-lg font-semibold text-sage-deep">{inr(st.actual, { compact: true })}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">{vv.label}</p>
            <p className={cn('font-display text-lg font-semibold', vv.over ? 'text-clay' : 'text-sage-deep')}>
              {inr(vv.amount, { compact: true })}
            </p>
          </div>
        </div>
        {st.budgeted > 0 ? (
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-ink-faint">
              <span>Actual vs budget</span>
              <span className={cn('font-semibold', vv.over ? 'text-clay' : 'text-ink-soft')}>{usedPct}%</span>
            </div>
            <ProgressBar value={Math.min(100, usedPct)} color={vv.over ? '#B87883' : '#5F7A5F'} />
          </div>
        ) : st.actual > 0 ? (
          <p className="mt-5 border-t border-line pt-4 text-center text-sm text-ink-soft">
            <b className="text-ink">{inr(st.actual, { compact: true })}</b> spent — no budget set yet.
          </p>
        ) : (
          <p className="mt-5 border-t border-line pt-4 text-center text-sm text-ink-soft">
            No costs yet — add a budget or actual amount inside any task.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">Next up</h3>
            <button className="text-sm font-medium text-champagne-deep" onClick={() => openTask({ defaultEvent: eventKey })}>
              + Task
            </button>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-soft">No scheduled tasks 🎉</p>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => openTask({ task: t })}
                  className="flex w-full items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-left text-sm hover:border-champagne/50"
                >
                  <span className="flex-1 truncate text-ink">{t.title}</span>
                  <span className="text-xs text-ink-faint">{fmtDate(t.dueDate, 'd MMM')}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {byOwner.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-3 font-display text-lg font-semibold text-ink">Who's on it</h3>
            <div className="space-y-2.5">
              {byOwner.map(({ user, count }) => (
                <div key={user.id} className="flex items-center gap-2.5">
                  <Avatar user={user} size={28} />
                  <span className="flex-1 text-sm text-ink">{user.name}</span>
                  <span className="chip bg-ivory text-ink-soft">{count} open</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SmallCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold" style={{ color: tone }}>
        {value}
      </p>
    </div>
  )
}

function ExpensesTab({ eventKey }: { eventKey: EventKey }) {
  const tasks = useStore((s) => s.tasks)
  const st = eventStats(eventKey, tasks)
  const vv = varianceView(st.budgeted, st.actual)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <MoneyCard label="Budgeted" value={st.budgeted} tone="#D4AF37" />
        <MoneyCard label="Actual spent" value={st.actual} tone="#5F7A5F" />
        <MoneyCard label={vv.label} value={vv.amount} tone={vv.over ? '#B87883' : '#5F7A5F'} />
      </div>
      <p className="text-sm text-ink-soft">
        Every cost here comes from a task — open a task to add or change its budget and actual amounts.
      </p>
      <TaskExpenseList eventKey={eventKey} />
    </div>
  )
}

function MoneyCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold" style={{ color: tone }}>
        {inr(value, { compact: true })}
      </p>
    </div>
  )
}

function NotesTab({ eventKey }: { eventKey: EventKey }) {
  const storageKey = `wedding-dashboard:notes:${eventKey}`
  const [notes, setNotes] = useState(() => localStorage.getItem(storageKey) ?? '')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(storageKey, notes)
      setSaved(true)
      const s = setTimeout(() => setSaved(false), 1500)
      return () => clearTimeout(s)
    }, 500)
    return () => clearTimeout(t)
  }, [notes, storageKey])

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">Notes & ideas</h3>
        <span className="text-xs text-ink-faint">{saved ? 'Saved ✓' : 'Auto-saves'}</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Jot down decor ideas, vendor contacts, guest reminders, colour palettes…"
        className="min-h-[280px] w-full resize-none rounded-xl border border-line bg-white p-4 text-sm text-ink outline-none focus:border-champagne focus:ring-4 focus:ring-champagne/15"
      />
      <p className="mt-2 text-xs text-ink-faint">Notes are saved on this device.</p>
    </div>
  )
}
