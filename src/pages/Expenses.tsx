import { Link } from 'react-router-dom'
import { ReceiptIndianRupee, Scale, Store, Wallet } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCollections } from '@/store/useCollections'
import { allEvents, findEvent } from '@/lib/events'
import { eventStats, overallStats } from '@/lib/selectors'
import { varianceView } from '@/lib/expenses'
import { TaskExpenseList } from '@/components/expenses/TaskExpenseList'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CountUp } from '@/components/ui/CountUp'
import { EmptyState } from '@/components/ui/EmptyState'
import { inr } from '@/lib/utils'

export function Expenses() {
  const tasks = useStore((s) => s.tasks)
  const eventList = useStore((s) => s.settings.events)
  const events = allEvents(eventList)
  const vendors = useCollections((s) => s.vendors)
  const stats = overallStats(tasks, vendors)
  const vv = varianceView(stats.budgeted, stats.actual)

  // Vendors carrying a cost, biggest first — shown as their own expense list.
  const vendorRows = vendors
    .filter((v) => (v.budgeted ?? 0) > 0 || (v.actual ?? 0) > 0)
    .sort((a, b) => Math.max(b.actual ?? 0, b.budgeted ?? 0) - Math.max(a.actual ?? 0, a.budgeted ?? 0))

  // Per-event budgeted/actual, biggest first (only events that have spend).
  const byEvent = events
    .map((e) => ({ event: e, st: eventStats(e.id, tasks, vendors) }))
    .filter((x) => x.st.budgeted > 0 || x.st.actual > 0)
    .sort((a, b) => Math.max(b.st.actual, b.st.budgeted) - Math.max(a.st.actual, a.st.budgeted))
  const maxTotal = byEvent.reduce((m, x) => Math.max(m, x.st.actual, x.st.budgeted), 0)
  const hasExpenses = stats.expenseTaskCount > 0 || stats.vendorCount > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Expenses</h1>
        <p className="text-ink-soft">
          Budgeted vs actual, rolled up from every task — per event and across the whole wedding.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} icon={<ReceiptIndianRupee size={16} />} label="Budgeted" value={<CountUp value={stats.budgeted} format={(n) => inr(n, { compact: true })} />} sub={[stats.expenseTaskCount ? `${stats.expenseTaskCount} task${stats.expenseTaskCount === 1 ? '' : 's'}` : null, stats.vendorCount ? `${stats.vendorCount} vendor${stats.vendorCount === 1 ? '' : 's'}` : null].filter(Boolean).join(' · ') || 'nothing yet'} accent="#D4AF37" />
        <StatCard index={1} icon={<Wallet size={16} />} label="Actual spent" value={<CountUp value={stats.actual} format={(n) => inr(n, { compact: true })} />} sub="Logged so far" accent="#5F7A5F" />
        <StatCard index={2} icon={<Scale size={16} />} label={vv.label} value={<CountUp value={vv.amount} format={(n) => inr(n, { compact: true })} />} sub={vv.hint} accent={vv.over ? '#B87883' : '#5F7A5F'} />
        <StatCard index={3} icon={<ReceiptIndianRupee size={16} />} label="Events with spend" value={<CountUp value={byEvent.length} />} sub={`of ${events.length}`} accent="#8CA98C" />
      </div>

      {!hasExpenses ? (
        <EmptyState
          emoji="💸"
          title="No expenses yet"
          hint="Add a budget or actual amount to any task — or a cost to any vendor. Totals roll up here across every event."
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

          {vendorRows.length > 0 && (
            <div>
              <h3 className="mb-3 font-display text-lg font-semibold text-ink">Vendor costs</h3>
              <div className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="divide-y divide-line">
                  {vendorRows.map((v) => {
                    const paid = v.actual ?? 0
                    const est = v.budgeted ?? 0
                    return (
                      <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-champagne/10 text-champagne-deep">
                          <Store size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{v.name}</p>
                          <p className="truncate text-xs text-ink-faint">
                            {v.category || 'Vendor'}
                            {v.eventKey ? ` · ${findEvent(eventList, v.eventKey).emoji} ${findEvent(eventList, v.eventKey).name}` : ' · General'}
                          </p>
                        </div>
                        <div className="text-right leading-tight">
                          {paid > 0 && <p className="text-sm font-semibold tabular-nums text-ink">{inr(paid)}</p>}
                          {est > 0 && <p className="text-xs tabular-nums text-ink-faint">{paid > 0 ? `of ${inr(est)}` : inr(est)}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
