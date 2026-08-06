import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Session } from '@supabase/supabase-js'
import type { Activity, EventKey, Snapshot, Task, User, WeddingSettings } from '@/lib/types'
import { cloud, loadSnapshot, saveLocal, subscribeToChanges } from '@/lib/db'
import { isCloud, supabase } from '@/lib/supabase'
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
  // Auth (cloud mode only). In local mode `session` stays null and no gate shows.
  requiresAuth: boolean // true when cloud sync is on → sign-in required
  authReady: boolean // initial session check has resolved
  session: Session | null
  authError?: string
  toast: { id: string; message: string; tone: 'success' | 'info' | 'error' } | null

  init: () => Promise<void>
  refresh: () => Promise<void>
  signOut: () => Promise<void>
  completeSetup: (settings: WeddingSettings) => void
  updateSettings: (patch: Partial<WeddingSettings>) => void
  setCurrentUser: (id: string | null) => void
  showToast: (message: string, tone?: 'success' | 'info' | 'error') => void
  dismissToast: () => void

  addTask: (input: Partial<Task> & Pick<Task, 'eventKey' | 'title'>) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  duplicateTask: (id: string) => void
  moveTask: (id: string, status: Task['status']) => void
}

let unsubscribe: (() => void) | null = null
let authListener: { unsubscribe: () => void } | null = null

export const useStore = create<StoreState>((set, get) => {
  const persist = () => {
    const { tasks, activity, users } = get()
    saveLocal({ tasks, activity, users } as Snapshot)
  }

  // Load the snapshot (local, or cloud once authenticated) + wire realtime.
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
    if (mode === 'cloud') {
      unsubscribe?.()
      unsubscribe = subscribeToChanges(() => void get().refresh())
    }
  }

  // With a cloud session in hand: check the family allowlist (best-effort — if
  // the is_family() function / prod policies aren't set up yet, we allow), then
  // load. Keeps a signed-in but non-allowlisted user out with a clear message.
  const enterWithSession = async () => {
    if (supabase) {
      const { data: ok, error } = await supabase.rpc('is_family')
      if (!error && ok === false) {
        await supabase.auth.signOut()
        set({
          session: null,
          authError: 'This account isn’t on the family allowlist. Ask to be added.',
          loading: false,
        })
        return
      }
    }
    set({ authError: undefined })
    await loadData()
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
    session: null,
    toast: null,

    init: async () => {
      set({ loading: true })

      // Local mode: no auth gate — the data is device-private already.
      if (!isCloud || !supabase) {
        set({ authReady: true })
        await loadData()
        return
      }

      // Cloud mode: resolve the session first; the dashboard/data stay gated
      // until an allowlisted family member is signed in.
      const {
        data: { session },
      } = await supabase.auth.getSession()
      set({ session, authReady: true })

      authListener?.unsubscribe()
      authListener = supabase.auth.onAuthStateChange((_event, next) => {
        const had = Boolean(get().session)
        set({ session: next })
        if (next && !had) {
          set({ loading: true })
          void enterWithSession()
        } else if (!next && had) {
          unsubscribe?.()
          set({ tasks: [], activity: [], currentUserId: null, loading: false })
        }
      }).data.subscription

      if (!session) {
        set({ loading: false }) // → App shows the sign-in screen
        return
      }
      await enterWithSession()
    },

    refresh: async () => {
      const { snapshot } = await loadSnapshot()
      set({
        tasks: snapshot.tasks,
        activity: snapshot.activity,
        users: reconcileUsers(snapshot.users),
      })
    },

    signOut: async () => {
      if (supabase) await supabase.auth.signOut()
      localStorage.removeItem(CURRENT_USER_KEY)
      set({ session: null, currentUserId: null })
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
        budgeted: input.budgeted ?? 0,
        actual: input.actual ?? 0,
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
  }
})

export function useCurrentUser(): User | null {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null)
}
