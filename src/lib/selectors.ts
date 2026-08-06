import type { EventKey, Task } from './types'
import { isOverdue, isDueToday, pct } from './utils'
import { sumExpenses } from './expenses'

export interface EventStats {
  key: EventKey
  totalTasks: number
  completed: number
  inProgress: number
  pending: number // todo + in_progress
  cancelled: number
  overdue: number
  taskProgress: number // % completed of non-cancelled
  budgeted: number // sum of budgeted amounts across this event's tasks
  actual: number // sum of actual amounts
  variance: number // actual − budgeted
  expenseTaskCount: number // tasks with any expense
}

export function eventStats(key: EventKey, tasks: Task[]): EventStats {
  const t = tasks.filter((x) => x.eventKey === key)
  const completed = t.filter((x) => x.status === 'completed').length
  const cancelled = t.filter((x) => x.status === 'cancelled').length
  const inProgress = t.filter((x) => x.status === 'in_progress').length
  const active = t.length - cancelled
  const pending = t.filter((x) => x.status === 'todo' || x.status === 'in_progress').length
  const overdue = t.filter((x) => x.status !== 'completed' && x.status !== 'cancelled' && isOverdue(x.dueDate)).length
  const money = sumExpenses(t)
  return {
    key,
    totalTasks: t.length,
    completed,
    inProgress,
    pending,
    cancelled,
    overdue,
    taskProgress: pct(completed, active),
    budgeted: money.budgeted,
    actual: money.actual,
    variance: money.variance,
    expenseTaskCount: money.taskCount,
  }
}

export interface OverallStats {
  totalTasks: number
  completed: number
  pending: number
  overdue: number
  dueToday: number
  progress: number
  budgeted: number // planned spend across every event
  actual: number // actual spend across every event
  variance: number // actual − budgeted
  expenseTaskCount: number // tasks carrying an expense
}

export function overallStats(tasks: Task[]): OverallStats {
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
  return {
    totalTasks: tasks.length,
    completed,
    pending,
    overdue,
    dueToday,
    progress: pct(completed, active),
    budgeted: money.budgeted,
    actual: money.actual,
    variance: money.variance,
    expenseTaskCount: money.taskCount,
  }
}
