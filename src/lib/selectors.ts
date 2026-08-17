import type { EventKey, Task, Vendor } from './types'
import { isOverdue, isDueToday, pct } from './utils'
import { sumExpenses, sumVendorExpenses } from './expenses'

export interface EventStats {
  key: EventKey
  totalTasks: number
  completed: number
  inProgress: number
  pending: number // todo + in_progress
  cancelled: number
  overdue: number
  taskProgress: number // % completed of non-cancelled
  budgeted: number // budgeted across this event's tasks + vendors
  actual: number // actual spend across this event's tasks + vendors
  variance: number // actual − budgeted
  expenseTaskCount: number // tasks with any expense
  vendorCount: number // vendors (in this event) carrying a cost
}

// Vendor money is folded into the budgeted/actual figures. Vendors tied to no
// event ('') only surface in overallStats, never in a per-event roll-up.
export function eventStats(key: EventKey, tasks: Task[], vendors: Vendor[] = []): EventStats {
  const t = tasks.filter((x) => x.eventKey === key)
  const v = vendors.filter((x) => x.eventKey === key)
  const completed = t.filter((x) => x.status === 'completed').length
  const cancelled = t.filter((x) => x.status === 'cancelled').length
  const inProgress = t.filter((x) => x.status === 'in_progress').length
  const active = t.length - cancelled
  const pending = t.filter((x) => x.status === 'todo' || x.status === 'in_progress').length
  const overdue = t.filter((x) => x.status !== 'completed' && x.status !== 'cancelled' && isOverdue(x.dueDate)).length
  const money = sumExpenses(t)
  const vend = sumVendorExpenses(v)
  const budgeted = money.budgeted + vend.budgeted
  const actual = money.actual + vend.actual
  return {
    key,
    totalTasks: t.length,
    completed,
    inProgress,
    pending,
    cancelled,
    overdue,
    taskProgress: pct(completed, active),
    budgeted,
    actual,
    variance: actual - budgeted,
    expenseTaskCount: money.taskCount,
    vendorCount: vend.taskCount,
  }
}

export interface OverallStats {
  totalTasks: number
  completed: number
  todo: number
  inProgress: number
  pending: number
  overdue: number
  dueToday: number
  progress: number
  budgeted: number // planned spend across every event (tasks + vendors)
  actual: number // actual spend across every event (tasks + vendors)
  variance: number // actual − budgeted
  expenseTaskCount: number // tasks carrying an expense
  vendorCount: number // vendors carrying a cost
}

export function overallStats(tasks: Task[], vendors: Vendor[] = []): OverallStats {
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
  const money = sumExpenses(tasks)
  const vend = sumVendorExpenses(vendors)
  const budgeted = money.budgeted + vend.budgeted
  const actual = money.actual + vend.actual
  return {
    totalTasks: tasks.length,
    completed,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    pending,
    overdue,
    dueToday,
    progress: pct(completed, active),
    budgeted,
    actual,
    variance: actual - budgeted,
    expenseTaskCount: money.taskCount,
    vendorCount: vend.taskCount,
  }
}
