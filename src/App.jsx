import { useState } from 'react'
import {
  SquareCheck,
  Download,
  LayoutDashboard,
  Megaphone,
  Upload,
} from 'lucide-react'
import AspirasiTab from './components/AspirasiTab'
import MultimediaTab from './components/MultimediaTab'
import TodoTab from './components/TodoTab'
import { useLocalStorage } from './hooks/useLocalStorage'
import './App.css'

const TABS = [
  { id: 'aspirasi', label: 'Aspirasi', icon: Megaphone },
  { id: 'multimedia', label: 'Multimedia', icon: LayoutDashboard },
  { id: 'todo', label: 'To-do', icon: SquareCheck },
]

const SAMPLE_ASPIRASI = [
  {
    id: 'sample-1',
    pengaju: 'Forum Guru Daerah',
    wa: '081234567890',
    aspirasi: 'Permintaan percepatan tunjangan guru honorer di dapil.',
    topik: 'Guru',
    tindakLanjut: 'Sudah diteruskan ke Komisi X',
    archived: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
]

export default function App() {
  const [tab, setTab] = useState('aspirasi')
  const [aspirasi, setAspirasi] = useLocalStorage('timmas.aspirasi', SAMPLE_ASPIRASI)
  const [customTopics, setCustomTopics] = useLocalStorage('timmas.topics', [])
  const [metrics, setMetrics] = useLocalStorage('timmas.metrics', [])
  const [clips, setClips] = useLocalStorage('timmas.clips', [])
  const [tasks, setTasks] = useLocalStorage('timmas.tasks', [])
  const [events, setEvents] = useLocalStorage('timmas.events', [])

  function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      aspirasi,
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
  }

  function importData(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (Array.isArray(data.aspirasi)) setAspirasi(data.aspirasi)
        if (Array.isArray(data.customTopics)) setCustomTopics(data.customTopics)
        if (Array.isArray(data.metrics)) setMetrics(data.metrics)
        if (Array.isArray(data.clips)) setClips(data.clips)
        if (Array.isArray(data.tasks)) setTasks(data.tasks)
        if (Array.isArray(data.events)) setEvents(data.events)
        alert('Data berhasil diimpor.')
      } catch {
        alert('File tidak valid.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">TM</div>
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
            <Upload size={16} /> Import
            <input type="file" accept="application/json,.json" onChange={importData} hidden />
          </label>
        </div>
      </header>

      <nav className="tab-nav" aria-label="Navigasi utama">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'tab active' : 'tab'}
            onClick={() => setTab(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'aspirasi' && (
          <AspirasiTab
            items={aspirasi}
            setItems={setAspirasi}
            customTopics={customTopics}
            setCustomTopics={setCustomTopics}
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
        Data tersimpan lokal di browser Anda · Backup rutin lewat Export JSON
      </footer>
    </div>
  )
}
