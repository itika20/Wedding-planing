export type EventKey =
  | 'common'
  | 'roka'
  | 'kalipuja'
  | 'engagement'
  | 'haldi'
  | 'wedding'

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export type ExpenseCategory =
  | 'Decoration'
  | 'Food'
  | 'Photography'
  | 'Venue'
  | 'Jewelry'
  | 'Makeup'
  | 'Travel'
  | 'Gifts'
  | 'Clothing'
  | 'Music'
  | 'Miscellaneous'

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
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface Expense {
  id: string
  eventKey: EventKey
  name: string
  category: ExpenseCategory
  vendor: string
  amount: number
  paid: number
  paymentStatus: PaymentStatus
  paymentMethod: string
  date: string // ISO date
  notes: string
  createdBy: string
  createdAt: string
}

export interface Activity {
  id: string
  userId: string
  verb: string // e.g. "completed", "added"
  summary: string // human readable
  eventKey: EventKey | null
  createdAt: string
}

export interface EventConfig {
  key: EventKey
  name: string
  emoji: string
  tagline: string
  date: string // ISO date
  budget: number
  accent: string // hex
}

export interface Snapshot {
  tasks: Task[]
  expenses: Expense[]
  activity: Activity[]
  users: User[]
}
