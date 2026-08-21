import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Collections } from '@/lib/types'
import { nowISO } from '@/lib/utils'
import { isCloud, api } from '@/lib/cloud'

export type CollKey = keyof Collections
type Item<K extends CollKey> = Collections[K][number]

interface State extends Collections {
  add: <K extends CollKey>(coll: K, item: Omit<Item<K>, 'id' | 'createdAt'>) => void
  update: <K extends CollKey>(coll: K, id: string, patch: Partial<Item<K>>) => void
  remove: (coll: CollKey, id: string) => void
  // Cloud: apply the server's collections. `bootstrap` (initial load) pushes any
  // local-only items up when the server has none yet, so nothing is lost.
  hydrate: (server: Collections, bootstrap: boolean) => void
}

const KINDS: CollKey[] = ['vendors', 'guests', 'documents']

// Collection items have no updatedAt, so we track ids written/deleted locally in
// the last couple of minutes. A background hydrate then preserves those recent
// local writes (and honours recent deletes) instead of clobbering an edit whose
// sync is still in flight.
const PENDING_MS = 2 * 60 * 1000
const pendingWrites = new Map<string, number>()
const pendingDeletes = new Map<string, number>()
const markWrite = (id: string) => {
  pendingWrites.set(id, Date.now())
  pendingDeletes.delete(id)
}
const markDelete = (id: string) => {
  pendingDeletes.set(id, Date.now())
  pendingWrites.delete(id)
}
const isRecent = (m: Map<string, number>, id: string) => {
  const t = m.get(id)
  return t != null && Date.now() - t < PENDING_MS
}

export const useCollections = create<State>()(
  persist(
    (set, get) => ({
      vendors: [],
      guests: [],
      documents: [],

      add: (coll, item) => {
        const created: any = { ...item, id: nanoid(10), createdAt: nowISO() }
        markWrite(created.id)
        set((s) => ({ [coll]: [created, ...(s[coll] as any[])] }) as any)
        if (isCloud()) void api.mutate('upsertCollection', { kind: coll, item: created })
      },

      update: (coll, id, patch) => {
        let updated: any
        set((s) => ({
          [coll]: (s[coll] as any[]).map((x) => {
            if (x.id !== id) return x
            updated = { ...x, ...patch }
            return updated
          }),
        }) as any)
        if (updated) {
          markWrite(id)
          if (isCloud()) void api.mutate('upsertCollection', { kind: coll, item: updated })
        }
      },

      remove: (coll, id) => {
        markDelete(id)
        set((s) => ({ [coll]: (s[coll] as any[]).filter((x) => x.id !== id) }) as any)
        if (isCloud()) void api.mutate('deleteCollection', { id })
      },

      hydrate: (server, bootstrap) => {
        const local = get()
        const next: any = {}
        for (const kind of KINDS) {
          const fromServer = (server[kind] as any[]) ?? []
          if (fromServer.length === 0) {
            next[kind] = local[kind] // keep local; nothing on the server yet
            if (bootstrap) {
              // Seed the server from this device's local items so the family shares them.
              for (const item of local[kind] as any[]) void api.mutate('upsertCollection', { kind, item })
            }
            continue
          }
          // Server has data — take it, but preserve recent local writes and honour
          // recent local deletes so an in-flight sync isn't clobbered.
          const byId = new Map<string, any>(fromServer.map((x) => [x.id, x]))
          for (const item of local[kind] as any[]) {
            if (isRecent(pendingWrites, item.id)) byId.set(item.id, item)
          }
          for (const id of [...byId.keys()]) {
            if (isRecent(pendingDeletes, id)) byId.delete(id)
          }
          next[kind] = [...byId.values()]
        }
        set(next)
      },
    }),
    { name: 'wedding-dashboard:collections:v1' },
  ),
)
