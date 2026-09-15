import { useCallback, useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  ClipboardList,
  MessageCircle,
  MessageSquareText,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Tag,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { uid } from '../hooks/useLocalStorage'
import { useEscapeClose } from '../hooks/useEscapeClose'

const DEFAULT_TOPICS = ['ASN', 'Guru', 'Pertanahan', 'Lain-lain']

function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const emptyForm = {
  tanggal: todayISO(),
  nama: '',
  organisasi: '',
  wa: '',
  aspirasi: '',
  topik: 'ASN',
  customTopik: '',
  tindakLanjut: '',
}

function resolveNama(item) {
  if (item.nama) return item.nama
  return item.pengaju || ''
}

function resolveOrganisasi(item) {
  return item.organisasi || ''
}

function formatTanggal(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function waLink(wa) {
  const digits = String(wa || '').replace(/\D/g, '')
  if (!digits) return null
  let normalized = digits
  if (normalized.startsWith('0')) normalized = `62${normalized.slice(1)}`
  if (!normalized.startsWith('62')) normalized = `62${normalized}`
  return `https://wa.me/${normalized}`
}

export default function AspirasiTab({ items, setItems, customTopics, setCustomTopics }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [view, setView] = useState('aktif')
  const [query, setQuery] = useState('')
  const [filterTopik, setFilterTopik] = useState('Semua')
  const [newTopic, setNewTopic] = useState('')

  const allTopics = useMemo(
    () => [...DEFAULT_TOPICS.filter((t) => t !== 'Lain-lain'), ...customTopics, 'Lain-lain'],
    [customTopics],
  )

  const filtered = useMemo(() => {
    const archived = view === 'arsip'
    return items
      .filter((i) => Boolean(i.archived) === archived)
      .filter((i) => (filterTopik === 'Semua' ? true : i.topik === filterTopik))
      .filter((i) => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        const nama = resolveNama(i).toLowerCase()
        const organisasi = resolveOrganisasi(i).toLowerCase()
        return (
          nama.includes(q) ||
          organisasi.includes(q) ||
          String(i.aspirasi || '')
            .toLowerCase()
            .includes(q) ||
          String(i.tindakLanjut || '')
            .toLowerCase()
            .includes(q) ||
          String(i.topik || '')
            .toLowerCase()
            .includes(q) ||
          String(i.wa || '').includes(q) ||
          String(i.tanggal || '').includes(q)
        )
      })
      .sort((a, b) => {
        const ta = a.tanggal || ''
        const tb = b.tanggal || ''
        if (ta && tb && ta !== tb) return tb.localeCompare(ta)
        return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
      })
  }, [items, view, filterTopik, query])

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, tanggal: todayISO() })
    setShowForm(true)
  }

  function openEdit(item) {
    const known = allTopics.includes(item.topik)
    setEditingId(item.id)
    setForm({
      tanggal: item.tanggal || todayISO(),
      nama: resolveNama(item),
      organisasi: resolveOrganisasi(item),
      wa: item.wa || '',
      aspirasi: item.aspirasi,
      topik: known ? item.topik : 'Lain-lain',
      customTopik: known ? '' : item.topik,
      tindakLanjut: item.tindakLanjut || '',
    })
    setShowForm(true)
  }

  function resolveTopik() {
    if (form.topik === 'Lain-lain') {
      const custom = form.customTopik.trim()
      if (!custom) return 'Lain-lain'
      if (!customTopics.includes(custom) && !DEFAULT_TOPICS.includes(custom)) {
        setCustomTopics((prev) => [...prev, custom])
      }
      return custom
    }
    return form.topik
  }

  function saveItem(e) {
    e.preventDefault()
    if (!form.nama.trim() || !form.aspirasi.trim() || !form.tanggal) return

    const topik = resolveTopik()
    const now = Date.now()
    const payload = {
      tanggal: form.tanggal,
      nama: form.nama.trim(),
      organisasi: form.organisasi.trim(),
      wa: form.wa.trim(),
      aspirasi: form.aspirasi.trim(),
      topik,
      tindakLanjut: form.tindakLanjut.trim(),
      updatedAt: now,
    }

    if (editingId) {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== editingId) return i
          const { pengaju: _legacy, ...rest } = i
          return { ...rest, ...payload }
        }),
      )
    } else {
      setItems((prev) => [
        {
          id: uid(),
          ...payload,
          archived: false,
          createdAt: now,
        },
        ...prev,
      ])
    }

    setShowForm(false)
    setEditingId(null)
    setForm({ ...emptyForm, tanggal: todayISO() })
  }

  function markSelesai(id) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, archived: true, updatedAt: Date.now() } : i)),
    )
  }

  function markAktif(id) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, archived: false, updatedAt: Date.now() } : i)),
    )
  }

  function removeItem(id) {
    if (!confirm('Hapus aspirasi ini?')) return
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function addCustomTopic() {
    const t = newTopic.trim()
    if (!t) return
    if (DEFAULT_TOPICS.includes(t) || customTopics.includes(t)) {
      setNewTopic('')
      return
    }
    setCustomTopics((prev) => [...prev, t])
    setNewTopic('')
  }

  function removeCustomTopic(t) {
    setCustomTopics((prev) => prev.filter((x) => x !== t))
    if (filterTopik === t) setFilterTopik('Semua')
  }

  const aktifCount = items.filter((i) => !i.archived).length
  const arsipCount = items.filter((i) => i.archived).length

  const closeForm = useCallback(() => {
    setShowForm(false)
    setEditingId(null)
  }, [])
  useEscapeClose(showForm, closeForm)

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <div>
          <h2>Aspirasi</h2>
          <p className="muted">Catat aspirasi konstituen, topik, dan tindak lanjut.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Tambah Aspirasi
        </button>
      </div>

      <div className="toolbar">
        <div className="segmented">
          <button
            type="button"
            className={view === 'aktif' ? 'active' : ''}
            onClick={() => setView('aktif')}
          >
            Aktif ({aktifCount})
          </button>
          <button
            type="button"
            className={view === 'arsip' ? 'active' : ''}
            onClick={() => setView('arsip')}
          >
            Arsip ({arsipCount})
          </button>
        </div>

        <div className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, organisasi, aspirasi, topik..."
          />
        </div>

        <select value={filterTopik} onChange={(e) => setFilterTopik(e.target.value)}>
          <option value="Semua">Semua topik</option>
          {allTopics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="topic-manager">
        <span className="label">Topik kustom:</span>
        <div className="chips">
          {customTopics.length === 0 && <span className="muted">Belum ada</span>}
          {customTopics.map((t) => (
            <span key={t} className="chip">
              {t}
              <button type="button" aria-label={`Hapus topik ${t}`} onClick={() => removeCustomTopic(t)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="inline-add">
          <input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Tambah topik baru"
            onKeyDown={(e) => e.key === 'Enter' && addCustomTopic()}
          />
          <button type="button" className="btn btn-ghost" onClick={addCustomTopic}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="aspirasi-list">
        {filtered.length === 0 && (
          <div className="empty-card">
            <strong>
              {items.length === 0 ? 'Belum ada aspirasi' : 'Tidak ada hasil di filter ini'}
            </strong>
            <span>
              {items.length === 0
                ? 'Klik "Tambah Aspirasi" untuk mencatat yang pertama.'
                : 'Ubah pencarian atau topik.'}
            </span>
          </div>
        )}

        {filtered.map((item) => {
          const link = waLink(item.wa)
          const nama = resolveNama(item)
          const organisasi = resolveOrganisasi(item)
          return (
            <article
              key={item.id}
              className={`aspirasi-card${item.archived ? ' is-archived' : ''}`}
            >
              <div className="aspirasi-row">
                <span className="aspirasi-ico" title="Pihak yang mengajukan" aria-hidden="true">
                  <UserRound size={16} />
                </span>
                <div className="aspirasi-row-body aspirasi-party">
                  <strong>{nama || 'Tanpa nama'}</strong>
                  {organisasi ? <span className="aspirasi-org">{organisasi}</span> : null}
                  <span className={`badge topic-${slug(item.topik)}`} title="Topik">
                    <Tag size={12} aria-hidden="true" /> {item.topik}
                  </span>
                </div>
              </div>

              <div className="aspirasi-row">
                <span className="aspirasi-ico" title="Waktu" aria-hidden="true">
                  <CalendarDays size={16} />
                </span>
                <div className="aspirasi-row-body aspirasi-meta">
                  <span>{item.tanggal ? formatTanggal(item.tanggal) : 'Belum diisi'}</span>
                  {item.wa ? (
                    link ? (
                      <a href={link} target="_blank" rel="noreferrer" className="wa-link" title="WhatsApp">
                        <MessageCircle size={14} aria-hidden="true" />
                        {item.wa}
                      </a>
                    ) : (
                      <span className="muted">{item.wa}</span>
                    )
                  ) : null}
                </div>
              </div>

              <div className="aspirasi-row">
                <span className="aspirasi-ico" title="Aspirasi" aria-hidden="true">
                  <MessageSquareText size={16} />
                </span>
                <div className="aspirasi-row-body cell-wrap">{item.aspirasi}</div>
              </div>

              <div className="aspirasi-row">
                <span className="aspirasi-ico" title="Tindak lanjut" aria-hidden="true">
                  <ClipboardList size={16} />
                </span>
                <div className="aspirasi-row-body cell-wrap">
                  {item.tindakLanjut || <span className="muted">Belum ada</span>}
                </div>
              </div>

              <div className="aspirasi-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => openEdit(item)}
                >
                  <Pencil size={15} aria-hidden="true" /> Edit
                </button>
                {item.archived ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => markAktif(item.id)}
                  >
                    <RotateCcw size={15} aria-hidden="true" /> Aktifkan
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => markSelesai(item.id)}
                  >
                    <Check size={15} aria-hidden="true" /> Selesai
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-danger-text"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={15} aria-hidden="true" /> Hapus
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={closeForm} role="presentation">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aspirasi-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="aspirasi-modal-title">{editingId ? 'Edit Aspirasi' : 'Tambah Aspirasi'}</h3>
              <button type="button" className="icon-btn" aria-label="Tutup" onClick={closeForm}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveItem} className="form-grid">
              <p className="form-section-label full">Pihak yang mengajukan</p>
              <label>
                Nama
                <input
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Nama pengaju"
                />
              </label>
              <label>
                Organisasi
                <input
                  value={form.organisasi}
                  onChange={(e) => setForm({ ...form, organisasi: e.target.value })}
                  placeholder="Organisasi / komunitas (opsional)"
                />
              </label>
              <label>
                Topik
                <select
                  value={form.topik}
                  onChange={(e) => setForm({ ...form, topik: e.target.value })}
                >
                  {allTopics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nomor WhatsApp
                <input
                  value={form.wa}
                  onChange={(e) => setForm({ ...form, wa: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </label>
              {form.topik === 'Lain-lain' && (
                <label className="full">
                  Topik baru (opsional)
                  <input
                    value={form.customTopik}
                    onChange={(e) => setForm({ ...form, customTopik: e.target.value })}
                    placeholder="Contoh: Kesehatan, UMKM..."
                  />
                </label>
              )}
              <label className="full">
                Waktu
                <input
                  type="date"
                  required
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                />
              </label>
              <label className="full">
                Aspirasi
                <textarea
                  required
                  rows={3}
                  value={form.aspirasi}
                  onChange={(e) => setForm({ ...form, aspirasi: e.target.value })}
                  placeholder="Isi aspirasi..."
                />
              </label>
              <label className="full">
                Tindak lanjut
                <textarea
                  rows={2}
                  value={form.tindakLanjut}
                  onChange={(e) => setForm({ ...form, tindakLanjut: e.target.value })}
                  placeholder="Langkah yang sudah / akan diambil"
                />
              </label>
              <div className="modal-actions full">
                <button type="button" className="btn btn-ghost" onClick={closeForm}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function slug(text) {
  return (
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'lain'
  )
}
