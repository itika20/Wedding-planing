import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// The app runs in LOCAL mode until both env vars are present.
export const isCloud = Boolean(url && anon)

export const supabase: SupabaseClient | null = isCloud
  ? createClient(url as string, anon as string, {
      auth: { persistSession: false },
    })
  : null
