import { useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Flag,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { format, parseISO, isPast, isToday, compareAsc } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { uid } from '../hooks/useLocalStorage'

const emptyTask = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'Normal',
  status: 'Todo',
}

const emptyEvent = {
  title: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  status: 'Upcoming',
}

const PRIORITIES = ['Rendah', 'Normal', 'Tinggi', 'Urgent']
const TASK_STATUS = ['Todo', 'In Progress', 'Done']
const EVENT_STATUS = ['Upcoming', 'Ongoing', 'Selesai', 'Dibatalkan']

export default function TodoTab({ tasks, setTasks, events, setEvents }) {
  const [subTab, setSubTab] = useState('tasks')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editingEventId, setEditingEventId] = useState(null)
  const [taskForm, setTaskForm] = useState(emptyTask)
  const [eventForm, setEventForm] = useState(emptyEvent)
  const [taskFilter, setTaskFilter] = useState('Semua')

  const sortedTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => (taskFilter === 'Semua' ? true : t.status === taskFilter))
      .sort((a, b) => {
        if (a.status === 'Done' && b.status !== 'Done') return 1
        if (b.status === 'Done' && a.status !== 'Done') return -1
        const pa = PRIORITIES.indexOf(a.priority)
        const pb = PRIORITIES.indexOf(b.priority)
        if (pb !== pa) return pb - pa
        if (a.dueDate && b.dueDate) return compareAsc(parseISO(a.dueDate), parseISO(b.dueDate))
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return (b.updatedAt || 0) - (a.updatedAt || 0)
      })
  }, [tasks, taskFilter])

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.startDate && b.startDate) return compareAsc(parseISO(a.startDate), parseISO(b.startDate))
      if (a.startDate) return -1
      if (b.startDate) return 1
      return (b.updatedAt || 0) - (a.updatedAt || 0)
    })
  }, [events])

  function openCreateTask() {
    setEditingTaskId(null)
    setTaskForm(emptyTask)
    setShowTaskForm(true)
  }

  function openEditTask(t) {
    setEditingTaskId(t.id)
    setTaskForm({
      title: t.title,
      description: t.description || '',
      dueDate: t.dueDate || '',
      priority: t.priority || 'Normal',
      status: t.status || 'Todo',
    })
    setShowTaskForm(true)
  }

  function saveTask(e) {
    e.preventDefault()
    if (!taskForm.title.trim()) return
    const payload = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      status: taskForm.status,
      updatedAt: Date.now(),
    }
    if (editingTaskId) {
      setTasks((prev) => prev.map((t) => (t.id === editingTaskId ? { ...t, ...payload } : t)))
    } else {
      setTasks((prev) => [{ id: uid(), createdAt: Date.now(), ...payload }, ...prev])
    }
    setShowTaskForm(false)
  }

  function toggleDone(task) {
    const next = task.status === 'Done' ? 'Todo' : 'Done'
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: next, updatedAt: Date.now() } : t)),
    )
  }

  function removeTask(id) {
    if (!confirm('Hapus pekerjaan ini?')) return
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function openCreateEvent() {
    setEditingEventId(null)
    setEventForm(emptyEvent)
    setShowEventForm(true)
  }

  function openEditEvent(ev) {
    setEditingEventId(ev.id)
    setEventForm({
      title: ev.title,
      description: ev.description || '',
      location: ev.location || '',
      startDate: ev.startDate || '',
      endDate: ev.endDate || '',
      status: ev.status || 'Upcoming',
    })
    setShowEventForm(true)
  }

  function saveEvent(e) {
    e.preventDefault()
    if (!eventForm.title.trim() || !eventForm.startDate) return
    const payload = {
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      location: eventForm.location.trim(),
      startDate: eventForm.startDate,
      endDate: eventForm.endDate,
      status: eventForm.status,
      updatedAt: Date.now(),
    }
    if (editingEventId) {
      setEvents((prev) => prev.map((ev) => (ev.id === editingEventId ? { ...ev, ...payload } : ev)))
    } else {
      setEvents((prev) => [{ id: uid(), createdAt: Date.now(), ...payload }, ...prev])
    }
    setShowEventForm(false)
  }

  function removeEvent(id) {
    if (!confirm('Hapus event ini?')) return
    setEvents((prev) => prev.filter((ev) => ev.id !== id))
  }

  const openCount = tasks.filter((t) => t.status !== 'Done').length
  const upcomingEvents = events.filter((e) => e.status === 'Upcoming' || e.status === 'Ongoing').length

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <div>
          <h2>To-do & Event</h2>
          <p className="muted">Kelola pekerjaan harian dan event besar yang akan dijalankan.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={subTab === 'tasks' ? openCreateTask : openCreateEvent}
        >
          <Plus size={16} /> {subTab === 'tasks' ? 'Tambah Pekerjaan' : 'Tambah Event'}
        </button>
      </div>

      <div className="overview-row">
        <div className="mini-stat">
          <span>Pekerjaan aktif</span>
          <strong>{openCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Event mendatang</span>
          <strong>{upcomingEvents}</strong>
        </div>
        <div className="mini-stat">
          <span>Total event</span>
          <strong>{events.length}</strong>
        </div>
      </div>

      <div className="segmented">
        <button type="button" className={subTab === 'tasks' ? 'active' : ''} onClick={() => setSubTab('tasks')}>
          To-do List
        </button>
        <button type="button" className={subTab === 'events' ? 'active' : ''} onClick={() => setSubTab('events')}>
          <CalendarDays size={14} /> Event Besar
        </button>
      </div>

      {subTab === 'tasks' && (
        <>
          <div className="toolbar">
            <select value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)}>
              <option value="Semua">Semua status</option>
              {TASK_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="card-list">
            {sortedTasks.length === 0 && <div className="empty-card">Belum ada pekerjaan.</div>}
            {sortedTasks.map((task) => {
              const overdue =
                task.dueDate &&
                task.status !== 'Done' &&
                isPast(parseISO(task.dueDate)) &&
                !isToday(parseISO(task.dueDate))
              return (
                <article key={task.id} className={`todo-card ${task.status === 'Done' ? 'done' : ''}`}>
                  <button
                    type="button"
                    className="check-btn"
                    onClick={() => toggleDone(task)}
                    title={task.status === 'Done' ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {task.status === 'Done' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                  <div className="todo-body">
                    <div className="todo-title-row">
                      <h3>{task.title}</h3>
                      <span className={`priority priority-${task.priority.toLowerCase()}`}>
                        <Flag size={12} /> {task.priority}
                      </span>
                    </div>
                    {task.description && <p>{task.description}</p>}
                    <div className="todo-meta">
                      <span className={`status-badge status-${task.status.toLowerCase().replace(/\s/g, '-')}`}>
                        {task.status}
                      </span>
                      {task.dueDate && (
                        <span className={overdue ? 'due overdue' : 'due'}>
                          Deadline:{' '}
                          {format(parseISO(task.dueDate), 'd MMM yyyy', { locale: localeId })}
                          {isToday(parseISO(task.dueDate)) && ' · Hari ini'}
                          {overdue && ' · Terlambat'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="row-actions">
                    <button type="button" className="icon-btn" onClick={() => openEditTask(task)}>
                      <Pencil size={15} />
                    </button>
                    <button type="button" className="icon-btn danger" onClick={() => removeTask(task.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}

      {subTab === 'events' && (
        <div className="card-list">
          {sortedEvents.length === 0 && <div className="empty-card">Belum ada event besar.</div>}
          {sortedEvents.map((ev) => (
            <article key={ev.id} className="event-card">
              <div className="event-date">
                <span className="day">
                  {ev.startDate ? format(parseISO(ev.startDate), 'd', { locale: localeId }) : '—'}
                </span>
                <span className="month">
                  {ev.startDate ? format(parseISO(ev.startDate), 'MMM yyyy', { locale: localeId }) : ''}
                </span>
              </div>
              <div className="todo-body">
                <div className="todo-title-row">
                  <h3>{ev.title}</h3>
                  <span className={`status-badge status-${ev.status.toLowerCase()}`}>{ev.status}</span>
                </div>
                {ev.description && <p>{ev.description}</p>}
                <div className="todo-meta">
                  {ev.location && <span>📍 {ev.location}</span>}
                  {ev.startDate && (
                    <span>
                      {format(parseISO(ev.startDate), 'd MMM yyyy', { locale: localeId })}
                      {ev.endDate && ev.endDate !== ev.startDate
                        ? ` – ${format(parseISO(ev.endDate), 'd MMM yyyy', { locale: localeId })}`
                        : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="row-actions">
                <button type="button" className="icon-btn" onClick={() => openEditEvent(ev)}>
                  <Pencil size={15} />
                </button>
                <button type="button" className="icon-btn danger" onClick={() => removeEvent(ev.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showTaskForm && (
        <div className="modal-backdrop" onClick={() => setShowTaskForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTaskId ? 'Edit Pekerjaan' : 'Tambah Pekerjaan'}</h3>
              <button type="button" className="icon-btn" onClick={() => setShowTaskForm(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveTask} className="form-grid">
              <label className="full">
                Judul pekerjaan
                <input
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </label>
              <label className="full">
                Deskripsi
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </label>
              <label>
                Deadline
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </label>
              <label>
                Prioritas
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                >
                  {TASK_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <div className="modal-actions full">
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskForm(false)}>
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

      {showEventForm && (
        <div className="modal-backdrop" onClick={() => setShowEventForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEventId ? 'Edit Event' : 'Tambah Event Besar'}</h3>
              <button type="button" className="icon-btn" onClick={() => setShowEventForm(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveEvent} className="form-grid">
              <label className="full">
                Nama event
                <input
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </label>
              <label className="full">
                Deskripsi
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </label>
              <label className="full">
                Lokasi
                <input
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="Gedung / daerah"
                />
              </label>
              <label>
                Tanggal mulai
                <input
                  type="date"
                  required
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                />
              </label>
              <label>
                Tanggal selesai
                <input
                  type="date"
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                />
              </label>
              <label>
                Status
                <select
                  value={eventForm.status}
                  onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                >
                  {EVENT_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <div className="modal-actions full">
                <button type="button" className="btn btn-ghost" onClick={() => setShowEventForm(false)}>
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
