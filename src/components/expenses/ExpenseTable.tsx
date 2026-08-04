import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { EventKey, Expense } from '@/lib/types'
import { CATEGORY_COLORS } from '@/data/config'
import { useStore } from '@/store/useStore'
import { useUI } from '@/components/layout/UIProvider'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { fmtDate, inr } from '@/lib/utils'

const STATUS_STYLE = {
  paid: { color: '#5F7A5F', bg: '#DDE8DD', label: 'Paid' },
  partial: { color: '#B8912A', bg: '#F6E9CC', label: 'Partial' },
  unpaid: { color: '#B87883', bg: '#F3D9D3', label: 'Unpaid' },
}

export function ExpenseTable({ eventKey }: { eventKey?: EventKey }) {
  const expenses = useStore((s) => s.expenses)
  const deleteExpense = useStore((s) => s.deleteExpense)
  const { openExpense } = useUI()

  const list = useMemo(() => {
    const l = eventKey ? expenses.filter((e) => e.eventKey === eventKey) : expenses
    return [...l].sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, eventKey])

  if (list.length === 0) {
    return (
      <EmptyState
        emoji="💰"
        title="No expenses tracked yet"
        hint="Add costs, advances, and payments to keep the budget under control."
        action={
          <button className="btn-gold" onClick={() => openExpense({ defaultEvent: eventKey })}>
            <Plus size={16} /> Add expense
          </button>
        }
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="hidden grid-cols-12 gap-3 border-b border-line bg-offwhite/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint md:grid">
        <div className="col-span-4">Expense</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-3">Payment</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1"></div>
      </div>
      <div className="divide-y divide-line">
        {list.map((e) => (
          <ExpenseRow key={e.id} e={e} onEdit={() => openExpense({ expense: e })} onDelete={() => deleteExpense(e.id)} />
        ))}
      </div>
    </div>
  )
}

function ExpenseRow({ e, onEdit, onDelete }: { e: Expense; onEdit: () => void; onDelete: () => void }) {
  const [hover, setHover] = useState(false)
  const st = STATUS_STYLE[e.paymentStatus]
  const paidPct = e.amount ? Math.round((e.paid / e.amount) * 100) : 0

  return (
    <div
      className="grid grid-cols-2 gap-3 px-4 py-3 transition hover:bg-offwhite/40 md:grid-cols-12 md:items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="md:col-span-4">
        <p className="text-sm font-medium text-ink">{e.name}</p>
        <p className="text-xs text-ink-faint">
          {e.vendor || 'No vendor'} · {fmtDate(e.date)}
        </p>
      </div>
      <div className="md:col-span-2">
        <Badge color={CATEGORY_COLORS[e.category]} bg={`${CATEGORY_COLORS[e.category]}1e`} dot>
          {e.category}
        </Badge>
      </div>
      <div className="md:col-span-3">
        <div className="flex items-center gap-2">
          <Badge color={st.color} bg={st.bg}>
            {st.label}
          </Badge>
          <span className="text-xs text-ink-faint">
            {inr(e.paid, { compact: true })} / {inr(e.amount, { compact: true })}
          </span>
        </div>
        <ProgressBar value={paidPct} color={st.color} height={4} className="mt-1.5 max-w-[160px]" />
      </div>
      <div className="text-right md:col-span-2">
        <p className="text-sm font-semibold text-ink">{inr(e.amount)}</p>
        {e.amount - e.paid > 0 && <p className="text-xs text-clay">{inr(e.amount - e.paid)} due</p>}
      </div>
      <div className="flex items-center justify-end gap-1 md:col-span-1">
        <button
          onClick={onEdit}
          className={`rounded-md p-1.5 text-ink-faint transition hover:bg-ink/5 hover:text-ink ${hover ? 'opacity-100' : 'md:opacity-0'}`}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className={`rounded-md p-1.5 text-ink-faint transition hover:bg-clay-soft/50 hover:text-clay ${hover ? 'opacity-100' : 'md:opacity-0'}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
