import type { Task, Vendor } from './types'

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

// How to present the budget-vs-actual gap. Handles the "spent but no budget set"
// case so we never say "over budget" (or "no costs") when there's actual spend
// and no budget to compare against.
export function varianceView(budgeted: number, actual: number): {
  label: string
  amount: number
  over: boolean // true = show in the "attention" (clay) tone
  noBudget: boolean
  hint: string
} {
  if (budgeted === 0) {
    if (actual === 0) return { label: 'On budget', amount: 0, over: false, noBudget: true, hint: 'Nothing logged yet' }
    return { label: 'Unbudgeted', amount: actual, over: true, noBudget: true, hint: 'Spent with no budget set' }
  }
  const variance = actual - budgeted
  if (variance === 0) return { label: 'On budget', amount: 0, over: false, noBudget: false, hint: 'Right on budget' }
  const over = variance > 0
  return { label: over ? 'Over budget' : 'Under budget', amount: Math.abs(variance), over, noBudget: false, hint: over ? 'Above planned' : 'Below planned' }
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

// A single vendor's expense: its quoted cost (budgeted) and amount paid (actual).
export function vendorExpense(v: Vendor): { budgeted: number; actual: number } {
  return { budgeted: num(v.budgeted), actual: num(v.actual) }
}

// Vendor costs rolled up. `taskCount` here is the number of vendors carrying a cost.
export function sumVendorExpenses(vendors: Vendor[]): ExpenseTotals {
  let budgeted = 0
  let actual = 0
  let count = 0
  for (const v of vendors) {
    const e = vendorExpense(v)
    if (e.budgeted > 0 || e.actual > 0) count++
    budgeted += e.budgeted
    actual += e.actual
  }
  return { budgeted, actual, variance: actual - budgeted, taskCount: count }
}
