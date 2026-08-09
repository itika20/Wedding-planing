// Frontend cloud client. Talks to our own serverless API (same origin) which
// fronts Neon. Enabled in production via VITE_USE_CLOUD=1; when off, the app
// runs fully local (localStorage) — handy for offline dev.
export const isCloud = import.meta.env.VITE_USE_CLOUD === '1'

export interface RawSnapshot {
  tasks: any[]
  activity: any[]
  users: any[]
}

async function post(path: string, body?: unknown) {
  return fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export const api = {
  // true = a valid family session cookie is present
  async session(): Promise<boolean> {
    try {
      const r = await fetch('/api/session')
      return r.ok
    } catch {
      return false
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

  // 'unauth' → session expired; null → network/server error (stay on cached data)
  async snapshot(): Promise<RawSnapshot | 'unauth' | null> {
    try {
      const r = await fetch('/api/snapshot')
      if (r.status === 401) return 'unauth'
      if (!r.ok) return null
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
