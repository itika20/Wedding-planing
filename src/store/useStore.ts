import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Activity, EventKey, Expense, Snapshot, Task, User } from '@/lib/types'
import { cloud, loadSnapshot, saveLocal, subscribeToChanges } from '@/lib/db'
import { nowISO } from '@/lib/utils'
import { STATUS_META } from '@/data/config'

const CURRENT_USER_KEY = 'wedding-dashboard:currentUser:v2'

interface StoreState {
  tasks: Task[]
  expenses: Expense[]
  activity: Activity[]
  users: User[]
  currentUserId: string | null
  mode: 'cloud' | 'local'
  loading: boolean
  cloudError?: string
  toast: { id: string; message: string; tone: 'success' | 'info' | 'error' } | null

  init: () => Promise<void>
  refresh: () => Promise<void>
  setCurrentUser: (id: string | null) => void
  showToast: (message: string, tone?: 'success' | 'info' | 'error') => void
  dismissToast: () => void

  addTask: (input: Partial<Task> & Pick<Task, 'eventKey' | 'title'>) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  duplicateTask: (id: string) => void
  moveTask: (id: string, status: Task['status']) => void

  addExpense: (input: Partial<Expense> & Pick<Expense, 'eventKey' | 'name' | 'amount' | 'category'>) => Expense
  updateExpense: (id: string, patch: Partial<Expense>) => void
  deleteExpense: (id: string) => void
}

let unsubscribe: (() => void) | null = null

export const useStore = create<StoreState>((set, get) => {
  const persist = () => {
    const { tasks, expenses, activity, users } = get()
    saveLocal({ tasks, expenses, activity, users } as Snapshot)
  }

  const logActivity = (verb: string, summary: string, eventKey: EventKey | null) => {
    const uid = get().currentUserId ?? 'you'
    const entry: Activity = {
      id: nanoid(8),
      userId: uid,
      verb,
      summary,
      eventKey,
      createdAt: nowISO(),
    }
    set((s) => ({ activity: [entry, ...s.activity].slice(0, 200) }))
    void cloud.addActivity(entry)
  }

  const touchUser = () => {
    const uid = get().currentUserId
    if (!uid) return
    const ts = nowISO()
    set((s) => ({ users: s.users.map((u) => (u.id === uid ? { ...u, lastActive: ts } : u)) }))
    const u = get().users.find((x) => x.id === uid)
    if (u) void cloud.upsertUser(u)
  }

  return {
    tasks: [],
    expenses: [],
    activity: [],
    users: [],
    currentUserId: localStorage.getItem(CURRENT_USER_KEY),
    mode: 'local',
    loading: true,
    toast: null,

    init: async () => {
      set({ loading: true })
      const { snapshot, mode, cloudError } = await loadSnapshot()
      set({
        tasks: snapshot.tasks,
        expenses: snapshot.expenses,
        activity: snapshot.activity,
        users: snapshot.users,
        mode,
        cloudError,
        loading: false,
      })
      if (mode === 'cloud') {
        unsubscribe?.()
        unsubscribe = subscribeToChanges(() => void get().refresh())
      }
    },

    refresh: async () => {
      const { snapshot } = await loadSnapshot()
      set({
        tasks: snapshot.tasks,
        expenses: snapshot.expenses,
        activity: snapshot.activity,
        users: snapshot.users,
      })
    },

    setCurrentUser: (id) => {
      if (id) localStorage.setItem(CURRENT_USER_KEY, id)
      else localStorage.removeItem(CURRENT_USER_KEY)
      set({ currentUserId: id })
      if (id) {
        const ts = nowISO()
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, lastActive: ts } : u)) }))
        const u = get().users.find((x) => x.id === id)
        if (u) void cloud.upsertUser(u)
        persist()
      }
    },

    showToast: (message, tone = 'success') => {
      const id = nanoid(6)
      set({ toast: { id, message, tone } })
      setTimeout(() => {
        if (get().toast?.id === id) set({ toast: null })
      }, 3200)
    },
    dismissToast: () => set({ toast: null }),

    addTask: (input) => {
      const uid = get().currentUserId ?? 'you'
      const ts = nowISO()
      const task: Task = {
        id: nanoid(10),
        eventKey: input.eventKey,
        title: input.title,
        description: input.description ?? '',
        assignedTo: input.assignedTo ?? null,
        createdBy: uid,
        priority: input.priority ?? 'medium',
        status: input.status ?? 'todo',
        dueDate: input.dueDate ?? null,
        completionPct: input.completionPct ?? 0,
        checklist: input.checklist ?? [],
        createdAt: ts,
        updatedAt: ts,
        completedAt: input.status === 'completed' ? ts : null,
      }
      set((s) => ({ tasks: [task, ...s.tasks] }))
      persist()
      void cloud.upsertTask(task)
      logActivity('created', `created task “${task.title}”`, task.eventKey)
      touchUser()
      get().showToast('Task added')
      return task
    },

    updateTask: (id, patch) => {
      let updated: Task | undefined
      const prev = get().tasks.find((t) => t.id === id)
      set((s) => ({
        tasks: s.tasks.map((t) => {
          if (t.id !== id) return t
          const next: Task = { ...t, ...patch, updatedAt: nowISO() }
          if (patch.status === 'completed' && t.status !== 'completed') {
            next.completedAt = nowISO()
            next.completionPct = 100
          }
          if (patch.status && patch.status !== 'completed') next.completedAt = null
          updated = next
          return next
        }),
      }))
      persist()
      if (updated) {
        void cloud.upsertTask(updated)
        if (patch.status && prev && patch.status !== prev.status) {
          if (patch.status === 'completed') {
            logActivity('completed', `completed “${updated.title}”`, updated.eventKey)
          } else {
            logActivity('moved', `moved “${updated.title}” to ${STATUS_META[patch.status].label}`, updated.eventKey)
          }
        }
      }
      touchUser()
    },

    deleteTask: (id) => {
      const t = get().tasks.find((x) => x.id === id)
      set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) }))
      persist()
      void cloud.deleteTask(id)
      if (t) logActivity('deleted', `deleted task “${t.title}”`, t.eventKey)
      get().showToast('Task deleted', 'info')
    },

    duplicateTask: (id) => {
      const t = get().tasks.find((x) => x.id === id)
      if (!t) return
      const ts = nowISO()
      const copy: Task = {
        ...t,
        id: nanoid(10),
        title: `${t.title} (copy)`,
        status: 'todo',
        completionPct: 0,
        completedAt: null,
        createdAt: ts,
        updatedAt: ts,
      }
      set((s) => ({ tasks: [copy, ...s.tasks] }))
      persist()
      void cloud.upsertTask(copy)
      get().showToast('Task duplicated')
    },

    moveTask: (id, status) => {
      get().updateTask(id, { status })
    },

    addExpense: (input) => {
      const uid = get().currentUserId ?? 'you'
      const amount = input.amount
      const paid = input.paid ?? 0
      const expense: Expense = {
        id: nanoid(10),
        eventKey: input.eventKey,
        name: input.name,
        category: input.category,
        vendor: input.vendor ?? '',
        amount,
        paid,
        paymentStatus: paid >= amount ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
        paymentMethod: input.paymentMethod ?? 'UPI',
        date: input.date ?? nowISO().slice(0, 10),
        notes: input.notes ?? '',
        createdBy: uid,
        createdAt: nowISO(),
      }
      set((s) => ({ expenses: [expense, ...s.expenses] }))
      persist()
      void cloud.upsertExpense(expense)
      logActivity('added', `added expense “${expense.name}” (₹${amount.toLocaleString('en-IN')})`, expense.eventKey)
      touchUser()
      get().showToast('Expense added')
      return expense
    },

    updateExpense: (id, patch) => {
      let updated: Expense | undefined
      set((s) => ({
        expenses: s.expenses.map((e) => {
          if (e.id !== id) return e
          const next: Expense = { ...e, ...patch }
          next.paymentStatus = next.paid >= next.amount ? 'paid' : next.paid > 0 ? 'partial' : 'unpaid'
          updated = next
          return next
        }),
      }))
      persist()
      if (updated) void cloud.upsertExpense(updated)
      touchUser()
    },

    deleteExpense: (id) => {
      const e = get().expenses.find((x) => x.id === id)
      set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) }))
      persist()
      void cloud.deleteExpense(id)
      if (e) logActivity('removed', `removed expense “${e.name}”`, e.eventKey)
      get().showToast('Expense deleted', 'info')
    },
  }
})

export function useCurrentUser(): User | null {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null)
}
