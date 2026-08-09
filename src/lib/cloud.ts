// Frontend cloud client. Talks to our own serverless API (same origin) which
// fronts Neon. Cloud mode is AUTO-DETECTED at startup by probing /api — when the
// backend is present (deployed), it turns on; otherwise the app runs fully local
// (localStorage). No build-time flag to forget.
let cloudMode = false
export function isCloud(): boolean {
  return cloudMode
}
export function setCloud(v: boolean): void {
  cloudMode = v
}

export interface RawSnapshot {
  tasks: any[]
  activity: any[]
  users: any[]
  settings?: any
}

async function post(path: string, body?: unknown) {
  return fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export const api = {
  // Is a backend present, and do we have a valid family session?
  // A real API answers /api/session with JSON; the local dev server (no backend)
  // returns the SPA's index.html, which we treat as "local mode".
  async probe(): Promise<{ cloud: boolean; authed: boolean }> {
    try {
      const r = await fetch('/api/session', { headers: { accept: 'application/json' } })
      const ct = r.headers.get('content-type') || ''
      if (!ct.includes('application/json')) return { cloud: false, authed: false }
      const j = await r.json().catch(() => null)
      if (j && typeof j.authed === 'boolean') {
        setCloud(true)
        return { cloud: true, authed: j.authed }
      }
      return { cloud: false, authed: false }
    } catch {
      return { cloud: false, authed: false }
    }
  },

  async login(passcode: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const r = await post('/api/login', { passcode })
      if (r.ok) return { ok: true }
      const j = await r.json().catch(() => ({}))
      return { ok: false, error: j.error || 'That passcode is not right.' }
    } catch {
      return { ok: false, error: 'Could not reach the server. Try again.' }
    }
  },

  async logout(): Promise<void> {
    try {
      await post('/api/logout')
    } catch {
      /* ignore */
    }
  },

  // 'unauth' → session expired; { error } → server responded but failed (shows the
  // reason); null → couldn't reach the server at all. Any non-success keeps cached data.
  async snapshot(): Promise<RawSnapshot | 'unauth' | { error: string } | null> {
    try {
      const r = await fetch('/api/snapshot')
      if (r.status === 401) return 'unauth'
      if (!r.ok) {
        const j = await r.json().catch(() => null)
        return { error: (j && j.error) || `Server error (${r.status})` }
      }
      return (await r.json()) as RawSnapshot
    } catch {
      return null
    }
  },

  async mutate(op: string, data: unknown): Promise<void> {
    try {
      await post('/api/mutate', { op, data })
    } catch {
      /* optimistic — local state already updated, will reconcile on next load */
    }
  },
}
