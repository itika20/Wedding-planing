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

export const useCollections = create<State>()(
  persist(
    (set, get) => ({
      vendors: [],
      guests: [],
      documents: [],

      add: (coll, item) => {
        const created: any = { ...item, id: nanoid(10), createdAt: nowISO() }
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
        if (isCloud() && updated) void api.mutate('upsertCollection', { kind: coll, item: updated })
      },

      remove: (coll, id) => {
        set((s) => ({ [coll]: (s[coll] as any[]).filter((x) => x.id !== id) }) as any)
        if (isCloud()) void api.mutate('deleteCollection', { id })
      },

      hydrate: (server, bootstrap) => {
        const local = get()
        const next: any = {}
        for (const kind of KINDS) {
          const fromServer = (server[kind] as any[]) ?? []
          if (fromServer.length > 0) {
            next[kind] = fromServer // server is the source of truth once it has data
          } else {
            next[kind] = local[kind] // keep local; nothing on the server yet
            if (bootstrap) {
              // Seed the server from this device's local items so the family shares them.
              for (const item of local[kind] as any[]) void api.mutate('upsertCollection', { kind, item })
            }
          }
        }
        set(next)
      },
    }),
    { name: 'wedding-dashboard:collections:v1' },
  ),
)
