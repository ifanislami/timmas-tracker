import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function normalizeSupabaseUrl(raw) {
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

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // File lokal (.env.local) + process.env (Vercel Shared: SUPABASE_URL / SUPABASE_ANON_KEY)
  const fileEnv = loadEnv(mode, process.cwd(), '')
  const supabaseUrl = normalizeSupabaseUrl(
    process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      fileEnv.VITE_SUPABASE_URL ||
      fileEnv.SUPABASE_URL ||
      '',
  )
  const supabaseAnonKey = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    fileEnv.VITE_SUPABASE_ANON_KEY ||
    fileEnv.SUPABASE_ANON_KEY ||
    ''
  ).trim()

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
  }
})
