import type { EventKey, EventMeta } from './types'

// The shared bucket for bookings/vendors that span every function.
// Always present; not part of the user-editable list.
export const COMMON_EVENT: EventMeta = {
  id: 'common',
  name: 'Common Planning',
  emoji: '💍',
  accent: '#D4AF37',
  date: '',
}

// Accents assigned to events (cycled for new ones).
export const ACCENT_CYCLE = ['#D4AF37', '#D89CA4', '#8CA98C', '#E0A458', '#D98A7B', '#B87883']

// Sensible starting events the wizard pre-fills — fully editable (add/remove/rename).
export const DEFAULT_EVENTS: EventMeta[] = [
  { id: 'roka', name: 'Roka', emoji: '🪔', accent: '#D98A7B', date: '' },
  { id: 'kalipuja', name: 'Kali Puja', emoji: '🛕', accent: '#B87883', date: '' },
  { id: 'engagement', name: 'Engagement', emoji: '💐', accent: '#D89CA4', date: '' },
  { id: 'haldi', name: 'Haldi', emoji: '🌼', accent: '#E0A458', date: '' },
  { id: 'wedding', name: 'Wedding', emoji: '🎉', accent: '#D4AF37', date: '' },
]

// All events including the implicit Common Planning bucket.
export function allEvents(events: EventMeta[]): EventMeta[] {
  return [COMMON_EVENT, ...events]
}

export function findEvent(events: EventMeta[], key: EventKey): EventMeta {
  return allEvents(events).find((e) => e.id === key) ?? COMMON_EVENT
}

export function nextAccent(count: number): string {
  return ACCENT_CYCLE[count % ACCENT_CYCLE.length]
}
