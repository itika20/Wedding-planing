// Events are user-defined now, so a key is just a stable string id.
// 'common' is the reserved id for the shared cross-event bucket.
export type EventKey = string

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'critical'

export interface User {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  lastActive: string // ISO
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
  checkedBy?: string | null // user id of whoever ticked it
  checkedAt?: string | null // ISO
  budgeted?: number // planned ₹ for this subtask
  actual?: number // actual ₹ spent on this subtask
}

export interface Task {
  id: string
  eventKey: EventKey
  title: string
  description: string
  assignedTo: string | null // user id
  createdBy: string // user id
  priority: Priority
  status: TaskStatus
  dueDate: string | null // ISO date
  completionPct: number // 0..100
  checklist: ChecklistItem[]
  // Task-level expense. Used only when no subtask carries an amount — otherwise
  // the task's expense is the sum of its subtasks (see lib/expenses.ts).
  budgeted?: number // planned ₹ for the whole task
  actual?: number // actual ₹ spent
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface Activity {
  id: string
  userId: string
  verb: string // e.g. "completed", "added"
  summary: string // human readable
  eventKey: EventKey | null
  createdAt: string
}

// A single wedding event/function. User-defined via the setup wizard.
export interface EventMeta {
  id: EventKey
  name: string
  emoji: string
  accent: string // hex
  date: string // ISO date, '' when not set
}

// Wedding-wide settings the user provides on first run.
// Not hardcoded — collected via the setup wizard and stored.
export interface WeddingSettings {
  setupDone: boolean
  weddingDate: string // ISO date — the anchor everything counts down to
  events: EventMeta[] // the user's functions (Common Planning is added implicitly)
}

export interface Snapshot {
  tasks: Task[]
  activity: Activity[]
  users: User[]
}

/* -------- collections (vendors / guests / shopping / documents) -------- */

export type VendorStatus = 'pending' | 'booked' | 'completed' | 'cancelled'
export interface Vendor {
  id: string
  name: string
  category: string
  phone: string
  eventKey: EventKey | '' // optional link to an event ('' = general)
  status: VendorStatus
  notes: string
  createdAt: string
}

export type Rsvp = 'pending' | 'yes' | 'no'
export type GuestSide = 'bride' | 'groom' | 'both'
export interface Guest {
  id: string
  name: string
  side: GuestSide
  count: number // party size (incl. plus-ones)
  rsvp: Rsvp
  notes: string
  createdAt: string
}

export interface ShoppingItem {
  id: string
  name: string
  forWhom: string
  cost: number
  purchased: boolean
  store: string
  notes: string
  createdAt: string
}

export interface DocumentItem {
  id: string
  name: string
  category: string
  link: string // share URL (Drive/Dropbox/etc.)
  notes: string
  createdAt: string
}

export interface Collections {
  vendors: Vendor[]
  guests: Guest[]
  shopping: ShoppingItem[]
  documents: DocumentItem[]
}
