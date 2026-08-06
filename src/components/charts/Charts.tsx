import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Expense, ExpenseCategory } from '@/lib/types'
import { CATEGORY_COLORS } from '@/data/config'
import { inr } from '@/lib/utils'

export function CategoryDonut({ expenses, height = 220 }: { expenses: Expense[]; height?: number }) {
  const byCat = new Map<ExpenseCategory, number>()
  for (const e of expenses) byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount)
  const data = [...byCat.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return <div className="grid h-[220px] place-items-center text-sm text-ink-faint">No expense data yet</div>
  }

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="100%" paddingAngle={2} stroke="none">
              {data.map((d) => (
                <Cell key={d.name} fill={CATEGORY_COLORS[d.name as ExpenseCategory]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) => inr(v)}
              contentStyle={{ borderRadius: 12, border: '1px solid #EFE6DD', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-wide text-ink-faint">Total</span>
          <span className="font-display text-lg font-semibold text-ink">{inr(total, { compact: true })}</span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {data.slice(0, 7).map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: CATEGORY_COLORS[d.name as ExpenseCategory] }} />
            <span className="flex-1 text-ink-soft">{d.name}</span>
            <span className="font-medium text-ink">{inr(d.value, { compact: true })}</span>
            <span className="w-10 text-right text-xs text-ink-faint">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
