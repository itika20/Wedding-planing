import { Link } from 'react-router-dom'
import { ReceiptIndianRupee, Scale, Wallet } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { allEvents } from '@/lib/events'
import { eventStats, overallStats } from '@/lib/selectors'
import { TaskExpenseList } from '@/components/expenses/TaskExpenseList'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CountUp } from '@/components/ui/CountUp'
import { EmptyState } from '@/components/ui/EmptyState'
import { inr } from '@/lib/utils'

export function Expenses() {
  const tasks = useStore((s) => s.tasks)
  const events = allEvents(useStore((s) => s.settings.events))
  const stats = overallStats(tasks)
  const over = stats.variance > 0

  // Per-event budgeted/actual, biggest first (only events that have spend).
  const byEvent = events
    .map((e) => ({ event: e, st: eventStats(e.id, tasks) }))
    .filter((x) => x.st.budgeted > 0 || x.st.actual > 0)
    .sort((a, b) => Math.max(b.st.actual, b.st.budgeted) - Math.max(a.st.actual, a.st.budgeted))
  const maxTotal = byEvent.reduce((m, x) => Math.max(m, x.st.actual, x.st.budgeted), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Expenses</h1>
        <p className="text-ink-soft">
          Budgeted vs actual, rolled up from every task — per event and across the whole wedding.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} icon={<ReceiptIndianRupee size={16} />} label="Budgeted" value={<CountUp value={stats.budgeted} format={(n) => inr(n, { compact: true })} />} sub={`${stats.expenseTaskCount} task${stats.expenseTaskCount === 1 ? '' : 's'} with a cost`} accent="#D4AF37" />
        <StatCard index={1} icon={<Wallet size={16} />} label="Actual spent" value={<CountUp value={stats.actual} format={(n) => inr(n, { compact: true })} />} sub="Logged so far" accent="#5F7A5F" />
        <StatCard index={2} icon={<Scale size={16} />} label={over ? 'Over budget' : 'Under budget'} value={<CountUp value={Math.abs(stats.variance)} format={(n) => inr(n, { compact: true })} />} sub={stats.variance === 0 ? 'Right on budget' : over ? 'Above planned' : 'Below planned'} accent={over ? '#B87883' : '#5F7A5F'} />
        <StatCard index={3} icon={<ReceiptIndianRupee size={16} />} label="Events with spend" value={<CountUp value={byEvent.length} />} sub={`of ${events.length}`} accent="#8CA98C" />
      </div>

      {stats.expenseTaskCount === 0 ? (
        <EmptyState
          emoji="💸"
          title="No expenses yet"
          hint="Open any task and add a budget or actual amount — on the task itself, or itemised across its subtasks. Totals roll up here across every event."
        />
      ) : (
        <>
          <div className="card p-5">
            <h3 className="mb-4 font-display text-lg font-semibold text-ink">Spending by event</h3>
            <div className="space-y-4">
              {byEvent.map(({ event, st }) => {
                const o = st.variance > 0
                return (
                  <Link key={event.id} to={`/app/event/${event.id}`} className="block">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-ink">
                        <span>{event.emoji}</span> {event.name}
                      </span>
                      <span className="text-ink-soft">
                        <b className="text-ink">{inr(st.actual, { compact: true })}</b> / {inr(st.budgeted, { compact: true })}
                      </span>
                    </div>
                    <ProgressBar value={maxTotal ? (st.actual / maxTotal) * 100 : 0} color={o ? '#B87883' : event.accent} />
                  </Link>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-display text-lg font-semibold text-ink">All task expenses</h3>
            <TaskExpenseList showEvent />
          </div>
        </>
      )}
    </div>
  )
}
