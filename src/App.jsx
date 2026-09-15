import { useState } from 'react'
import {
  SquareCheck,
  Download,
  LayoutDashboard,
  Megaphone,
  Upload,
  X,
} from 'lucide-react'
import AspirasiTab from './components/AspirasiTab'
import MultimediaTab from './components/MultimediaTab'
import TodoTab from './components/TodoTab'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAspirasi } from './hooks/useAspirasi'
import './App.css'

const TABS = [
  { id: 'aspirasi', label: 'Aspirasi', icon: Megaphone },
  { id: 'multimedia', label: 'Multimedia', icon: LayoutDashboard },
  { id: 'todo', label: 'To-do', icon: SquareCheck },
]

export default function App() {
  const [tab, setTab] = useState('aspirasi')
  const aspirasiApi = useAspirasi()
  const [customTopics, setCustomTopics] = useLocalStorage('timmas.topics', [])
  const [metrics, setMetrics] = useLocalStorage('timmas.metrics', [])
  const [clips, setClips] = useLocalStorage('timmas.clips', [])
  const [tasks, setTasks] = useLocalStorage('timmas.tasks', [])
  const [events, setEvents] = useLocalStorage('timmas.events', [])
  const [flash, setFlash] = useState(null)
  const [importing, setImporting] = useState(false)

  function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      aspirasi: aspirasiApi.items,
      customTopics,
      metrics,
      clips,
      tasks,
      events,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timmas-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setFlash({ type: 'success', message: 'Backup JSON berhasil diunduh.' })
  }

  function importData(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setFlash(null)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (
          !data ||
          typeof data !== 'object' ||
          !(
            Array.isArray(data.aspirasi) ||
            Array.isArray(data.metrics) ||
            Array.isArray(data.clips) ||
            Array.isArray(data.tasks) ||
            Array.isArray(data.events)
          )
        ) {
          throw new Error('Struktur backup tidak dikenali.')
        }
        if (Array.isArray(data.customTopics)) setCustomTopics(data.customTopics)
        if (Array.isArray(data.metrics)) setMetrics(data.metrics)
        if (Array.isArray(data.clips)) setClips(data.clips)
        if (Array.isArray(data.tasks)) setTasks(data.tasks)
        if (Array.isArray(data.events)) setEvents(data.events)
        if (Array.isArray(data.aspirasi) && data.aspirasi.length) {
          const n = await aspirasiApi.importItems(data.aspirasi)
          setFlash({
            type: 'success',
            message: `Impor selesai. ${n} aspirasi masuk ke Supabase; data lokal lain juga diperbarui.`,
          })
        } else {
          setFlash({ type: 'success', message: 'Data berhasil diimpor.' })
        }
      } catch (err) {
        setFlash({
          type: 'error',
          message: err?.message || 'File tidak valid. Pilih backup JSON Timmas Tracker.',
        })
      } finally {
        setImporting(false)
      }
    }
    reader.onerror = () => {
      setFlash({ type: 'error', message: 'Gagal membaca file. Coba lagi.' })
      setImporting(false)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            TM
          </div>
          <div>
            <h1>Timmas Tracker</h1>
            <p>Aspirasi · Multimedia · To-do & Event</p>
          </div>
        </div>
        <div className="header-tools">
          <button type="button" className="btn btn-ghost" onClick={exportData}>
            <Download size={16} /> Export
          </button>
          <label className="btn btn-ghost file-btn">
            <Upload size={16} /> {importing ? 'Mengimpor…' : 'Import'}
            <input
              type="file"
              accept="application/json,.json"
              onChange={importData}
              hidden
              disabled={importing || aspirasiApi.saving}
            />
          </label>
        </div>
      </header>

      {flash && (
        <div
          className={`flash flash-${flash.type}`}
          role={flash.type === 'error' ? 'alert' : 'status'}
        >
          <p>{flash.message}</p>
          <button
            type="button"
            className="icon-btn"
            aria-label="Tutup pemberitahuan"
            onClick={() => setFlash(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <nav className="tab-nav" aria-label="Navigasi utama">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'tab active' : 'tab'}
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'aspirasi' && (
          <AspirasiTab
            items={aspirasiApi.items}
            customTopics={customTopics}
            setCustomTopics={setCustomTopics}
            loading={aspirasiApi.loading}
            saving={aspirasiApi.saving}
            error={aspirasiApi.error}
            onCreate={aspirasiApi.createItem}
            onUpdate={aspirasiApi.updateItem}
            onSetArchived={aspirasiApi.setArchived}
            onRemove={aspirasiApi.removeItem}
            onRefresh={aspirasiApi.refresh}
          />
        )}
        {tab === 'multimedia' && (
          <MultimediaTab
            metrics={metrics}
            setMetrics={setMetrics}
            clips={clips}
            setClips={setClips}
          />
        )}
        {tab === 'todo' && (
          <TodoTab tasks={tasks} setTasks={setTasks} events={events} setEvents={setEvents} />
        )}
      </main>

      <footer className="app-footer">
        Aspirasi di Supabase · Multimedia & To-do masih lokal · Backup lewat Export JSON
      </footer>
    </div>
  )
}
