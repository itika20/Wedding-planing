import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { TaskModal } from '@/components/tasks/TaskModal'
import { ExpenseModal } from '@/components/expenses/ExpenseModal'
import type { EventKey, Expense, Task, TaskStatus } from '@/lib/types'

interface TaskModalState {
  task?: Task | null
  defaultEvent?: EventKey
  defaultStatus?: TaskStatus
}
interface ExpenseModalState {
  expense?: Expense | null
  defaultEvent?: EventKey
}

interface UICtx {
  openTask: (s?: TaskModalState) => void
  openExpense: (s?: ExpenseModalState) => void
}

const Ctx = createContext<UICtx | null>(null)

export function useUI() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUI must be used inside UIProvider')
  return ctx
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [taskState, setTaskState] = useState<TaskModalState | null>(null)
  const [expenseState, setExpenseState] = useState<ExpenseModalState | null>(null)

  const openTask = useCallback((s?: TaskModalState) => setTaskState(s ?? {}), [])
  const openExpense = useCallback((s?: ExpenseModalState) => setExpenseState(s ?? {}), [])

  const value = useMemo(() => ({ openTask, openExpense }), [openTask, openExpense])

  return (
    <Ctx.Provider value={value}>
      {children}
      <TaskModal
        open={taskState !== null}
        onClose={() => setTaskState(null)}
        task={taskState?.task}
        defaultEvent={taskState?.defaultEvent}
        defaultStatus={taskState?.defaultStatus}
      />
      <ExpenseModal
        open={expenseState !== null}
        onClose={() => setExpenseState(null)}
        expense={expenseState?.expense}
        defaultEvent={expenseState?.defaultEvent}
      />
    </Ctx.Provider>
  )
}
