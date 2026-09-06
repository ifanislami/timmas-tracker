import { useMemo, useState } from 'react'
import {
  BarChart3,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, getISOWeek, getYear } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { uid } from '../hooks/useLocalStorage'

function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.6.4-1 1-1z" />
    </svg>
  )
}

function XBrand({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', color: '#E1306C', Icon: InstagramIcon },
  { key: 'facebook', label: 'Facebook', color: '#1877F2', Icon: FacebookIcon },
  { key: 'x', label: 'X (Twitter)', color: '#111827', Icon: XBrand },
]

const emptyMetric = {
  weekStart: '',
  platform: 'instagram',
  posts: '',
  reach: '',
  engagement: '',
  followers: '',
  notes: '',
}

const emptyClip = {
  title: '',
  clipper: '',
  platform: 'instagram',
  url: '',
  postedAt: '',
  views: '',
  status: 'Published',
  notes: '',
}

const CLIP_STATUS = ['Draft', 'Published', 'Scheduled', 'Archived']

export default function MultimediaTab({ metrics, setMetrics, clips, setClips }) {
  const [subTab, setSubTab] = useState('dashboard') // dashboard | clipper
  const [showMetricForm, setShowMetricForm] = useState(false)
  const [showClipForm, setShowClipForm] = useState(false)
  const [editingMetricId, setEditingMetricId] = useState(null)
  const [editingClipId, setEditingClipId] = useState(null)
  const [metricForm, setMetricForm] = useState(emptyMetric)
  const [clipForm, setClipForm] = useState(emptyClip)
  const [monthFilter, setMonthFilter] = useState(() => format(new Date(), 'yyyy-MM'))

  const monthInterval = useMemo(() => {
    const base = parseISO(`${monthFilter}-01`)
    return { start: startOfMonth(base), end: endOfMonth(base) }
  }, [monthFilter])

  const monthMetrics = useMemo(() => {
    return metrics.filter((m) => {
      if (!m.weekStart) return false
      const d = parseISO(m.weekStart)
      return isWithinInterval(d, monthInterval)
    })
  }, [metrics, monthInterval])

  const weeklyRows = useMemo(() => {
    return [...monthMetrics].sort((a, b) => String(b.weekStart).localeCompare(String(a.weekStart)))
  }, [monthMetrics])

  const summaryByPlatform = useMemo(() => {
    const map = {}
    for (const p of PLATFORMS) {
      map[p.key] = { posts: 0, reach: 0, engagement: 0, followers: 0, weeks: 0 }
    }
    for (const m of monthMetrics) {
      const bucket = map[m.platform] || (map[m.platform] = { posts: 0, reach: 0, engagement: 0, followers: 0, weeks: 0 })
      bucket.posts += Number(m.posts) || 0
      bucket.reach += Number(m.reach) || 0
      bucket.engagement += Number(m.engagement) || 0
      bucket.followers = Math.max(bucket.followers, Number(m.followers) || 0)
      bucket.weeks += 1
    }
    return map
  }, [monthMetrics])

  const monthClips = useMemo(() => {
    return clips
      .filter((c) => {
        if (!c.postedAt) return true
        const d = parseISO(c.postedAt)
        return isWithinInterval(d, monthInterval)
      })
      .sort((a, b) => String(b.postedAt || '').localeCompare(String(a.postedAt || '')))
  }, [clips, monthInterval])

  function openCreateMetric() {
    setEditingMetricId(null)
    setMetricForm({
      ...emptyMetric,
      weekStart: format(new Date(), 'yyyy-MM-dd'),
    })
    setShowMetricForm(true)
  }

  function openEditMetric(m) {
    setEditingMetricId(m.id)
    setMetricForm({
      weekStart: m.weekStart || '',
      platform: m.platform,
      posts: String(m.posts ?? ''),
      reach: String(m.reach ?? ''),
      engagement: String(m.engagement ?? ''),
      followers: String(m.followers ?? ''),
      notes: m.notes || '',
    })
    setShowMetricForm(true)
  }

  function saveMetric(e) {
    e.preventDefault()
    if (!metricForm.weekStart) return
    const payload = {
      weekStart: metricForm.weekStart,
      platform: metricForm.platform,
      posts: Number(metricForm.posts) || 0,
      reach: Number(metricForm.reach) || 0,
      engagement: Number(metricForm.engagement) || 0,
      followers: Number(metricForm.followers) || 0,
      notes: metricForm.notes.trim(),
      updatedAt: Date.now(),
    }
    if (editingMetricId) {
      setMetrics((prev) => prev.map((m) => (m.id === editingMetricId ? { ...m, ...payload } : m)))
    } else {
      setMetrics((prev) => [{ id: uid(), createdAt: Date.now(), ...payload }, ...prev])
    }
    setShowMetricForm(false)
  }

  function removeMetric(id) {
    if (!confirm('Hapus data mingguan ini?')) return
    setMetrics((prev) => prev.filter((m) => m.id !== id))
  }

  function openCreateClip() {
    setEditingClipId(null)
    setClipForm({ ...emptyClip, postedAt: format(new Date(), 'yyyy-MM-dd') })
    setShowClipForm(true)
  }

  function openEditClip(c) {
    setEditingClipId(c.id)
    setClipForm({
      title: c.title || '',
      clipper: c.clipper || '',
      platform: c.platform || 'instagram',
      url: c.url || '',
      postedAt: c.postedAt || '',
      views: String(c.views ?? ''),
      status: c.status || 'Published',
      notes: c.notes || '',
    })
    setShowClipForm(true)
  }

  function saveClip(e) {
    e.preventDefault()
    if (!clipForm.title.trim() || !clipForm.clipper.trim()) return
    const payload = {
      title: clipForm.title.trim(),
      clipper: clipForm.clipper.trim(),
      platform: clipForm.platform,
      url: clipForm.url.trim(),
      postedAt: clipForm.postedAt,
      views: Number(clipForm.views) || 0,
      status: clipForm.status,
      notes: clipForm.notes.trim(),
      updatedAt: Date.now(),
    }
    if (editingClipId) {
      setClips((prev) => prev.map((c) => (c.id === editingClipId ? { ...c, ...payload } : c)))
    } else {
      setClips((prev) => [{ id: uid(), createdAt: Date.now(), ...payload }, ...prev])
    }
    setShowClipForm(false)
  }

  function removeClip(id) {
    if (!confirm('Hapus clip ini?')) return
    setClips((prev) => prev.filter((c) => c.id !== id))
  }

  function weekLabel(dateStr) {
    try {
      const d = parseISO(dateStr)
      return `Minggu ${getISOWeek(d)} · ${getYear(d)} (${format(d, 'd MMM', { locale: localeId })})`
    } catch {
      return dateStr
    }
  }

  function platformMeta(key) {
    return PLATFORMS.find((p) => p.key === key) || PLATFORMS[0]
  }

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <div>
          <h2>Multimedia</h2>
          <p className="muted">Dashboard performa media sosial mingguan/bulanan dan monitoring clipper.</p>
        </div>
        <div className="header-actions">
          <label className="month-picker">
            Bulan
            <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
          </label>
          {subTab === 'dashboard' ? (
            <button type="button" className="btn btn-primary" onClick={openCreateMetric}>
              <Plus size={16} /> Input Mingguan
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={openCreateClip}>
              <Plus size={16} /> Tambah Clip
            </button>
          )}
        </div>
      </div>

      <div className="segmented">
        <button type="button" className={subTab === 'dashboard' ? 'active' : ''} onClick={() => setSubTab('dashboard')}>
          <BarChart3 size={14} /> Dashboard Sosmed
        </button>
        <button type="button" className={subTab === 'clipper' ? 'active' : ''} onClick={() => setSubTab('clipper')}>
          Clipper Monitoring
        </button>
      </div>

      {subTab === 'dashboard' && (
        <>
          <div className="stat-grid">
            {PLATFORMS.map(({ key, label, color, Icon }) => {
              const s = summaryByPlatform[key]
              return (
                <div key={key} className="stat-card" style={{ '--accent': color }}>
                  <div className="stat-head">
                    <Icon size={18} />
                    <strong>{label}</strong>
                  </div>
                  <div className="stat-metrics">
                    <div>
                      <span className="stat-label">Posts</span>
                      <span className="stat-value">{fmt(s.posts)}</span>
                    </div>
                    <div>
                      <span className="stat-label">Reach</span>
                      <span className="stat-value">{fmt(s.reach)}</span>
                    </div>
                    <div>
                      <span className="stat-label">Engagement</span>
                      <span className="stat-value">{fmt(s.engagement)}</span>
                    </div>
                    <div>
                      <span className="stat-label">Followers</span>
                      <span className="stat-value">{fmt(s.followers)}</span>
                    </div>
                  </div>
                  <div className="stat-foot">{s.weeks} entri minggu di bulan ini</div>
                </div>
              )
            })}
          </div>

          <div className="section-block">
            <h3>Ringkasan bulanan · {format(parseISO(`${monthFilter}-01`), 'MMMM yyyy', { locale: localeId })}</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>Total posts</th>
                    <th>Total reach</th>
                    <th>Total engagement</th>
                    <th>Followers (terakhir)</th>
                    <th>Eng. rate*</th>
                  </tr>
                </thead>
                <tbody>
                  {PLATFORMS.map(({ key, label }) => {
                    const s = summaryByPlatform[key]
                    const rate = s.reach > 0 ? ((s.engagement / s.reach) * 100).toFixed(2) : '—'
                    return (
                      <tr key={key}>
                        <td>{label}</td>
                        <td>{fmt(s.posts)}</td>
                        <td>{fmt(s.reach)}</td>
                        <td>{fmt(s.engagement)}</td>
                        <td>{fmt(s.followers)}</td>
                        <td>{rate === '—' ? rate : `${rate}%`}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="hint">* Engagement rate = total engagement ÷ total reach × 100 (agregat bulan).</p>
          </div>

          <div className="section-block">
            <h3>Data per minggu</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Minggu</th>
                    <th>Platform</th>
                    <th>Posts</th>
                    <th>Reach</th>
                    <th>Engagement</th>
                    <th>Followers</th>
                    <th>Catatan</th>
                    <th style={{ width: 90 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="empty">
                        Belum ada data untuk bulan ini. Klik &quot;Input Mingguan&quot;.
                      </td>
                    </tr>
                  )}
                  {weeklyRows.map((m) => {
                    const meta = platformMeta(m.platform)
                    return (
                      <tr key={m.id}>
                        <td>{weekLabel(m.weekStart)}</td>
                        <td>
                          <span className="platform-pill" style={{ '--accent': meta.color }}>
                            {meta.label}
                          </span>
                        </td>
                        <td>{fmt(m.posts)}</td>
                        <td>{fmt(m.reach)}</td>
                        <td>{fmt(m.engagement)}</td>
                        <td>{fmt(m.followers)}</td>
                        <td className="cell-wrap">{m.notes || <span className="muted">—</span>}</td>
                        <td>
                          <div className="row-actions">
                            <button type="button" className="icon-btn" onClick={() => openEditMetric(m)}>
                              <Pencil size={15} />
                            </button>
                            <button type="button" className="icon-btn danger" onClick={() => removeMetric(m.id)}>
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
          </div>
        </>
      )}

      {subTab === 'clipper' && (
        <div className="section-block">
          <h3>Monitoring clipper</h3>
          <p className="muted" style={{ marginBottom: 12 }}>
            Pantau postingan clip yang sudah dihasilkan (filtered by bulan posting).
          </p>
          <div className="clip-summary">
            <div className="mini-stat">
              <span>Total clip</span>
              <strong>{monthClips.length}</strong>
            </div>
            <div className="mini-stat">
              <span>Total views</span>
              <strong>{fmt(monthClips.reduce((a, c) => a + (Number(c.views) || 0), 0))}</strong>
            </div>
            <div className="mini-stat">
              <span>Published</span>
              <strong>{monthClips.filter((c) => c.status === 'Published').length}</strong>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Clipper</th>
                  <th>Platform</th>
                  <th>Tanggal</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Link</th>
                  <th style={{ width: 90 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {monthClips.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty">
                      Belum ada clip di bulan ini.
                    </td>
                  </tr>
                )}
                {monthClips.map((c) => {
                  const meta = platformMeta(c.platform)
                  return (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.title}</strong>
                        {c.notes && <div className="muted small">{c.notes}</div>}
                      </td>
                      <td>{c.clipper}</td>
                      <td>
                        <span className="platform-pill" style={{ '--accent': meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td>
                        {c.postedAt
                          ? format(parseISO(c.postedAt), 'd MMM yyyy', { locale: localeId })
                          : '—'}
                      </td>
                      <td>{fmt(c.views)}</td>
                      <td>
                        <span className={`status-badge status-${c.status.toLowerCase()}`}>{c.status}</span>
                      </td>
                      <td>
                        {c.url ? (
                          <a href={c.url} target="_blank" rel="noreferrer" className="wa-link">
                            Buka <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="icon-btn" onClick={() => openEditClip(c)}>
                            <Pencil size={15} />
                          </button>
                          <button type="button" className="icon-btn danger" onClick={() => removeClip(c.id)}>
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
        </div>
      )}

      {showMetricForm && (
        <div className="modal-backdrop" onClick={() => setShowMetricForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMetricId ? 'Edit Data Mingguan' : 'Input Data Mingguan'}</h3>
              <button type="button" className="icon-btn" onClick={() => setShowMetricForm(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveMetric} className="form-grid">
              <label>
                Awal minggu
                <input
                  type="date"
                  required
                  value={metricForm.weekStart}
                  onChange={(e) => setMetricForm({ ...metricForm, weekStart: e.target.value })}
                />
              </label>
              <label>
                Platform
                <select
                  value={metricForm.platform}
                  onChange={(e) => setMetricForm({ ...metricForm, platform: e.target.value })}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Jumlah posts
                <input
                  type="number"
                  min="0"
                  value={metricForm.posts}
                  onChange={(e) => setMetricForm({ ...metricForm, posts: e.target.value })}
                />
              </label>
              <label>
                Reach
                <input
                  type="number"
                  min="0"
                  value={metricForm.reach}
                  onChange={(e) => setMetricForm({ ...metricForm, reach: e.target.value })}
                />
              </label>
              <label>
                Engagement
                <input
                  type="number"
                  min="0"
                  value={metricForm.engagement}
                  onChange={(e) => setMetricForm({ ...metricForm, engagement: e.target.value })}
                />
              </label>
              <label>
                Followers
                <input
                  type="number"
                  min="0"
                  value={metricForm.followers}
                  onChange={(e) => setMetricForm({ ...metricForm, followers: e.target.value })}
                />
              </label>
              <label className="full">
                Catatan
                <textarea
                  rows={2}
                  value={metricForm.notes}
                  onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })}
                />
              </label>
              <div className="modal-actions full">
                <button type="button" className="btn btn-ghost" onClick={() => setShowMetricForm(false)}>
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

      {showClipForm && (
        <div className="modal-backdrop" onClick={() => setShowClipForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingClipId ? 'Edit Clip' : 'Tambah Clip'}</h3>
              <button type="button" className="icon-btn" onClick={() => setShowClipForm(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveClip} className="form-grid">
              <label className="full">
                Judul
                <input
                  required
                  value={clipForm.title}
                  onChange={(e) => setClipForm({ ...clipForm, title: e.target.value })}
                />
              </label>
              <label>
                Nama clipper
                <input
                  required
                  value={clipForm.clipper}
                  onChange={(e) => setClipForm({ ...clipForm, clipper: e.target.value })}
                />
              </label>
              <label>
                Platform
                <select
                  value={clipForm.platform}
                  onChange={(e) => setClipForm({ ...clipForm, platform: e.target.value })}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tanggal posting
                <input
                  type="date"
                  value={clipForm.postedAt}
                  onChange={(e) => setClipForm({ ...clipForm, postedAt: e.target.value })}
                />
              </label>
              <label>
                Views
                <input
                  type="number"
                  min="0"
                  value={clipForm.views}
                  onChange={(e) => setClipForm({ ...clipForm, views: e.target.value })}
                />
              </label>
              <label>
                Status
                <select
                  value={clipForm.status}
                  onChange={(e) => setClipForm({ ...clipForm, status: e.target.value })}
                >
                  {CLIP_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full">
                URL postingan
                <input
                  value={clipForm.url}
                  onChange={(e) => setClipForm({ ...clipForm, url: e.target.value })}
                  placeholder="https://..."
                />
              </label>
              <label className="full">
                Catatan
                <textarea
                  rows={2}
                  value={clipForm.notes}
                  onChange={(e) => setClipForm({ ...clipForm, notes: e.target.value })}
                />
              </label>
              <div className="modal-actions full">
                <button type="button" className="btn btn-ghost" onClick={() => setShowClipForm(false)}>
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

function fmt(n) {
  const num = Number(n) || 0
  return new Intl.NumberFormat('id-ID').format(num)
}
