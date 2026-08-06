import type { Task } from './types'

const num = (n?: number | null) => (typeof n === 'number' && isFinite(n) && n > 0 ? n : 0)

export interface ExpenseRoll {
  budgeted: number
  actual: number
  itemized: boolean // true when the figures come from subtasks
}

// A single task's expense.
// Rule: if ANY subtask carries a budget/actual amount, the task's figures are
// the SUM of its subtasks (subtasks override). Otherwise the task-level amounts
// are used. Matches the "subtasks override task amount" behaviour.
export function taskExpense(task: Task): ExpenseRoll {
  const subs = task.checklist ?? []
  const itemized = subs.some((c) => num(c.budgeted) > 0 || num(c.actual) > 0)
  if (itemized) {
    return {
      budgeted: subs.reduce((s, c) => s + num(c.budgeted), 0),
      actual: subs.reduce((s, c) => s + num(c.actual), 0),
      itemized: true,
    }
  }
  return { budgeted: num(task.budgeted), actual: num(task.actual), itemized: false }
}

export function hasExpense(task: Task): boolean {
  const e = taskExpense(task)
  return e.budgeted > 0 || e.actual > 0
}

export interface ExpenseTotals {
  budgeted: number
  actual: number
  variance: number // actual − budgeted (positive = over budget)
  taskCount: number // tasks that carry any expense
}

export function sumExpenses(tasks: Task[]): ExpenseTotals {
  let budgeted = 0
  let actual = 0
  let taskCount = 0
  for (const t of tasks) {
    const e = taskExpense(t)
    if (e.budgeted > 0 || e.actual > 0) taskCount++
    budgeted += e.budgeted
    actual += e.actual
  }
  return { budgeted, actual, variance: actual - budgeted, taskCount }
}
