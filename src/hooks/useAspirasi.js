import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

function fromRow(row) {
  return {
    id: row.id,
    tanggal: row.tanggal,
    nama: row.nama,
    organisasi: row.organisasi || '',
    wa: row.wa || '',
    aspirasi: row.aspirasi,
    topik: row.topik,
    tindakLanjut: row.tindak_lanjut || '',
    archived: Boolean(row.archived),
    createdAt: row.created_at ? Date.parse(row.created_at) : 0,
    updatedAt: row.updated_at ? Date.parse(row.updated_at) : 0,
  }
}

function toRow(payload) {
  return {
    tanggal: payload.tanggal,
    nama: payload.nama,
    organisasi: payload.organisasi || '',
    wa: payload.wa || '',
    aspirasi: payload.aspirasi,
    topik: payload.topik,
    tindak_lanjut: payload.tindakLanjut || '',
    archived: Boolean(payload.archived),
    updated_at: new Date().toISOString(),
  }
}

export function useAspirasi() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState(
    isSupabaseConfigured
      ? null
      : 'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
  )
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: qErr } = await supabase
      .from('aspirasi')
      .select('*')
      .order('tanggal', { ascending: false })
      .order('updated_at', { ascending: false })

    if (qErr) {
      setError(qErr.message)
      setItems([])
    } else {
      setItems((data || []).map(fromRow))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!supabase) return undefined

    ;(async () => {
      const { data, error: qErr } = await supabase
        .from('aspirasi')
        .select('*')
        .order('tanggal', { ascending: false })
        .order('updated_at', { ascending: false })
      if (cancelled) return
      if (qErr) {
        setError(qErr.message)
        setItems([])
      } else {
        setError(null)
        setItems((data || []).map(fromRow))
      }
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const createItem = useCallback(async (payload) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
    setSaving(true)
    try {
      const { data, error: qErr } = await supabase
        .from('aspirasi')
        .insert(toRow({ ...payload, archived: false }))
        .select('*')
        .single()
      if (qErr) throw qErr
      const item = fromRow(data)
      setItems((prev) => [item, ...prev])
      return item
    } finally {
      setSaving(false)
    }
  }, [])

  const updateItem = useCallback(async (id, payload) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
    setSaving(true)
    try {
      const { data, error: qErr } = await supabase
        .from('aspirasi')
        .update(toRow(payload))
        .eq('id', id)
        .select('*')
        .single()
      if (qErr) throw qErr
      const item = fromRow(data)
      setItems((prev) => prev.map((i) => (i.id === id ? item : i)))
      return item
    } finally {
      setSaving(false)
    }
  }, [])

  const setArchived = useCallback(async (id, archived) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
    setSaving(true)
    try {
      const { data, error: qErr } = await supabase
        .from('aspirasi')
        .update({ archived, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single()
      if (qErr) throw qErr
      const item = fromRow(data)
      setItems((prev) => prev.map((i) => (i.id === id ? item : i)))
      return item
    } finally {
      setSaving(false)
    }
  }, [])

  const removeItem = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
    setSaving(true)
    try {
      const { error: qErr } = await supabase.from('aspirasi').delete().eq('id', id)
      if (qErr) throw qErr
      setItems((prev) => prev.filter((i) => i.id !== id))
    } finally {
      setSaving(false)
    }
  }, [])

  const importItems = useCallback(async (rows) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
    if (!rows.length) return 0
    setSaving(true)
    try {
      const payload = rows.map((r) =>
        toRow({
          tanggal: r.tanggal || new Date().toISOString().slice(0, 10),
          nama: r.nama || r.pengaju || 'Tanpa nama',
          organisasi: r.organisasi || '',
          wa: r.wa || '',
          aspirasi: r.aspirasi || '',
          topik: r.topik || 'Lain-lain',
          tindakLanjut: r.tindakLanjut || '',
          archived: Boolean(r.archived),
        }),
      )
      const { data, error: qErr } = await supabase.from('aspirasi').insert(payload).select('*')
      if (qErr) throw qErr
      const mapped = (data || []).map(fromRow)
      setItems((prev) => [...mapped, ...prev])
      return mapped.length
    } finally {
      setSaving(false)
    }
  }, [])

  return {
    items,
    loading,
    saving,
    error,
    configured: isSupabaseConfigured,
    refresh,
    createItem,
    updateItem,
    setArchived,
    removeItem,
    importItems,
  }
}
