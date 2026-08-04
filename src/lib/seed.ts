import type { Activity, Expense, Snapshot, Task, User } from './types'
import { USERS } from '@/data/config'
import { nowISO } from './utils'

const now = new Date()
function daysFromNow(d: number): string {
  const x = new Date(now)
  x.setDate(x.getDate() + d)
  return x.toISOString().slice(0, 10)
}
function tsAgo(hours: number): string {
  const x = new Date(now)
  x.setHours(x.getHours() - hours)
  return x.toISOString()
}

let n = 0
const id = (p: string) => `${p}-${(++n).toString().padStart(3, '0')}`

type SeedTask = Partial<Task> & Pick<Task, 'eventKey' | 'title' | 'status'>
function task(t: SeedTask): Task {
  const status = t.status
  return {
    id: id('t'),
    eventKey: t.eventKey,
    title: t.title,
    description: t.description ?? '',
    assignedTo: t.assignedTo ?? null,
    createdBy: t.createdBy ?? 'you',
    priority: t.priority ?? 'medium',
    status,
    dueDate: t.dueDate ?? null,
    completionPct:
      t.completionPct ?? (status === 'completed' ? 100 : status === 'in_progress' ? 45 : 0),
    checklist: t.checklist ?? [],
    createdAt: t.createdAt ?? tsAgo(240),
    updatedAt: t.updatedAt ?? tsAgo(20),
    completedAt: status === 'completed' ? (t.completedAt ?? tsAgo(30)) : null,
  }
}

type SeedExpense = Partial<Expense> & Pick<Expense, 'eventKey' | 'name' | 'category' | 'amount'>
function expense(e: SeedExpense): Expense {
  const amount = e.amount
  const paid = e.paid ?? 0
  const paymentStatus = paid >= amount ? 'paid' : paid > 0 ? 'partial' : 'unpaid'
  return {
    id: id('e'),
    eventKey: e.eventKey,
    name: e.name,
    category: e.category,
    vendor: e.vendor ?? '',
    amount,
    paid,
    paymentStatus,
    paymentMethod: e.paymentMethod ?? 'UPI',
    date: e.date ?? daysFromNow(-10),
    notes: e.notes ?? '',
    createdBy: e.createdBy ?? 'dad',
    createdAt: e.createdAt ?? tsAgo(200),
  }
}

const tasks: Task[] = [
  // COMMON
  task({ eventKey: 'common', title: 'Book banquet hall for wedding', status: 'completed', priority: 'critical', assignedTo: 'dad', dueDate: daysFromNow(-40) }),
  task({ eventKey: 'common', title: 'Shortlist & book photographer', status: 'in_progress', priority: 'high', assignedTo: 'you', dueDate: daysFromNow(6), completionPct: 60, checklist: [ { id: 'c1', text: 'Compare 3 quotes', done: true }, { id: 'c2', text: 'Check sample albums', done: true }, { id: 'c3', text: 'Sign contract', done: false } ] }),
  task({ eventKey: 'common', title: 'Book videographer / cinematography', status: 'in_progress', priority: 'high', assignedTo: 'you', dueDate: daysFromNow(9) }),
  task({ eventKey: 'common', title: 'Finalize invitation card design', status: 'todo', priority: 'high', assignedTo: 'partner', dueDate: daysFromNow(14) }),
  task({ eventKey: 'common', title: 'Block hotel rooms for out-of-town guests', status: 'todo', priority: 'medium', assignedTo: 'dad', dueDate: daysFromNow(20) }),
  task({ eventKey: 'common', title: 'Arrange guest transportation', status: 'todo', priority: 'medium', assignedTo: 'dad', dueDate: daysFromNow(30) }),
  task({ eventKey: 'common', title: 'Book pandit / priest for ceremonies', status: 'completed', priority: 'high', assignedTo: 'mom', dueDate: daysFromNow(-15) }),
  task({ eventKey: 'common', title: 'Order return gifts for guests', status: 'todo', priority: 'low', assignedTo: 'mom', dueDate: daysFromNow(40) }),

  // ROKA
  task({ eventKey: 'roka', title: 'Finalize Roka guest list (close family)', status: 'completed', priority: 'high', assignedTo: 'mom', dueDate: daysFromNow(-8) }),
  task({ eventKey: 'roka', title: 'Book intimate venue / home decor', status: 'completed', priority: 'medium', assignedTo: 'you', dueDate: daysFromNow(-5) }),
  task({ eventKey: 'roka', title: "Order sweets & mithai boxes", status: 'in_progress', priority: 'medium', assignedTo: 'mom', dueDate: daysFromNow(3) }),
  task({ eventKey: 'roka', title: 'Buy outfits for the couple', status: 'in_progress', priority: 'high', assignedTo: 'partner', dueDate: daysFromNow(4) }),
  task({ eventKey: 'roka', title: 'Arrange puja thali & essentials', status: 'todo', priority: 'medium', assignedTo: 'mom', dueDate: daysFromNow(6) }),
  task({ eventKey: 'roka', title: 'Confirm caterer menu', status: 'todo', priority: 'medium', assignedTo: 'dad', dueDate: daysFromNow(5) }),

  // KALI PUJA
  task({ eventKey: 'kalipuja', title: 'Book priest for Kali Puja', status: 'completed', priority: 'high', assignedTo: 'mom' }),
  task({ eventKey: 'kalipuja', title: 'Arrange puja samagri', status: 'todo', priority: 'medium', assignedTo: 'mom', dueDate: daysFromNow(55) }),
  task({ eventKey: 'kalipuja', title: 'Order flowers & garlands', status: 'todo', priority: 'medium', assignedTo: 'you', dueDate: daysFromNow(58) }),
  task({ eventKey: 'kalipuja', title: 'Plan bhog / prasad menu', status: 'todo', priority: 'low', assignedTo: 'mom', dueDate: daysFromNow(60) }),

  // ENGAGEMENT
  task({ eventKey: 'engagement', title: 'Book engagement venue', status: 'in_progress', priority: 'critical', assignedTo: 'dad', dueDate: daysFromNow(12) }),
  task({ eventKey: 'engagement', title: 'Buy engagement rings', status: 'todo', priority: 'critical', assignedTo: 'partner', dueDate: daysFromNow(25) }),
  task({ eventKey: 'engagement', title: 'Book makeup artist', status: 'todo', priority: 'high', assignedTo: 'partner', dueDate: daysFromNow(30) }),
  task({ eventKey: 'engagement', title: 'Finalize decor theme & florist', status: 'todo', priority: 'high', assignedTo: 'you', dueDate: daysFromNow(35) }),
  task({ eventKey: 'engagement', title: 'Book DJ / live music', status: 'todo', priority: 'medium', assignedTo: 'you', dueDate: daysFromNow(40) }),
  task({ eventKey: 'engagement', title: 'Order engagement cake', status: 'todo', priority: 'low', assignedTo: 'mom', dueDate: daysFromNow(60) }),

  // HALDI
  task({ eventKey: 'haldi', title: 'Book Haldi decor (marigold theme)', status: 'todo', priority: 'high', assignedTo: 'you', dueDate: daysFromNow(90) }),
  task({ eventKey: 'haldi', title: 'Finalize mehendi artist', status: 'todo', priority: 'high', assignedTo: 'partner', dueDate: daysFromNow(85) }),
  task({ eventKey: 'haldi', title: 'Buy turmeric & haldi essentials', status: 'todo', priority: 'medium', assignedTo: 'mom', dueDate: daysFromNow(120) }),
  task({ eventKey: 'haldi', title: 'Arrange dhol & speakers', status: 'todo', priority: 'medium', assignedTo: 'you', dueDate: daysFromNow(110) }),
  task({ eventKey: 'haldi', title: 'Order marigold flowers in bulk', status: 'todo', priority: 'medium', assignedTo: 'you', dueDate: daysFromNow(123) }),
  task({ eventKey: 'haldi', title: 'Coordinate yellow dress code outfits', status: 'todo', priority: 'low', assignedTo: 'partner', dueDate: daysFromNow(100) }),

  // WEDDING
  task({ eventKey: 'wedding', title: 'Finalize wedding menu with caterer', status: 'in_progress', priority: 'critical', assignedTo: 'dad', dueDate: daysFromNow(45), completionPct: 30 }),
  task({ eventKey: 'wedding', title: "Order bride's lehenga", status: 'in_progress', priority: 'critical', assignedTo: 'partner', dueDate: daysFromNow(70), completionPct: 50 }),
  task({ eventKey: 'wedding', title: 'Book mandap & stage decor', status: 'todo', priority: 'critical', assignedTo: 'you', dueDate: daysFromNow(80) }),
  task({ eventKey: 'wedding', title: 'Finalize bridal jewelry', status: 'todo', priority: 'high', assignedTo: 'partner', dueDate: daysFromNow(90) }),
  task({ eventKey: 'wedding', title: 'Book baraat band & horse/car', status: 'todo', priority: 'high', assignedTo: 'you', dueDate: daysFromNow(100) }),
  task({ eventKey: 'wedding', title: 'Plan sangeet choreography', status: 'todo', priority: 'medium', assignedTo: 'you', dueDate: daysFromNow(60) }),
  task({ eventKey: 'wedding', title: 'Arrange fireworks / send-off', status: 'todo', priority: 'low', assignedTo: 'dad', dueDate: daysFromNow(130) }),
  task({ eventKey: 'wedding', title: 'Confirm guest accommodation list', status: 'todo', priority: 'medium', assignedTo: 'dad', dueDate: daysFromNow(110) }),
]

const expenses: Expense[] = [
  // COMMON
  expense({ eventKey: 'common', name: 'Banquet hall booking (wedding)', category: 'Venue', vendor: 'The Grand Regency', amount: 900000, paid: 300000, paymentMethod: 'Bank Transfer' }),
  expense({ eventKey: 'common', name: 'Photography package', category: 'Photography', vendor: 'Candid Frames Studio', amount: 250000, paid: 50000 }),
  expense({ eventKey: 'common', name: 'Videography / cinematography', category: 'Photography', vendor: 'Candid Frames Studio', amount: 180000, paid: 0 }),
  expense({ eventKey: 'common', name: 'Invitation cards (400 pcs)', category: 'Miscellaneous', vendor: 'Regal Prints', amount: 60000, paid: 0 }),
  expense({ eventKey: 'common', name: 'Priest / pandit fees', category: 'Miscellaneous', vendor: 'Sharma ji', amount: 45000, paid: 45000 }),
  // ROKA
  expense({ eventKey: 'roka', name: 'Home decoration', category: 'Decoration', vendor: 'Bloom Events', amount: 40000, paid: 40000 }),
  expense({ eventKey: 'roka', name: 'Catering (50 guests)', category: 'Food', vendor: 'Annapurna Caterers', amount: 75000, paid: 20000 }),
  expense({ eventKey: 'roka', name: 'Mithai boxes', category: 'Gifts', vendor: 'Haldiram', amount: 22000, paid: 0 }),
  expense({ eventKey: 'roka', name: "Couple's outfits", category: 'Clothing', vendor: 'Fabindia', amount: 55000, paid: 30000 }),
  // KALI PUJA
  expense({ eventKey: 'kalipuja', name: 'Puja samagri & flowers', category: 'Decoration', vendor: 'Local market', amount: 18000, paid: 0 }),
  expense({ eventKey: 'kalipuja', name: 'Bhog / prasad catering', category: 'Food', vendor: 'Annapurna Caterers', amount: 40000, paid: 0 }),
  // ENGAGEMENT
  expense({ eventKey: 'engagement', name: 'Venue booking', category: 'Venue', vendor: 'Rose Garden Lawns', amount: 200000, paid: 50000 }),
  expense({ eventKey: 'engagement', name: 'Engagement rings', category: 'Jewelry', vendor: 'Tanishq', amount: 180000, paid: 0 }),
  expense({ eventKey: 'engagement', name: 'Makeup artist', category: 'Makeup', vendor: 'Glam by Ria', amount: 35000, paid: 0 }),
  expense({ eventKey: 'engagement', name: 'Floral decor', category: 'Decoration', vendor: 'Bloom Events', amount: 90000, paid: 0 }),
  // HALDI
  expense({ eventKey: 'haldi', name: 'Marigold decor', category: 'Decoration', vendor: 'Bloom Events', amount: 60000, paid: 0 }),
  expense({ eventKey: 'haldi', name: 'Mehendi artist', category: 'Makeup', vendor: 'Henna Tales', amount: 30000, paid: 0 }),
  expense({ eventKey: 'haldi', name: 'Dhol & sound', category: 'Music', vendor: 'Beat Box', amount: 25000, paid: 0 }),
  // WEDDING
  expense({ eventKey: 'wedding', name: 'Catering (400 guests)', category: 'Food', vendor: 'Annapurna Caterers', amount: 1200000, paid: 200000, paymentMethod: 'Bank Transfer' }),
  expense({ eventKey: 'wedding', name: "Bride's lehenga", category: 'Clothing', vendor: 'Sabyasachi (studio)', amount: 450000, paid: 150000 }),
  expense({ eventKey: 'wedding', name: 'Bridal jewelry set', category: 'Jewelry', vendor: 'Tanishq', amount: 800000, paid: 0 }),
  expense({ eventKey: 'wedding', name: 'Mandap & stage decor', category: 'Decoration', vendor: 'Bloom Events', amount: 350000, paid: 0 }),
  expense({ eventKey: 'wedding', name: 'DJ & live band', category: 'Music', vendor: 'Soundwave', amount: 120000, paid: 30000 }),
]

const activity: Activity[] = [
  { id: id('a'), userId: 'dad', verb: 'completed', summary: 'completed "Book banquet hall for wedding"', eventKey: 'common', createdAt: tsAgo(5) },
  { id: id('a'), userId: 'you', verb: 'added', summary: 'added a ₹50,000 payment to Photography package', eventKey: 'common', createdAt: tsAgo(9) },
  { id: id('a'), userId: 'partner', verb: 'created', summary: 'created task "Order bride\'s lehenga"', eventKey: 'wedding', createdAt: tsAgo(22) },
  { id: id('a'), userId: 'mom', verb: 'completed', summary: 'completed "Book pandit / priest for ceremonies"', eventKey: 'common', createdAt: tsAgo(30) },
  { id: id('a'), userId: 'you', verb: 'moved', summary: 'moved "Shortlist & book photographer" to In Progress', eventKey: 'common', createdAt: tsAgo(48) },
  { id: id('a'), userId: 'mom', verb: 'completed', summary: 'completed "Finalize Roka guest list"', eventKey: 'roka', createdAt: tsAgo(54) },
]

export function buildSeed(): Snapshot {
  const users: User[] = USERS.map((u, i) => ({
    ...u,
    lastActive: tsAgo(i * 6 + 1),
  }))
  return { tasks, expenses, activity, users }
}

export const SEED_VERSION = 'v1'
