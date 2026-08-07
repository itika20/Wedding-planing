import { supabase, isCloud } from './supabase'
import { USERS } from '@/data/config'
import type { Activity, Snapshot, Task, User } from './types'

const LS_KEY = 'wedding-dashboard:snapshot:v3'

// A fresh, first-run workspace: no tasks, expenses or activity yet — the couple
// adds their own. Profiles come from config so the picker still works.
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

/* --------------------------- row <-> app mapping ------------------------- */

const taskToRow = (t: Task) => ({
  id: t.id,
  event_key: t.eventKey,
  title: t.title,
  description: t.description,
  assigned_to: t.assignedTo,
  created_by: t.createdBy,
  priority: t.priority,
  status: t.status,
  due_date: t.dueDate,
  completion_pct: t.completionPct,
  checklist: t.checklist,
  budgeted: t.budgeted ?? 0,
  actual: t.actual ?? 0,
  shopping_list: t.shoppingList ?? false,
  created_at: t.createdAt,
  updated_at: t.updatedAt,
  completed_at: t.completedAt,
})
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

const activityToRow = (a: Activity) => ({
  id: a.id,
  user_id: a.userId,
  verb: a.verb,
  summary: a.summary,
  event_key: a.eventKey,
  created_at: a.createdAt,
})
const rowToActivity = (r: any): Activity => ({
  id: r.id,
  userId: r.user_id,
  verb: r.verb,
  summary: r.summary,
  eventKey: r.event_key,
  createdAt: r.created_at,
})

const userToRow = (u: User) => ({
  id: u.id,
  name: u.name,
  role: u.role,
  emoji: u.emoji,
  color: u.color,
  last_active: u.lastActive,
})
const rowToUser = (r: any): User => ({
  id: r.id,
  name: r.name,
  role: r.role,
  emoji: r.emoji,
  color: r.color,
  lastActive: r.last_active,
})

/* ------------------------------- cloud load ------------------------------ */

async function cloudFetchAll(): Promise<Snapshot | null> {
  if (!supabase) return null
  const [t, a, u] = await Promise.all([
    supabase.from('tasks').select('*'),
    supabase.from('activity').select('*'),
    supabase.from('users').select('*'),
  ])
  if (t.error || a.error || u.error) {
    console.warn('[cloud] fetch error', t.error || a.error || u.error)
    return null
  }
  return {
    tasks: (t.data ?? []).map(rowToTask),
    activity: (a.data ?? []).map(rowToActivity),
    users: (u.data ?? []).map(rowToUser),
  }
}

async function cloudSeed(snap: Snapshot): Promise<void> {
  if (!supabase) return
  await supabase.from('users').upsert(snap.users.map(userToRow))
  await supabase.from('tasks').upsert(snap.tasks.map(taskToRow))
  await supabase.from('activity').upsert(snap.activity.map(activityToRow))
}

/* -------------------------------- public API ----------------------------- */

export interface LoadResult {
  snapshot: Snapshot
  mode: 'cloud' | 'local'
  cloudError?: string
}

export async function loadSnapshot(): Promise<LoadResult> {
  if (isCloud && supabase) {
    try {
      let cloud = await cloudFetchAll()
      if (cloud && cloud.users.length === 0 && cloud.tasks.length === 0) {
        // Fresh project — register the profiles once, no sample data.
        const fresh = freshSnapshot()
        await cloudSeed(fresh)
        cloud = fresh
      }
      if (cloud) {
        saveLocal(cloud)
        return { snapshot: cloud, mode: 'cloud' }
      }
      return { snapshot: loadLocal() ?? freshSnapshot(), mode: 'local', cloudError: 'Could not reach Supabase — using local data.' }
    } catch (err: any) {
      return { snapshot: loadLocal() ?? freshSnapshot(), mode: 'local', cloudError: err?.message ?? 'Cloud error' }
    }
  }
  const local = loadLocal()
  if (local) return { snapshot: local, mode: 'local' }
  const fresh = freshSnapshot()
  saveLocal(fresh)
  return { snapshot: fresh, mode: 'local' }
}

// Best-effort single-row cloud writes. Local cache is saved by the store.
export const cloud = {
  enabled: isCloud,
  async upsertTask(t: Task) {
    if (supabase) await supabase.from('tasks').upsert(taskToRow(t))
  },
  async deleteTask(id: string) {
    if (supabase) await supabase.from('tasks').delete().eq('id', id)
  },
  async addActivity(a: Activity) {
    if (supabase) await supabase.from('activity').insert(activityToRow(a))
  },
  async upsertUser(u: User) {
    if (supabase) await supabase.from('users').upsert(userToRow(u))
  },
}

export function subscribeToChanges(onChange: () => void): () => void {
  const client = supabase
  if (!client) return () => {}
  const channel = client
    .channel('wedding-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity' }, onChange)
    .subscribe()
  return () => {
    client.removeChannel(channel)
  }
}
