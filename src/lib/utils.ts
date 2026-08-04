import { clsx, type ClassValue } from 'clsx'
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isBefore,
  isToday,
  parseISO,
} from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function inr(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
    if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)}L`
    if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export function pct(part: number, whole: number): number {
  if (!whole) return 0
  return Math.min(100, Math.round((part / whole) * 100))
}

export function daysUntil(iso: string): number {
  return differenceInCalendarDays(parseISO(iso), new Date())
}

export function fmtDate(iso: string | null, pattern = 'd MMM yyyy'): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), pattern)
  } catch {
    return '—'
  }
}

export function fmtDateShort(iso: string | null): string {
  return fmtDate(iso, 'd MMM')
}

export function relativeTime(iso: string): string {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true })
  } catch {
    return ''
  }
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false
  const d = parseISO(iso)
  return isBefore(d, new Date()) && !isToday(d)
}

export function isDueToday(iso: string | null): boolean {
  if (!iso) return false
  return isToday(parseISO(iso))
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
