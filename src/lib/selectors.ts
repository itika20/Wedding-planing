import type { EventKey, Expense, Task } from './types'
import { EVENTS, getEvent } from '@/data/config'
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
  budget: number
  spent: number // sum paid
  committed: number // sum amount (total cost)
  budgetUsed: number // % of budget committed
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
  const spent = e.reduce((sum, x) => sum + x.paid, 0)
  const committed = e.reduce((sum, x) => sum + x.amount, 0)
  const budget = getEvent(key).budget
  return {
    key,
    totalTasks: t.length,
    completed,
    inProgress,
    pending,
    cancelled,
    overdue,
    taskProgress: pct(completed, active),
    budget,
    spent,
    committed,
    budgetUsed: pct(committed, budget),
  }
}

export interface OverallStats {
  totalTasks: number
  completed: number
  pending: number
  overdue: number
  dueToday: number
  progress: number
  totalBudget: number
  spent: number
  committed: number
  remaining: number
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
  const totalBudget = EVENTS.reduce((s, e) => s + e.budget, 0)
  const spent = expenses.reduce((s, e) => s + e.paid, 0)
  const committed = expenses.reduce((s, e) => s + e.amount, 0)
  return {
    totalTasks: tasks.length,
    completed,
    pending,
    overdue,
    dueToday,
    progress: pct(completed, active),
    totalBudget,
    spent,
    committed,
    remaining: totalBudget - spent,
  }
}
