import { isCloud, api } from './cloud'
import { USERS } from '@/data/config'
import type { Activity, Collections, Snapshot, Task, User, WeddingSettings } from './types'

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
  shopping: Boolean(r.shopping),
  forWhom: r.for_whom ?? undefined,
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
  // Vendors / guests / documents from the server (cloud mode only).
  serverCollections?: Collections
}

function groupCollections(rows: { kind: string; data: any }[] | undefined): Collections {
  const grouped: Collections = { vendors: [], guests: [], documents: [] }
  for (const row of rows ?? []) {
    if (row.kind === 'vendors' || row.kind === 'guests' || row.kind === 'documents') {
      ;(grouped[row.kind] as any[]).push(row.data)
    }
  }
  return grouped
}

export async function loadSnapshot(): Promise<LoadResult> {
  if (isCloud()) {
    const res = await api.snapshot()
    if (res && res !== 'unauth' && 'tasks' in res) {
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
      return {
        snapshot,
        mode: 'cloud',
        serverSettings: (res.settings as WeddingSettings) ?? null,
        serverCollections: groupCollections(res.collections),
      }
    }
    // Server reachable but failed, or unreachable → show last cached data so the
    // app still opens, and surface the real reason when the server gave one.
    let cloudError: string | undefined
    if (res === 'unauth') cloudError = undefined
    else if (res && 'error' in res) cloudError = `Couldn't load from the server: ${res.error}`
    else cloudError = 'Could not reach the server — showing your last saved data.'
    return { snapshot: loadLocal() ?? freshSnapshot(), mode: 'cloud', cloudError }
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
