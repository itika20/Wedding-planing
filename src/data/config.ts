import type { ExpenseCategory, Priority, TaskStatus } from '@/lib/types'

// ─────────────────────────────────────────────────────────────────────────────
//  👋 MAKE IT YOURS
//  This file defines who's planning. The events themselves (and their dates) are
//  added/removed by the user in the first-run setup wizard and stored
//  (see src/lib/settings.ts and src/lib/events.ts). There are no budgets.
//  Tip: keep each profile `id` stable once in use; tasks & expenses remember
//  which owner they belong to by that id.
// ─────────────────────────────────────────────────────────────────────────────

// The people planning the wedding. Add, remove or rename freely.
export const USERS = [
  { id: 'you', name: 'Big I', role: 'The Bride', emoji: '👰', color: '#D4AF37' },
  { id: 'partner', name: 'Small I', role: "Bride's Sister", emoji: '🙋‍♀️', color: '#D98A7B' },
  { id: 'mom', name: 'Mummy', role: 'Family', emoji: '👩', color: '#D89CA4' },
  { id: 'dad', name: 'Papa', role: 'Family', emoji: '👨', color: '#8CA98C' },
] as const

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
