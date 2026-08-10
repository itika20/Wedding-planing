// Neon data access, used only by the serverless API functions (never the browser).
// The frontend maps these rows to its domain types (see src/lib/db.ts).
import { neon } from '@neondatabase/serverless'

// Lazy: build the query function per request. neon() is a cheap one-shot HTTP
// query (no pool), and doing it here — not at module load — means a missing
// DATABASE_URL returns a clean error instead of crashing the whole function.
function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set on the server')
  return neon(url)
}

export async function fetchSnapshot() {
  const sql = getSql()
  const [tasks, activity, users] = await Promise.all([
    sql`select * from tasks`,
    sql`select * from activity order by created_at desc limit 300`,
    sql`select * from users`,
  ])
  // Settings and collections are queried separately and tolerantly — an older
  // deploy might not have those tables yet, and that shouldn't block everything.
  let settings: any = null
  try {
    const rows = await sql`select data from app_settings where id = 'app'`
    settings = rows[0]?.data ?? null
  } catch {
    /* app_settings table not created yet — run neon/schema.sql */
  }

  let collections: any[] = []
  try {
    collections = await sql`select id, kind, data from collections`
  } catch {
    /* collections table not created yet — run neon/schema.sql */
  }

  return { tasks, activity, users, settings, collections }
}

export async function upsertCollection(kind: string, item: Record<string, any>) {
  const sql = getSql()
  await sql`
    insert into collections (id, kind, data)
    values (${item.id}, ${kind}, ${JSON.stringify(item)}::jsonb)
    on conflict (id) do update set kind = excluded.kind, data = excluded.data
  `
}

export async function deleteCollection(id: string) {
  const sql = getSql()
  await sql`delete from collections where id = ${id}`
}

export async function saveSettings(data: Record<string, any>) {
  const sql = getSql()
  await sql`
    insert into app_settings (id, data, updated_at)
    values ('app', ${JSON.stringify(data)}::jsonb, now())
    on conflict (id) do update set data = excluded.data, updated_at = now()
  `
}

type AnyTask = Record<string, any>
type AnyActivity = Record<string, any>
type AnyUser = Record<string, any>

export async function upsertTask(t: AnyTask) {
  const sql = getSql()
  await sql`
    insert into tasks
      (id, event_key, title, description, assigned_to, created_by, priority, status,
       due_date, completion_pct, checklist, budgeted, actual, shopping_list,
       created_at, updated_at, completed_at)
    values
      (${t.id}, ${t.eventKey}, ${t.title}, ${t.description ?? ''}, ${t.assignedTo ?? null},
       ${t.createdBy ?? null}, ${t.priority ?? 'medium'}, ${t.status ?? 'todo'},
       ${t.dueDate ?? null}, ${t.completionPct ?? 0}, ${JSON.stringify(t.checklist ?? [])}::jsonb,
       ${t.budgeted ?? 0}, ${t.actual ?? 0}, ${t.shoppingList ?? false},
       ${t.createdAt}, ${t.updatedAt}, ${t.completedAt ?? null})
    on conflict (id) do update set
      event_key      = excluded.event_key,
      title          = excluded.title,
      description    = excluded.description,
      assigned_to    = excluded.assigned_to,
      priority       = excluded.priority,
      status         = excluded.status,
      due_date       = excluded.due_date,
      completion_pct = excluded.completion_pct,
      checklist      = excluded.checklist,
      budgeted       = excluded.budgeted,
      actual         = excluded.actual,
      shopping_list  = excluded.shopping_list,
      updated_at     = excluded.updated_at,
      completed_at   = excluded.completed_at
  `
}

export async function deleteTask(id: string) {
  const sql = getSql()
  await sql`delete from tasks where id = ${id}`
}

export async function addActivity(a: AnyActivity) {
  const sql = getSql()
  await sql`
    insert into activity (id, user_id, verb, summary, event_key, created_at)
    values (${a.id}, ${a.userId ?? null}, ${a.verb ?? null}, ${a.summary ?? null}, ${a.eventKey ?? null}, ${a.createdAt})
    on conflict (id) do nothing
  `
}

export async function upsertUser(u: AnyUser) {
  const sql = getSql()
  await sql`
    insert into users (id, name, role, emoji, color, last_active)
    values (${u.id}, ${u.name}, ${u.role ?? null}, ${u.emoji ?? null}, ${u.color ?? null}, ${u.lastActive})
    on conflict (id) do update set
      name        = excluded.name,
      role        = excluded.role,
      emoji       = excluded.emoji,
      color       = excluded.color,
      last_active = excluded.last_active
  `
}
