import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Activity, ChecklistItem, EventKey, Snapshot, Task, User, WeddingSettings } from '@/lib/types'
import { cloud, loadSnapshot, saveLocal } from '@/lib/db'
import { isCloud, api } from '@/lib/cloud'
import { loadSettings, saveSettings } from '@/lib/settings'
import { nowISO } from '@/lib/utils'
import { STATUS_META, USERS } from '@/data/config'

const CURRENT_USER_KEY = 'wedding-dashboard:currentUser:v2'

// config.ts is the source of truth for profile identity (name/role/emoji/color).
// Editing USERS there always drives the display; each profile's dynamic lastActive
// is preserved from whatever was stored.
function reconcileUsers(stored: User[]): User[] {
  return USERS.map((u) => {
    const existing = stored.find((s) => s.id === u.id)
    return { ...u, lastActive: existing?.lastActive ?? nowISO() }
  })
}

interface StoreState {
  tasks: Task[]
  activity: Activity[]
  users: User[]
  currentUserId: string | null
  settings: WeddingSettings
  mode: 'cloud' | 'local'
  loading: boolean
  cloudError?: string
  // Auth (cloud mode only). In local mode `authed` stays false and no gate shows.
  requiresAuth: boolean // true when cloud sync is on → passcode required
  authReady: boolean // initial session check has resolved
  authed: boolean // a valid family session cookie is present
  authError?: string
  toast: { id: string; message: string; tone: 'success' | 'info' | 'error' } | null

  init: () => Promise<void>
  refresh: () => Promise<void>
  signIn: (passcode: string) => Promise<boolean>
  signOut: () => Promise<void>
  completeSetup: (settings: WeddingSettings) => void
  updateSettings: (patch: Partial<WeddingSettings>) => void
  setCurrentUser: (id: string | null) => void
  showToast: (message: string, tone?: 'success' | 'info' | 'error') => void
  dismissToast: () => void

  addTask: (input: Partial<Task> & Pick<Task, 'eventKey' | 'title'>, opts?: { silent?: boolean }) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  duplicateTask: (id: string) => void
  moveTask: (id: string, status: Task['status']) => void

  // Subtask-level ops — used by the Shopping view (and anywhere a single subtask
  // must change outside the task modal). All go through updateTask so they
  // persist + sync like any task edit.
  toggleSubtask: (taskId: string, itemId: string) => void
  setSubtask: (taskId: string, itemId: string, patch: Partial<ChecklistItem>) => void
  removeSubtask: (taskId: string, itemId: string) => void
  // Add a purchase from the Shopping view. Reflects into the event's task: an
  // explicit task if given, otherwise the event's auto "Shopping" bucket.
  addShoppingItem: (input: {
    eventKey: EventKey
    taskId?: string
    text: string
    cost?: number // estimated (budgeted)
    actual?: number // what it actually cost (once bought)
    forWhom?: string
    store?: string
    purchased?: boolean
  }) => void
}

// Cloud has no push channel (Neon), so we refetch on window focus and a gentle
// interval to pick up changes made on other family members' devices.
let pollTimer: ReturnType<typeof setInterval> | null = null
let focusHandler: (() => void) | null = null

export const useStore = create<StoreState>((set, get) => {
  const persist = () => {
    const { tasks, activity, users } = get()
    saveLocal({ tasks, activity, users } as Snapshot)
  }

  const loadData = async () => {
    const { snapshot, mode, cloudError } = await loadSnapshot()
    set({
      tasks: snapshot.tasks,
      activity: snapshot.activity,
      users: reconcileUsers(snapshot.users),
      mode,
      cloudError,
      loading: false,
    })
  }

  const startPolling = () => {
    stopPolling()
    focusHandler = () => void get().refresh()
    window.addEventListener('focus', focusHandler)
    pollTimer = setInterval(() => void get().refresh(), 30000)
  }
  const stopPolling = () => {
    if (pollTimer) clearInterval(pollTimer)
    if (focusHandler) window.removeEventListener('focus', focusHandler)
    pollTimer = null
    focusHandler = null
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
    activity: [],
    users: [],
    currentUserId: localStorage.getItem(CURRENT_USER_KEY),
    settings: loadSettings(),
    mode: 'local',
    loading: true,
    requiresAuth: isCloud,
    authReady: false,
    authed: false,
    toast: null,

    init: async () => {
      set({ loading: true })

      // Local mode: no gate — data is device-private already.
      if (!isCloud) {
        set({ authReady: true })
        await loadData()
        return
      }

      // Cloud mode: check for a family session cookie; the dashboard stays gated
      // behind the passcode screen until one is present.
      const ok = await api.session()
      set({ authed: ok, authReady: true })
      if (!ok) {
        set({ loading: false }) // → App shows the passcode screen
        return
      }
      await loadData()
      startPolling()
    },

    refresh: async () => {
      const { snapshot } = await loadSnapshot()
      set({
        tasks: snapshot.tasks,
        activity: snapshot.activity,
        users: reconcileUsers(snapshot.users),
      })
    },

    signIn: async (passcode) => {
      const r = await api.login(passcode)
      if (!r.ok) {
        set({ authError: r.error })
        return false
      }
      set({ authed: true, authError: undefined, loading: true })
      await loadData()
      startPolling()
      return true
    },

    signOut: async () => {
      await api.logout()
      stopPolling()
      localStorage.removeItem(CURRENT_USER_KEY)
      set({ authed: false, currentUserId: null, tasks: [], activity: [] })
    },

    completeSetup: (settings) => {
      const next = { ...settings, setupDone: true }
      saveSettings(next)
      set({ settings: next })
    },

    updateSettings: (patch) => {
      const next = { ...get().settings, ...patch }
      saveSettings(next)
      set({ settings: next })
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

    addTask: (input, opts) => {
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
        budgeted: input.budgeted ?? 0,
        actual: input.actual ?? 0,
        shoppingList: input.shoppingList ?? false,
        createdAt: ts,
        updatedAt: ts,
        completedAt: input.status === 'completed' ? ts : null,
      }
      set((s) => ({ tasks: [task, ...s.tasks] }))
      persist()
      void cloud.upsertTask(task)
      logActivity('created', `created task “${task.title}”`, task.eventKey)
      touchUser()
      if (!opts?.silent) get().showToast('Task added')
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
        // A fresh copy: keep the plan (budgeted) but reset progress and actual
        // spend, and give subtasks new ids so they don't collide with the original.
        actual: 0,
        checklist: t.checklist.map((c) => ({
          ...c,
          id: nanoid(6),
          done: false,
          checkedBy: null,
          checkedAt: null,
          actual: undefined,
        })),
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

    setSubtask: (taskId, itemId, patch) => {
      const t = get().tasks.find((x) => x.id === taskId)
      if (!t) return
      const checklist = t.checklist.map((c) => (c.id === itemId ? { ...c, ...patch } : c))
      get().updateTask(taskId, { checklist })
    },

    toggleSubtask: (taskId, itemId) => {
      const uid = get().currentUserId ?? null
      const t = get().tasks.find((x) => x.id === taskId)
      if (!t) return
      const checklist = t.checklist.map((c) => {
        if (c.id !== itemId) return c
        const done = !c.done
        return { ...c, done, checkedBy: done ? uid : null, checkedAt: done ? nowISO() : null }
      })
      get().updateTask(taskId, { checklist })
    },

    removeSubtask: (taskId, itemId) => {
      const t = get().tasks.find((x) => x.id === taskId)
      if (!t) return
      const checklist = t.checklist.filter((c) => c.id !== itemId)
      // Tidy up: an auto-created Shopping bucket with nothing left is deleted so
      // the board doesn't fill with empty "Shopping" tasks.
      if (checklist.length === 0 && t.shoppingList) {
        get().deleteTask(taskId)
        return
      }
      get().updateTask(taskId, { checklist })
    },

    addShoppingItem: ({ eventKey, taskId, text, cost, actual, forWhom, store, purchased }) => {
      const name = text.trim()
      if (!name) return
      const uid = get().currentUserId ?? null
      const item: ChecklistItem = {
        id: nanoid(6),
        text: name,
        done: Boolean(purchased),
        checkedBy: purchased ? uid : null,
        checkedAt: purchased ? nowISO() : null,
        shopping: true,
        budgeted: cost && cost > 0 ? Math.round(cost) : undefined,
        actual: actual && actual > 0 ? Math.round(actual) : undefined,
        forWhom: forWhom?.trim() || undefined,
        store: store?.trim() || undefined,
      }

      // Attach to the chosen task, or the event's Shopping bucket (create if none).
      const explicit = taskId ? get().tasks.find((t) => t.id === taskId) : undefined
      const target = explicit ?? get().tasks.find((t) => t.eventKey === eventKey && t.shoppingList)
      if (target) {
        get().updateTask(target.id, { checklist: [...target.checklist, item] })
      } else {
        get().addTask({ eventKey, title: 'Shopping', shoppingList: true, checklist: [item] }, { silent: true })
      }
      touchUser()
      get().showToast('Added to shopping')
    },
  }
})

export function useCurrentUser(): User | null {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null)
}
