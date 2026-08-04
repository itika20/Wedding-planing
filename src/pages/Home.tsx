import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlarmClock,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  ListTodo,
  Plus,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useStore, useCurrentUser } from '@/store/useStore'
import { useUI } from '@/components/layout/UIProvider'
import { overallStats, eventStats } from '@/lib/selectors'
import { EVENTS, WEDDING_DATE, getEvent } from '@/data/config'
import { CountUp } from '@/components/ui/CountUp'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatCard } from '@/components/ui/StatCard'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { Avatar } from '@/components/ui/Avatar'
import { daysUntil, fmtDateShort, inr, isDueToday, isOverdue } from '@/lib/utils'

export function Home() {
  const tasks = useStore((s) => s.tasks)
  const expenses = useStore((s) => s.expenses)
  const users = useStore((s) => s.users)
  const user = useCurrentUser()
  const navigate = useNavigate()
  const { openTask, openExpense } = useUI()

  const stats = overallStats(tasks, expenses)
  const days = daysUntil(WEDDING_DATE)
  const eventList = EVENTS.filter((e) => e.key !== 'common')

  const todayTasks = tasks
    .filter((t) => t.status !== 'completed' && t.status !== 'cancelled' && (isDueToday(t.dueDate) || isOverdue(t.dueDate)))
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, 6)

  const upcoming = [...EVENTS]
    .filter((e) => e.key !== 'common' && daysUntil(e.date) >= 0)
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
                  {fmtDateShort(WEDDING_DATE)}. Here's where everything stands.
                </>
              ) : (
                "It's celebration time — here's your final overview."
              )}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-gold" onClick={() => openTask()}>
                <Plus size={16} /> Add task
              </button>
              <button className="btn-outline" onClick={() => openExpense()}>
                <Wallet size={16} /> Add expense
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
        <StatCard index={0} icon={<ListTodo size={16} />} label="Total tasks" value={<CountUp value={stats.totalTasks} />} sub={`${stats.completed} done`} accent="#8CA98C" />
        <StatCard index={1} icon={<CheckCircle2 size={16} />} label="Completed" value={<CountUp value={stats.completed} />} sub={`${stats.progress}% of all tasks`} accent="#5F7A5F" />
        <StatCard index={2} icon={<ClipboardList size={16} />} label="Pending" value={<CountUp value={stats.pending} />} sub={`${stats.dueToday} due today`} accent="#D4AF37" />
        <StatCard index={3} icon={<AlarmClock size={16} />} label="Overdue" value={<CountUp value={stats.overdue} />} sub={stats.overdue ? 'Needs attention' : 'All on track'} accent="#D98A7B" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard index={0} icon={<CircleDollarSign size={16} />} label="Total budget" value={<CountUp value={stats.totalBudget} format={(n) => inr(n, { compact: true })} />} sub="Across all events" accent="#D4AF37" />
        <StatCard index={1} icon={<Wallet size={16} />} label="Money spent" value={<CountUp value={stats.spent} format={(n) => inr(n, { compact: true })} />} sub={`${inr(stats.committed, { compact: true })} committed`} accent="#B87883" />
        <StatCard index={2} icon={<TrendingUp size={16} />} label="Remaining" value={<CountUp value={stats.remaining} format={(n) => inr(n, { compact: true })} />} sub="Budget still available" accent="#8CA98C" />
      </div>

      {/* Event progress */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Event progress</h2>
          <Link to="/app/event/common" className="text-sm font-medium text-champagne-deep hover:underline">
            Common planning →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {eventList.map((e, i) => {
            const st = eventStats(e.key, tasks, expenses)
            return (
              <motion.button
                key={e.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/app/event/${e.key}`)}
                className="card card-hover flex flex-col items-center p-4 text-center"
              >
                <ProgressRing value={st.taskProgress} size={78} stroke={7} color={e.accent} label={<span className="text-xl">{e.emoji}</span>} />
                <p className="mt-2 text-sm font-semibold text-ink">{e.name}</p>
                <p className="text-xs text-ink-faint">
                  {st.completed}/{st.totalTasks} tasks
                </p>
                <p className="mt-0.5 text-[11px] text-ink-faint">{daysUntil(e.date)}d · {inr(st.spent, { compact: true })}</p>
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* Lower grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Today's tasks */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">Today & overdue</h3>
            <span className="chip bg-clay-soft/60 text-clay">{todayTasks.length}</span>
          </div>
          {todayTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-soft">🎉 Nothing due today. You're all caught up!</p>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((t) => {
                const overdue = isOverdue(t.dueDate)
                const assignee = users.find((u) => u.id === t.assignedTo)
                return (
                  <button
                    key={t.id}
                    onClick={() => openTask({ task: t })}
                    className="flex w-full items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 text-left transition hover:border-champagne/50 hover:shadow-soft"
                  >
                    <span className="text-lg">{getEvent(t.eventKey).emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                      <p className="text-xs text-ink-faint">{getEvent(t.eventKey).name}</p>
                    </div>
                    <span className={`chip ${overdue ? 'bg-clay-soft text-clay' : 'bg-amber-soft text-amber'}`}>
                      {overdue ? 'Overdue' : 'Today'}
                    </span>
                    {assignee && <Avatar user={assignee} size={24} />}
                  </button>
                )
              })}
            </div>
          )}

          {/* Upcoming events */}
          <div className="mt-6">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <CalendarClock size={15} className="text-champagne-deep" /> Upcoming events
            </h4>
            <div className="grid gap-2 sm:grid-cols-3">
              {upcoming.map((e) => (
                <Link
                  key={e.key}
                  to={`/app/event/${e.key}`}
                  className="rounded-xl border border-line bg-offwhite/50 p-3 transition hover:shadow-soft"
                >
                  <div className="text-xl">{e.emoji}</div>
                  <p className="mt-1 text-sm font-semibold text-ink">{e.name}</p>
                  <p className="text-xs text-ink-faint">{fmtDateShort(e.date)} · {daysUntil(e.date)}d</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Activity + recently done */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-4 font-display text-lg font-semibold text-ink">Recent activity</h3>
            <ActivityFeed limit={5} />
            <Link to="/app/activity" className="mt-2 block text-sm font-medium text-champagne-deep hover:underline">
              View all →
            </Link>
          </div>
          {recentlyDone.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 font-display text-lg font-semibold text-ink">Recently completed</h3>
              <div className="space-y-2">
                {recentlyDone.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={15} className="shrink-0 text-sage-deep" />
                    <span className="flex-1 truncate text-ink-soft line-through">{t.title}</span>
                    <span className="text-xs">{getEvent(t.eventKey).emoji}</span>
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
