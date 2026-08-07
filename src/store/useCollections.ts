import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Collections } from '@/lib/types'
import { nowISO } from '@/lib/utils'

export type CollKey = keyof Collections
type Item<K extends CollKey> = Collections[K][number]

interface State extends Collections {
  add: <K extends CollKey>(coll: K, item: Omit<Item<K>, 'id' | 'createdAt'>) => void
  update: <K extends CollKey>(coll: K, id: string, patch: Partial<Item<K>>) => void
  remove: (coll: CollKey, id: string) => void
}

export const useCollections = create<State>()(
  persist(
    (set) => ({
      vendors: [],
      guests: [],
      documents: [],

      add: (coll, item) =>
        set((s) => ({
          [coll]: [{ ...item, id: nanoid(10), createdAt: nowISO() }, ...(s[coll] as any[])],
        }) as any),

      update: (coll, id, patch) =>
        set((s) => ({
          [coll]: (s[coll] as any[]).map((x) => (x.id === id ? { ...x, ...patch } : x)),
        }) as any),

      remove: (coll, id) =>
        set((s) => ({ [coll]: (s[coll] as any[]).filter((x) => x.id !== id) }) as any),
    }),
    { name: 'wedding-dashboard:collections:v1' },
  ),
)
