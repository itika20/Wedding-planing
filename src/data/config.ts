import type { Priority, TaskStatus } from '@/lib/types'

// ─────────────────────────────────────────────────────────────────────────────
//  👋 MAKE IT YOURS
//  This file defines who's planning. The events themselves (and their dates) are
//  added/removed by the user in the first-run setup wizard and stored
//  (see src/lib/settings.ts and src/lib/events.ts). There are no budgets — each
//  task carries its own optional budgeted/actual amounts, which roll up per
//  event and overall (see src/lib/expenses.ts).
//  Tip: keep each profile `id` stable once in use; tasks remember which owner
//  they belong to by that id.
// ─────────────────────────────────────────────────────────────────────────────

// The people planning the wedding. Add, remove or rename freely.
export const USERS = [
  { id: 'you', name: 'Big I', role: 'The Bride', emoji: '👰', color: '#D4AF37' },
  { id: 'partner', name: 'Small I', role: "Bride's Sister", emoji: '🙋‍♀️', color: '#D98A7B' },
  { id: 'mom', name: 'Mummy', role: 'Family', emoji: '👩', color: '#D89CA4' },
  { id: 'dad', name: 'Papa', role: 'Family', emoji: '👨', color: '#8CA98C' },
] as const

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
