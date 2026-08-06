import type { WeddingSettings } from './types'
import { DEFAULT_EVENTS } from './events'

const SETTINGS_KEY = 'wedding-dashboard:settings:v2'

export function blankSettings(): WeddingSettings {
  return {
    setupDone: false,
    weddingDate: '',
    events: DEFAULT_EVENTS.map((e) => ({ ...e })),
  }
}

export function loadSettings(): WeddingSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WeddingSettings>
      const base = blankSettings()
      return {
        ...base,
        ...parsed,
        events: Array.isArray(parsed.events) ? parsed.events : base.events,
      }
    }
  } catch {
    /* ignore */
  }
  return blankSettings()
}

export function saveSettings(s: WeddingSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    /* ignore quota errors */
  }
}

export function clearSettings(): void {
  localStorage.removeItem(SETTINGS_KEY)
}
