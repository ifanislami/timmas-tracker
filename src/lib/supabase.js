import { createClient } from '@supabase/supabase-js'

/** Client butuh origin saja, bukan REST URL (.../rest/v1). */
export function normalizeSupabaseUrl(raw) {
  if (!raw) return ''
  const text = String(raw).trim()
  try {
    return new URL(text).origin
  } catch {
    return text
      .replace(/\/+$/, '')
      .replace(/\/rest\/v1.*$/i, '')
  }
}

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null
