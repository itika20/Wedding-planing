import { Wallet } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useUI } from '@/components/layout/UIProvider'
import { EVENTS } from '@/data/config'
import { eventStats, overallStats } from '@/lib/selectors'
import { BudgetBars, CategoryDonut } from '@/components/charts/Charts'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CountUp } from '@/components/ui/CountUp'
import { inr, pct } from '@/lib/utils'

export function Budget() {
  const tasks = useStore((s) => s.tasks)
  const expenses = useStore((s) => s.expenses)
  const { openExpense } = useUI()
  const stats = overallStats(tasks, expenses)

  const barData = EVENTS.map((e) => {
    const st = eventStats(e.key, tasks, expenses)
    return { name: e.name.split(' ')[0], budget: e.budget, spent: st.spent, accent: e.accent }
  })

  const committedPct = pct(stats.committed, stats.totalBudget)
  const paidPct = pct(stats.spent, stats.totalBudget)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Budget</h1>
          <p className="text-ink-soft">Every rupee, across every event.</p>
        </div>
        <button className="btn-gold" onClick={() => openExpense()}>
          <Wallet size={16} /> Add expense
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} icon={<Wallet size={16} />} label="Total budget" value={<CountUp value={stats.totalBudget} format={(n) => inr(n, { compact: true })} />} accent="#D4AF37" />
        <StatCard index={1} icon={<Wallet size={16} />} label="Committed" value={<CountUp value={stats.committed} format={(n) => inr(n, { compact: true })} />} sub={`${committedPct}% of budget`} accent="#B87883" />
        <StatCard index={2} icon={<Wallet size={16} />} label="Paid" value={<CountUp value={stats.spent} format={(n) => inr(n, { compact: true })} />} sub={`${paidPct}% of budget`} accent="#5F7A5F" />
        <StatCard index={3} icon={<Wallet size={16} />} label="Remaining" value={<CountUp value={stats.totalBudget - stats.committed} format={(n) => inr(n, { compact: true })} />} sub="Uncommitted" accent="#8CA98C" />
      </div>

      <div className="card p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-ink">Overall budget health</span>
          <span className="text-ink-soft">{inr(stats.spent)} paid of {inr(stats.totalBudget)}</span>
        </div>
        <div className="relative">
          <ProgressBar value={committedPct} color="#E7D3A1" height={14} />
          <div className="absolute inset-0">
            <ProgressBar value={paidPct} color="#5F7A5F" height={14} />
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-sage-deep" /> Paid</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-champagne-soft" /> Committed</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-line" /> Budget</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-display text-lg font-semibold text-ink">Budget vs spent by event</h3>
          <BudgetBars data={barData} />
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
    </div>
  )
}
