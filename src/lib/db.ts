import { isCloud, api } from './cloud'
import { USERS } from '@/data/config'
import type { Activity, Snapshot, Task, User, WeddingSettings } from './types'

const LS_KEY = 'wedding-dashboard:snapshot:v3'

// A fresh, first-run workspace: no tasks or activity yet — the family adds their
// own. Profiles come from config so the picker works immediately.
function freshSnapshot(): Snapshot {
  const now = new Date().toISOString()
  return {
    tasks: [],
    activity: [],
    users: USERS.map((u) => ({ ...u, lastActive: now })),
  }
}

/* ----------------------------- local storage ---------------------------- */

export function loadLocal(): Snapshot | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Snapshot) : null
  } catch {
    return null
  }
}

export function saveLocal(s: Snapshot): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s))
  } catch {
    /* ignore quota errors */
  }
}

/* --------------------------- row -> app mapping -------------------------- */

const rowToTask = (r: any): Task => ({
  id: r.id,
  eventKey: r.event_key,
  title: r.title,
  description: r.description ?? '',
  assignedTo: r.assigned_to,
  createdBy: r.created_by,
  priority: r.priority,
  status: r.status,
  dueDate: r.due_date,
  completionPct: r.completion_pct ?? 0,
  checklist: r.checklist ?? [],
  budgeted: Number(r.budgeted) || 0,
  actual: Number(r.actual) || 0,
  shoppingList: Boolean(r.shopping_list),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  completedAt: r.completed_at,
})

const rowToActivity = (r: any): Activity => ({
  id: r.id,
  userId: r.user_id,
  verb: r.verb,
  summary: r.summary,
  eventKey: r.event_key,
  createdAt: r.created_at,
})

const rowToUser = (r: any): User => ({
  id: r.id,
  name: r.name,
  role: r.role,
  emoji: r.emoji,
  color: r.color,
  lastActive: r.last_active,
})

/* -------------------------------- public API ----------------------------- */

export interface LoadResult {
  snapshot: Snapshot
  mode: 'cloud' | 'local'
  cloudError?: string
  // The shared wedding settings (date + events) from the server, when cloud is on
  // and someone has already completed setup. null = not set yet on the server.
  serverSettings?: WeddingSettings | null
}

export async function loadSnapshot(): Promise<LoadResult> {
  if (isCloud()) {
    const res = await api.snapshot()
    if (res && res !== 'unauth') {
      let users = (res.users ?? []).map(rowToUser)
      // First run against a fresh database — register the family profiles once.
      if (users.length === 0) {
        const fresh = freshSnapshot()
        for (const u of fresh.users) await api.mutate('upsertUser', u)
        users = fresh.users
      }
      const snapshot: Snapshot = {
        tasks: (res.tasks ?? []).map(rowToTask),
        activity: (res.activity ?? []).map(rowToActivity),
        users,
      }
      saveLocal(snapshot)
      return { snapshot, mode: 'cloud', serverSettings: (res.settings as WeddingSettings) ?? null }
    }
    // Server unreachable → show the last cached data so the app still opens.
    return {
      snapshot: loadLocal() ?? freshSnapshot(),
      mode: 'cloud',
      cloudError: res === 'unauth' ? undefined : 'Could not reach the server — showing your last saved data.',
    }
  }

  const local = loadLocal()
  if (local) return { snapshot: local, mode: 'local' }
  const fresh = freshSnapshot()
  saveLocal(fresh)
  return { snapshot: fresh, mode: 'local' }
}

export function saveSettingsCloud(settings: WeddingSettings): void {
  if (isCloud()) void api.mutate('saveSettings', settings)
}

// Best-effort single-row writes. The store already updated local state and cache.
export const cloud = {
  get enabled() {
    return isCloud()
  },
  async upsertTask(t: Task) {
    if (isCloud()) await api.mutate('upsertTask', t)
  },
  async deleteTask(id: string) {
    if (isCloud()) await api.mutate('deleteTask', { id })
  },
  async addActivity(a: Activity) {
    if (isCloud()) await api.mutate('addActivity', a)
  },
  async upsertUser(u: User) {
    if (isCloud()) await api.mutate('upsertUser', u)
  },
}

// Neon has no realtime channel; the store refetches on focus + a gentle interval.
export function subscribeToChanges(): () => void {
  return () => {}
}
