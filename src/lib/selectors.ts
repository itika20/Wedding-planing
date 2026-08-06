import type { EventKey, Expense, Task } from './types'
import { isOverdue, isDueToday, pct } from './utils'

export interface EventStats {
  key: EventKey
  totalTasks: number
  completed: number
  inProgress: number
  pending: number // todo + in_progress
  cancelled: number
  overdue: number
  taskProgress: number // % completed of non-cancelled
  total: number // sum of expense amounts for this event
  paid: number // sum of amounts paid
  due: number // total - paid
}

export function eventStats(key: EventKey, tasks: Task[], expenses: Expense[]): EventStats {
  const t = tasks.filter((x) => x.eventKey === key)
  const e = expenses.filter((x) => x.eventKey === key)
  const completed = t.filter((x) => x.status === 'completed').length
  const cancelled = t.filter((x) => x.status === 'cancelled').length
  const inProgress = t.filter((x) => x.status === 'in_progress').length
  const active = t.length - cancelled
  const pending = t.filter((x) => x.status === 'todo' || x.status === 'in_progress').length
  const overdue = t.filter((x) => x.status !== 'completed' && x.status !== 'cancelled' && isOverdue(x.dueDate)).length
  const total = e.reduce((sum, x) => sum + x.amount, 0)
  const paid = e.reduce((sum, x) => sum + x.paid, 0)
  return {
    key,
    totalTasks: t.length,
    completed,
    inProgress,
    pending,
    cancelled,
    overdue,
    taskProgress: pct(completed, active),
    total,
    paid,
    due: total - paid,
  }
}

export interface OverallStats {
  totalTasks: number
  completed: number
  pending: number
  overdue: number
  dueToday: number
  progress: number
  totalExpense: number // sum of all expense amounts, across every event
  paid: number
  due: number
  expenseCount: number
}

export function overallStats(tasks: Task[], expenses: Expense[]): OverallStats {
  const cancelled = tasks.filter((t) => t.status === 'cancelled').length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const active = tasks.length - cancelled
  const pending = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress').length
  const overdue = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled' && isOverdue(t.dueDate),
  ).length
  const dueToday = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled' && isDueToday(t.dueDate),
  ).length
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
  const paid = expenses.reduce((s, e) => s + e.paid, 0)
  return {
    totalTasks: tasks.length,
    completed,
    pending,
    overdue,
    dueToday,
    progress: pct(completed, active),
    totalExpense,
    paid,
    due: totalExpense - paid,
    expenseCount: expenses.length,
  }
}
