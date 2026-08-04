import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useStore } from '@/store/useStore'
import { EVENTS, EXPENSE_CATEGORIES } from '@/data/config'
import type { EventKey, Expense, ExpenseCategory } from '@/lib/types'
import { inr } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  expense?: Expense | null
  defaultEvent?: EventKey
}

const METHODS = ['UPI', 'Bank Transfer', 'Cash', 'Card', 'Cheque']

export function ExpenseModal({ open, onClose, expense, defaultEvent = 'wedding' }: Props) {
  const addExpense = useStore((s) => s.addExpense)
  const updateExpense = useStore((s) => s.updateExpense)
  const editing = Boolean(expense)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('Miscellaneous')
  const [eventKey, setEventKey] = useState<EventKey>(defaultEvent)
  const [vendor, setVendor] = useState('')
  const [amount, setAmount] = useState('')
  const [paid, setPaid] = useState('')
  const [method, setMethod] = useState('UPI')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    if (expense) {
      setName(expense.name)
      setCategory(expense.category)
      setEventKey(expense.eventKey)
      setVendor(expense.vendor)
      setAmount(String(expense.amount))
      setPaid(String(expense.paid))
      setMethod(expense.paymentMethod)
      setDate(expense.date)
      setNotes(expense.notes)
    } else {
      setName('')
      setCategory('Miscellaneous')
      setEventKey(defaultEvent)
      setVendor('')
      setAmount('')
      setPaid('')
      setMethod('UPI')
      setDate(new Date().toISOString().slice(0, 10))
      setNotes('')
    }
  }, [open, expense, defaultEvent])

  const amountNum = Number(amount) || 0
  const paidNum = Number(paid) || 0
  const remaining = Math.max(0, amountNum - paidNum)
  const canSave = name.trim().length > 0 && amountNum > 0

  const submit = () => {
    if (!canSave) return
    const payload = {
      name: name.trim(),
      category,
      eventKey,
      vendor: vendor.trim(),
      amount: amountNum,
      paid: paidNum,
      paymentMethod: method,
      date: date || new Date().toISOString().slice(0, 10),
      notes: notes.trim(),
    }
    if (expense) updateExpense(expense.id, payload)
    else addExpense(payload)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit expense' : 'New expense'}
      subtitle={editing ? 'Update payment details' : 'Track a cost or payment'}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-soft">
            Remaining: <span className="font-semibold text-ink">{inr(remaining)}</span>
          </span>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-gold" onClick={submit} disabled={!canSave}>
              {editing ? 'Save' : 'Add expense'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Expense name</label>
          <input
            className="input"
            autoFocus
            value={name}
            placeholder="e.g. Bridal lehenga"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Event</label>
            <select className="input" value={eventKey} onChange={(e) => setEventKey(e.target.value as EventKey)}>
              {EVENTS.map((ev) => (
                <option key={ev.key} value={ev.key}>
                  {ev.emoji} {ev.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Vendor</label>
          <input className="input" value={vendor} placeholder="e.g. Tanishq" onChange={(e) => setVendor(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Total amount (₹)</label>
            <input
              type="number"
              className="input"
              value={amount}
              placeholder="0"
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Paid so far (₹)</label>
            <input
              type="number"
              className="input"
              value={paid}
              placeholder="0"
              onChange={(e) => setPaid(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Payment method</label>
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              {METHODS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            className="input min-h-[60px] resize-none"
            value={notes}
            placeholder="Advance paid, balance on delivery…"
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}
