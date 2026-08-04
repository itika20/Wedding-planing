import type { EventConfig, EventKey, ExpenseCategory, Priority, TaskStatus } from '@/lib/types'

// ─────────────────────────────────────────────────────────────────────────────
//  👋 MAKE IT YOURS
//  This file is the single place to customize the dashboard for YOUR wedding.
//  Edit the profiles, events, dates and budgets below — everything else (tasks,
//  expenses, progress, charts) is driven by what you set here.
//  Tip: keep each profile `id` stable once people start using it; the `id` is how
//  tasks/expenses remember who created or owns them.
// ─────────────────────────────────────────────────────────────────────────────

// The wedding is the anchor date; everything counts down to it. (YYYY-MM-DD)
export const WEDDING_DATE = '2026-12-06'

// The people planning the wedding. Add, remove or rename freely.
export const USERS = [
  { id: 'you', name: 'You', role: 'Wedding Planner', emoji: '🙋', color: '#D98A7B' },
  { id: 'partner', name: 'Partner', role: 'The Other Half', emoji: '💍', color: '#D4AF37' },
  { id: 'mom', name: 'Mom', role: 'Family', emoji: '👩', color: '#D89CA4' },
  { id: 'dad', name: 'Dad', role: 'Family', emoji: '👨', color: '#8CA98C' },
] as const

export const EVENTS: EventConfig[] = [
  {
    key: 'common',
    name: 'Common Planning',
    emoji: '💍',
    tagline: 'Bookings & vendors shared across every function',
    date: WEDDING_DATE,
    budget: 1800000,
    accent: '#D4AF37',
  },
  {
    key: 'roka',
    name: 'Roka',
    emoji: '🪔',
    tagline: 'The families say yes',
    date: '2026-08-30',
    budget: 250000,
    accent: '#D98A7B',
  },
  {
    key: 'kalipuja',
    name: 'Kali Puja',
    emoji: '🛕',
    tagline: 'Blessings before the celebrations',
    date: '2026-10-19',
    budget: 180000,
    accent: '#B87883',
  },
  {
    key: 'engagement',
    name: 'Engagement',
    emoji: '💐',
    tagline: 'The rings & the ring ceremony',
    date: '2026-11-08',
    budget: 500000,
    accent: '#D89CA4',
  },
  {
    key: 'haldi',
    name: 'Haldi',
    emoji: '🌼',
    tagline: 'Turmeric, music & marigolds',
    date: '2026-12-04',
    budget: 220000,
    accent: '#E0A458',
  },
  {
    key: 'wedding',
    name: 'Wedding',
    emoji: '🎉',
    tagline: 'The big day',
    date: WEDDING_DATE,
    budget: 3500000,
    accent: '#D4AF37',
  },
]

export const EVENT_ORDER: EventKey[] = ['roka', 'kalipuja', 'engagement', 'haldi', 'wedding']

export function getEvent(key: EventKey): EventConfig {
  return EVENTS.find((e) => e.key === key) ?? EVENTS[0]
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Decoration',
  'Food',
  'Photography',
  'Venue',
  'Jewelry',
  'Makeup',
  'Travel',
  'Gifts',
  'Clothing',
  'Music',
  'Miscellaneous',
]

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Decoration: '#D89CA4',
  Food: '#E0A458',
  Photography: '#8CA98C',
  Venue: '#D4AF37',
  Jewelry: '#B87883',
  Makeup: '#D98A7B',
  Travel: '#7BA6C4',
  Gifts: '#C48ABF',
  Clothing: '#C4A87B',
  Music: '#8C9AC4',
  Miscellaneous: '#B0A79E',
}

export const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: '#5F7A5F', bg: '#DDE8DD' },
  medium: { label: 'Medium', color: '#B8912A', bg: '#F6E4CC' },
  high: { label: 'High', color: '#B87883', bg: '#F3D9D3' },
  critical: { label: 'Critical', color: '#C0392B', bg: '#F7DAD5' },
}

export const STATUS_META: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: 'To Do', color: '#6B6259', bg: '#F1EAE3' },
  in_progress: { label: 'In Progress', color: '#B8912A', bg: '#F6E9CC' },
  completed: { label: 'Completed', color: '#5F7A5F', bg: '#DDE8DD' },
  cancelled: { label: 'Cancelled', color: '#9A9088', bg: '#EFE6DD' },
}

export const KANBAN_COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'completed', 'cancelled']
