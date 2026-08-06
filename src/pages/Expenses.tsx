import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useUI } from '@/components/layout/UIProvider'
import { allEvents } from '@/lib/events'
import { eventStats, overallStats } from '@/lib/selectors'
import { CategoryDonut } from '@/components/charts/Charts'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CountUp } from '@/components/ui/CountUp'
import { EmptyState } from '@/components/ui/EmptyState'
import { inr } from '@/lib/utils'

export function Expenses() {
  const tasks = useStore((s) => s.tasks)
  const expenses = useStore((s) => s.expenses)
  const events = allEvents(useStore((s) => s.settings.events))
  const { openExpense } = useUI()
  const stats = overallStats(tasks, expenses)

  // Per-event totals, biggest first (only events that have spend).
  const byEvent = events
    .map((e) => ({ event: e, total: eventStats(e.id, tasks, expenses).total }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
  const maxTotal = byEvent[0]?.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Expenses</h1>
          <p className="text-ink-soft">Everything you spend, totalled across events and per event.</p>
        </div>
        <button className="btn-gold" onClick={() => openExpense()}>
          <Wallet size={16} /> Add expense
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} icon={<Wallet size={16} />} label="Total expenses" value={<CountUp value={stats.totalExpense} format={(n) => inr(n, { compact: true })} />} sub={`${stats.expenseCount} item${stats.expenseCount === 1 ? '' : 's'}`} accent="#D4AF37" />
        <StatCard index={1} icon={<Wallet size={16} />} label="Paid" value={<CountUp value={stats.paid} format={(n) => inr(n, { compact: true })} />} sub="Cleared so far" accent="#5F7A5F" />
        <StatCard index={2} icon={<Wallet size={16} />} label="Outstanding" value={<CountUp value={stats.due} format={(n) => inr(n, { compact: true })} />} sub="Still to pay" accent="#B87883" />
        <StatCard index={3} icon={<Wallet size={16} />} label="Events with spend" value={<CountUp value={byEvent.length} />} sub={`of ${events.length}`} accent="#8CA98C" />
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          emoji="💸"
          title="No expenses yet"
          hint="Add your first expense — it'll roll up here across events, and show on each event too."
          action={
            <button className="btn-gold" onClick={() => openExpense()}>
              <Wallet size={16} /> Add expense
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink">Spending by event</h3>
              <div className="space-y-3">
                {byEvent.map(({ event, total }) => (
                  <Link key={event.id} to={`/app/event/${event.id}`} className="block">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-ink">
                        <span>{event.emoji}</span> {event.name}
                      </span>
                      <span className="font-semibold text-ink">{inr(total, { compact: true })}</span>
                    </div>
                    <ProgressBar value={maxTotal ? (total / maxTotal) * 100 : 0} color={event.accent} />
                  </Link>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink">Spending by category</h3>
              <CategoryDonut expenses={expenses} />
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-display text-lg font-semibold text-ink">All expenses</h3>
            <ExpenseTable />
          </div>
        </>
      )}
    </div>
  )
}
