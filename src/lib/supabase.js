import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(raw) {
  if (!raw) return ''
  let url = String(raw).trim().replace(/\/+$/, '')
  // Dashboard "REST URL" sering menyertakan /rest/v1 — client butuh origin saja.
  url = url.replace(/\/rest\/v1$/i, '')
  return url
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
