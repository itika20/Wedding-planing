import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { Modal } from '@/components/ui/Modal'
import { useStore } from '@/store/useStore'
import { allEvents, findEvent } from '@/lib/events'
import { Avatar } from '@/components/ui/Avatar'
import { nowISO } from '@/lib/utils'
import type { ChecklistItem, EventKey, Task, TaskStatus } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  task?: Task | null
  defaultEvent?: EventKey
  defaultStatus?: TaskStatus
}

export function TaskModal({ open, onClose, task, defaultEvent, defaultStatus = 'todo' }: Props) {
  const users = useStore((s) => s.users)
  const eventsMeta = useStore((s) => s.settings.events)
  const currentUserId = useStore((s) => s.currentUserId)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const editing = Boolean(task)

  const allEv = allEvents(eventsMeta)
  const fallbackEvent = defaultEvent || allEv[1]?.id || 'common'
  const targetEventId = task ? task.eventKey : fallbackEvent
  const targetEvent = findEvent(eventsMeta, targetEventId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setChecklist(task?.checklist ?? [])
    setNewItem('')
  }, [open, task])

  const canSave = title.trim().length > 0

  const submit = () => {
    if (!canSave) return
    if (task) {
      updateTask(task.id, { title: title.trim(), description: description.trim(), checklist })
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        eventKey: fallbackEvent,
        status: defaultStatus,
        checklist,
      })
    }
    onClose()
  }

  const addChecklistItem = () => {
    if (!newItem.trim()) return
    setChecklist((c) => [...c, { id: nanoid(6), text: newItem.trim(), done: false, checkedBy: null }])
    setNewItem('')
  }

  const toggleItem = (id: string) =>
    setChecklist((c) =>
      c.map((x) => {
        if (x.id !== id) return x
        const done = !x.done
        return { ...x, done, checkedBy: done ? currentUserId ?? null : null, checkedAt: done ? nowISO() : null }
      }),
    )

  const doneCount = checklist.filter((c) => c.done).length

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit task' : 'New task'}
      subtitle={
        <span className="inline-flex items-center gap-1">
          in <span className="font-medium text-ink">{targetEvent.emoji} {targetEvent.name}</span>
        </span>
      }
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-gold" onClick={submit} disabled={!canSave}>
            {editing ? 'Save' : 'Add task'}
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

        <div>
          <label className="label flex items-center justify-between">
            <span>Subtasks</span>
            {checklist.length > 0 && (
              <span className="font-normal normal-case tracking-normal text-ink-faint">
                {doneCount}/{checklist.length} done
              </span>
            )}
          </label>

          <div className="space-y-1.5">
            {checklist.map((item) => {
              const by = users.find((u) => u.id === item.checkedBy)
              return (
                <div key={item.id} className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-2.5 py-2">
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
                      item.done ? 'border-champagne bg-champagne text-white' : 'border-line hover:border-champagne'
                    }`}
                    aria-label={item.done ? 'Mark subtask undone' : 'Mark subtask done'}
                  >
                    {item.done && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${item.done ? 'text-ink-faint line-through' : 'text-ink'}`}>
                    {item.text}
                  </span>
                  {item.done && by && (
                    <span className="flex items-center gap-1 rounded-full bg-champagne/10 py-0.5 pl-0.5 pr-2 text-[11px] font-medium text-champagne-deep">
                      <Avatar user={by} size={18} /> {by.name}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setChecklist((c) => c.filter((x) => x.id !== item.id))}
                    className="shrink-0 text-ink-faint transition hover:text-clay"
                    aria-label="Remove subtask"
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            })}
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
          <p className="mt-1.5 text-xs text-ink-faint">Tick a subtask and your name is shown next to it.</p>
        </div>
      </div>
    </Modal>
  )
}
