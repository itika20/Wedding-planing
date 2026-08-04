import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { Modal } from '@/components/ui/Modal'
import { useStore } from '@/store/useStore'
import { EVENTS, PRIORITY_META, STATUS_META, KANBAN_COLUMNS } from '@/data/config'
import type { ChecklistItem, EventKey, Priority, Task, TaskStatus } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  task?: Task | null
  defaultEvent?: EventKey
  defaultStatus?: TaskStatus
}

export function TaskModal({ open, onClose, task, defaultEvent = 'wedding', defaultStatus = 'todo' }: Props) {
  const users = useStore((s) => s.users)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const editing = Boolean(task)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventKey, setEventKey] = useState<EventKey>(defaultEvent)
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [dueDate, setDueDate] = useState('')
  const [completionPct, setCompletionPct] = useState(0)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
    if (!open) return
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setEventKey(task.eventKey)
      setAssignedTo(task.assignedTo ?? '')
      setPriority(task.priority)
      setStatus(task.status)
      setDueDate(task.dueDate ?? '')
      setCompletionPct(task.completionPct)
      setChecklist(task.checklist)
    } else {
      setTitle('')
      setDescription('')
      setEventKey(defaultEvent)
      setAssignedTo('')
      setPriority('medium')
      setStatus(defaultStatus)
      setDueDate('')
      setCompletionPct(0)
      setChecklist([])
    }
    setNewItem('')
  }, [open, task, defaultEvent, defaultStatus])

  const canSave = title.trim().length > 0

  const submit = () => {
    if (!canSave) return
    const payload = {
      title: title.trim(),
      description: description.trim(),
      eventKey,
      assignedTo: assignedTo || null,
      priority,
      status,
      dueDate: dueDate || null,
      completionPct: status === 'completed' ? 100 : completionPct,
      checklist,
    }
    if (task) updateTask(task.id, payload)
    else addTask(payload)
    onClose()
  }

  const addChecklistItem = () => {
    if (!newItem.trim()) return
    setChecklist((c) => [...c, { id: nanoid(6), text: newItem.trim(), done: false }])
    setNewItem('')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit task' : 'New task'}
      subtitle={editing ? 'Update the details below' : 'Add something to the plan'}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-gold" onClick={submit} disabled={!canSave}>
            {editing ? 'Save changes' : 'Add task'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            value={title}
            autoFocus
            placeholder="e.g. Book Haldi decor"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.metaKey && submit()}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[72px] resize-none"
            value={description}
            placeholder="Any details, links, or context…"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Event</label>
            <select className="input" value={eventKey} onChange={(e) => setEventKey(e.target.value as EventKey)}>
              {EVENTS.map((ev) => (
                <option key={ev.key} value={ev.key}>
                  {ev.emoji} {ev.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Assign to</label>
            <select className="input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.emoji} {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Priority</label>
            <div className="flex gap-1.5">
              {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className="flex-1 rounded-lg border px-2 py-2 text-xs font-semibold transition"
                  style={
                    priority === p
                      ? { background: PRIORITY_META[p].bg, color: PRIORITY_META[p].color, borderColor: PRIORITY_META[p].color }
                      : { borderColor: '#EFE6DD', color: '#9A9088' }
                  }
                >
                  {PRIORITY_META[p].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Due date</label>
            <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {KANBAN_COLUMNS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Completion · {status === 'completed' ? 100 : completionPct}%</label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={status === 'completed' ? 100 : completionPct}
              disabled={status === 'completed'}
              onChange={(e) => setCompletionPct(Number(e.target.value))}
              className="mt-3 w-full accent-champagne"
            />
          </div>
        </div>

        <div>
          <label className="label">Checklist</label>
          <div className="space-y-1.5">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() =>
                    setChecklist((c) => c.map((x) => (x.id === item.id ? { ...x, done: !x.done } : x)))
                  }
                  className="h-4 w-4 accent-sage-deep"
                />
                <span className={`flex-1 text-sm ${item.done ? 'text-ink-faint line-through' : 'text-ink'}`}>
                  {item.text}
                </span>
                <button
                  onClick={() => setChecklist((c) => c.filter((x) => x.id !== item.id))}
                  className="text-ink-faint hover:text-clay"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className="input"
              placeholder="Add a subtask…"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
            />
            <button className="btn-outline px-3" onClick={addChecklistItem}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
