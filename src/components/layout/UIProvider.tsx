import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { TaskModal } from '@/components/tasks/TaskModal'
import type { EventKey, Task, TaskStatus } from '@/lib/types'

interface TaskModalState {
  task?: Task | null
  defaultEvent?: EventKey
  defaultStatus?: TaskStatus
}

interface UICtx {
  openTask: (s?: TaskModalState) => void
}

const Ctx = createContext<UICtx | null>(null)

export function useUI() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUI must be used inside UIProvider')
  return ctx
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [taskState, setTaskState] = useState<TaskModalState | null>(null)

  const openTask = useCallback((s?: TaskModalState) => setTaskState(s ?? {}), [])

  const value = useMemo(() => ({ openTask }), [openTask])

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
    </Ctx.Provider>
  )
}
