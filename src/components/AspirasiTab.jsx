import { useMemo, useState } from 'react'
import {
  Archive,
  ArchiveRestore,
  Link2,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { uid } from '../hooks/useLocalStorage'

const DEFAULT_TOPICS = ['ASN', 'Guru', 'Pertanahan', 'Lain-lain']

const emptyForm = {
  pengaju: '',
  wa: '',
  aspirasi: '',
  topik: 'ASN',
  customTopik: '',
  tindakLanjut: '',
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
  const [view, setView] = useState('aktif') // aktif | arsip
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
        return (
          i.pengaju.toLowerCase().includes(q) ||
          i.aspirasi.toLowerCase().includes(q) ||
          i.tindakLanjut.toLowerCase().includes(q) ||
          i.topik.toLowerCase().includes(q) ||
          String(i.wa || '').includes(q)
        )
      })
      .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
  }, [items, view, filterTopik, query])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(item) {
    const known = allTopics.includes(item.topik)
    setEditingId(item.id)
    setForm({
      pengaju: item.pengaju,
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
    if (!form.pengaju.trim() || !form.aspirasi.trim()) return

    const topik = resolveTopik()
    const now = Date.now()

    if (editingId) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingId
            ? {
                ...i,
                pengaju: form.pengaju.trim(),
                wa: form.wa.trim(),
                aspirasi: form.aspirasi.trim(),
                topik,
                tindakLanjut: form.tindakLanjut.trim(),
                updatedAt: now,
              }
            : i,
        ),
      )
    } else {
      setItems((prev) => [
        {
          id: uid(),
          pengaju: form.pengaju.trim(),
          wa: form.wa.trim(),
          aspirasi: form.aspirasi.trim(),
          topik,
          tindakLanjut: form.tindakLanjut.trim(),
          archived: false,
          createdAt: now,
          updatedAt: now,
        },
        ...prev,
      ])
    }

    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  function toggleArchive(id, archived) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, archived, updatedAt: Date.now() } : i)),
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
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pengaju, aspirasi, topik..."
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

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>Selesai</th>
              <th>Pihak yang mengajukan</th>
              <th>Aspirasi</th>
              <th>Topik</th>
              <th>Tindak lanjut</th>
              <th style={{ width: 110 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  Belum ada data di tampilan ini.
                </td>
              </tr>
            )}
            {filtered.map((item) => {
              const link = waLink(item.wa)
              return (
                <tr key={item.id} className={item.archived ? 'row-archived' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={Boolean(item.archived)}
                      onChange={(e) => toggleArchive(item.id, e.target.checked)}
                      title={item.archived ? 'Kembalikan ke aktif' : 'Pindahkan ke arsip'}
                    />
                  </td>
                  <td>
                    <div className="pengaju">
                      <strong>{item.pengaju}</strong>
                      {item.wa && (
                        <div className="wa-row">
                          {link ? (
                            <a href={link} target="_blank" rel="noreferrer" className="wa-link">
                              <MessageCircle size={14} />
                              {item.wa}
                              <Link2 size={12} />
                            </a>
                          ) : (
                            <span className="muted">{item.wa}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="cell-wrap">{item.aspirasi}</td>
                  <td>
                    <span className={`badge topic-${slug(item.topik)}`}>{item.topik}</span>
                  </td>
                  <td className="cell-wrap">{item.tindakLanjut || <span className="muted">—</span>}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" title="Edit" onClick={() => openEdit(item)}>
                        <Pencil size={15} />
                      </button>
                      {item.archived ? (
                        <button
                          type="button"
                          className="icon-btn"
                          title="Kembalikan"
                          onClick={() => toggleArchive(item.id, false)}
                        >
                          <ArchiveRestore size={15} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="icon-btn"
                          title="Arsipkan"
                          onClick={() => toggleArchive(item.id, true)}
                        >
                          <Archive size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="icon-btn danger"
                        title="Hapus"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Aspirasi' : 'Tambah Aspirasi'}</h3>
              <button type="button" className="icon-btn" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveItem} className="form-grid">
              <label>
                Pihak yang mengajukan
                <input
                  required
                  value={form.pengaju}
                  onChange={(e) => setForm({ ...form, pengaju: e.target.value })}
                  placeholder="Nama / organisasi"
                />
              </label>
              <label>
                Nomor WhatsApp
                <input
                  value={form.wa}
                  onChange={(e) => setForm({ ...form, wa: e.target.value })}
                  placeholder="08xxxxxxxxxx"
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
              {form.topik === 'Lain-lain' && (
                <label>
                  Topik baru (opsional)
                  <input
                    value={form.customTopik}
                    onChange={(e) => setForm({ ...form, customTopik: e.target.value })}
                    placeholder="Contoh: Kesehatan, UMKM..."
                  />
                </label>
              )}
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
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
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
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'lain'
}
