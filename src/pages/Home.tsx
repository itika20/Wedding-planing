import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ListTodo,
  Loader,
  Plus,
  ReceiptIndianRupee,
  Scale,
  Wallet,
} from 'lucide-react'
import { useStore, useCurrentUser } from '@/store/useStore'
import { useCollections } from '@/store/useCollections'
import { useUI } from '@/components/layout/UIProvider'
import { overallStats, eventStats } from '@/lib/selectors'
import { varianceView } from '@/lib/expenses'
import { findEvent } from '@/lib/events'
import type { EventMeta } from '@/lib/types'
import { CountUp } from '@/components/ui/CountUp'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatCard } from '@/components/ui/StatCard'
import { invitedFor } from '@/lib/guests'
import { daysUntil, fmtDateShort, inr } from '@/lib/utils'

export function Home() {
  const tasks = useStore((s) => s.tasks)
  const vendors = useCollections((s) => s.vendors)
  const guests = useCollections((s) => s.guests)
  const user = useCurrentUser()
  const navigate = useNavigate()
  const { openTask } = useUI()

  const settings = useStore((s) => s.settings)
  const { weddingDate, events } = settings

  const stats = overallStats(tasks, vendors)
  const vv = varianceView(stats.budgeted, stats.actual)
  const days = weddingDate ? daysUntil(weddingDate) : 0
  const eventList = events

  // ≤4 events → one line; 5+ → two balanced rows (extra card on top).
  const perRow = eventList.length <= 4 ? Math.max(eventList.length, 1) : Math.ceil(eventList.length / 2)
  const eventRows: EventMeta[][] = []
  for (let i = 0; i < eventList.length; i += perRow) eventRows.push(eventList.slice(i, i + perRow))

  const renderEventCard = (e: EventMeta) => {
    const st = eventStats(e.id, tasks, vendors)
    const d = e.date
    const hasMoney = st.budgeted > 0 || st.actual > 0
    return (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate(`/app/event/${e.id}`)}
        className="card card-hover flex h-full w-full flex-col items-center p-4 text-center"
      >
        <ProgressRing value={st.taskProgress} size={78} stroke={7} color={e.accent} label={<span className="text-xl">{e.emoji}</span>} />
        <p className="mt-2 line-clamp-1 text-sm font-semibold text-ink">{e.name}</p>
        <p className="text-xs text-ink-faint">
          {st.completed}/{st.totalTasks} tasks
        </p>
        {/* Always reserve this line so cards with no date/spend stay the same height. */}
        <p className="mt-0.5 min-h-[16px] text-[11px] text-ink-faint">
          {d ? `${daysUntil(d)}d` : ''}
          {d && hasMoney ? ' · ' : ''}
          {hasMoney ? `${inr(st.actual, { compact: true })} / ${inr(st.budgeted, { compact: true })}` : ''}
        </p>
      </motion.button>
    )
  }

  // Per-function head-count for catering/planning — invited people per event
  // (using each family's per-event override where set).
  const headcount = eventList
    .map((e) => ({
      event: e,
      invited: guests.filter((g) => (g.events ?? []).includes(e.id)).reduce((s, g) => s + invitedFor(g, e.id), 0),
    }))
    .filter((h) => h.invited > 0)

  const upcoming = eventList
    .filter((e) => e.date && daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)

  const recentlyDone = tasks
    .filter((t) => t.status === 'completed' && t.completedAt)
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-white to-offwhite p-6 shadow-soft sm:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-champagne/10 blur-2xl" />
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne-deep">Wedding Dashboard</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Welcome back, {user?.name} 🌸
            </h1>
            <p className="mt-2 max-w-md text-ink-soft">
              {days > 0 ? (
                <>
                  Just <span className="font-semibold text-ink">{days} days</span> until the wedding on{' '}
                  {fmtDateShort(weddingDate)}. Here's where everything stands.
                </>
              ) : (
                "It's celebration time — here's your final overview."
              )}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-gold" onClick={() => openTask()}>
                <Plus size={16} /> Add task
              </button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <ProgressRing value={stats.progress} size={120} stroke={10} sublabel="complete" />
              <p className="mt-2 text-xs text-ink-soft">Overall progress</p>
            </div>
            <div className="hidden text-center sm:block">
              <div className="font-display text-5xl font-semibold text-champagne-deep">
                <CountUp value={days} />
              </div>
              <p className="text-xs uppercase tracking-wide text-ink-faint">days to go</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link to="/app/tasks" className="block" title="View all tasks">
          <StatCard index={0} icon={<ListTodo size={16} />} label="Total tasks" value={<CountUp value={stats.totalTasks} />} sub={`${stats.completed} done · view all →`} accent="#8CA98C" />
        </Link>
        <Link to="/app/tasks?state=completed" className="block" title="View completed tasks">
          <StatCard index={1} icon={<CheckCircle2 size={16} />} label="Completed" value={<CountUp value={stats.completed} />} sub={`${stats.progress}% of all tasks`} accent="#5F7A5F" />
        </Link>
        <Link to="/app/tasks?state=todo" className="block" title="View to-do tasks">
          <StatCard index={2} icon={<ClipboardList size={16} />} label="To do" value={<CountUp value={stats.todo} />} sub={`${stats.dueToday} due today`} accent="#D4AF37" />
        </Link>
        <Link to="/app/tasks?state=in_progress" className="block" title="View in-progress tasks">
          <StatCard index={3} icon={<Loader size={16} />} label="In progress" value={<CountUp value={stats.inProgress} />} sub={stats.inProgress ? 'Underway' : 'Nothing in flight'} accent="#D98A7B" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} icon={<ReceiptIndianRupee size={16} />} label="Budgeted" value={<CountUp value={stats.budgeted} format={(n) => inr(n, { compact: true })} />} sub={`${stats.expenseTaskCount} task${stats.expenseTaskCount === 1 ? '' : 's'} with a cost`} accent="#D4AF37" />
        <StatCard index={1} icon={<Wallet size={16} />} label="Actual spent" value={<CountUp value={stats.actual} format={(n) => inr(n, { compact: true })} />} sub="Logged so far" accent="#5F7A5F" />
        <StatCard index={2} icon={<Scale size={16} />} label={vv.label} value={<CountUp value={vv.amount} format={(n) => inr(n, { compact: true })} />} sub={vv.hint} accent={vv.over ? '#B87883' : '#5F7A5F'} />
      </div>

      {/* Event progress */}
      <section>
        <div className="mb-3">
          <h2 className="font-display text-xl font-semibold text-ink">Event progress</h2>
        </div>
        {eventList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white/50 px-6 py-8 text-center text-sm text-ink-soft">
            No events yet. Add your functions in <Link to="/app/settings" className="font-medium text-champagne-deep">Settings</Link>.
          </div>
        ) : (
          <>
            {/* Mobile: simple 2-up grid */}
            <div className="grid grid-cols-2 gap-4 sm:hidden">
              {eventList.map((e) => (
                <div key={e.id}>{renderEventCard(e)}</div>
              ))}
            </div>
            {/* Larger screens: ≤4 on one full-width line, 5+ split into two balanced rows.
                Every card keeps a full row's per-card width; a shorter last row is centred,
                so partial rows don't stretch their cards wider than the rest. */}
            <div className="hidden space-y-4 sm:block">
              {eventRows.map((row, ri) => (
                <div key={ri} className="flex justify-center gap-4">
                  {row.map((e) => (
                    <div key={e.id} style={{ width: `calc((100% - ${perRow - 1}rem) / ${perRow})` }}>
                      {renderEventCard(e)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Guests per function — concise head-count for catering/planning */}
      {headcount.length > 0 && (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">Guests by function</h3>
            <Link to="/app/guests" className="text-sm font-medium text-champagne-deep hover:underline">
              All guests →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {headcount.map((h) => (
              <span
                key={h.event.id}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-offwhite/50 px-3 py-1.5 text-sm"
                title={`${h.invited} invited to ${h.event.name}`}
              >
                <span>{h.event.emoji}</span>
                <span className="text-ink-soft">{h.event.name}</span>
                <span className="ml-0.5 font-semibold tabular-nums text-ink">{h.invited}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lower grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Upcoming events */}
        <div className="card p-5 lg:col-span-2">
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <CalendarClock size={17} className="text-champagne-deep" /> Upcoming events
            </h3>
            {upcoming.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line bg-offwhite/40 px-3 py-4 text-center text-xs text-ink-faint">
                No dated events yet — add dates in Settings.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-3">
                {upcoming.map((e) => (
                  <Link
                    key={e.id}
                    to={`/app/event/${e.id}`}
                    className="rounded-xl border border-line bg-offwhite/50 p-3 transition hover:shadow-soft"
                  >
                    <div className="text-xl">{e.emoji}</div>
                    <p className="mt-1 text-sm font-semibold text-ink">{e.name}</p>
                    <p className="text-xs text-ink-faint">
                      {fmtDateShort(e.date)} · {daysUntil(e.date)}d
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recently done */}
        <div className="space-y-4">
          {recentlyDone.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 font-display text-lg font-semibold text-ink">Recently completed</h3>
              <div className="space-y-2">
                {recentlyDone.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={15} className="shrink-0 text-sage-deep" />
                    <span className="flex-1 truncate text-ink-soft line-through">{t.title}</span>
                    <span className="text-xs">{findEvent(events, t.eventKey).emoji}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
