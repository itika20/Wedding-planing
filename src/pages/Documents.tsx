import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, FileText, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCollections } from '@/store/useCollections'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { DocumentItem } from '@/lib/types'

const FOLDERS = ['Contracts', 'Bills & receipts', 'Invitations', 'Designs', 'Guest lists', 'Other']

export function Documents() {
  const docs = useCollections((s) => s.documents)
  const add = useCollections((s) => s.add)
  const update = useCollections((s) => s.update)
  const remove = useCollections((s) => s.remove)

  const [editing, setEditing] = useState<DocumentItem | null>(null)
  const [open, setOpen] = useState(false)

  const grouped = useMemo(() => {
    const map = new Map<string, DocumentItem[]>()
    for (const d of docs) {
      const k = d.category || 'Other'
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(d)
    }
    return [...map.entries()]
  }, [docs])

  const openNew = () => {
    setEditing(null)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Documents</h1>
          <p className="text-ink-soft">Keep contracts, bills and designs one click away.</p>
        </div>
        <button className="btn-gold" onClick={openNew}>
          <Plus size={16} /> Add document
        </button>
      </div>

      {docs.length === 0 ? (
        <EmptyState
          emoji="📁"
          title="No documents yet"
          hint="Add a link to any contract, bill or design (e.g. a Google Drive or Dropbox share link)."
          action={<button className="btn-gold" onClick={openNew}><Plus size={16} /> Add document</button>}
        />
      ) : (
        <div className="space-y-5">
          {grouped.map(([folder, list]) => (
            <div key={folder}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                <FolderOpen size={15} className="text-champagne-deep" /> {folder}
                <Badge>{list.length}</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map((d) => (
                  <div key={d.id} className="group card flex items-center gap-3 p-3.5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-champagne/10 text-champagne-deep">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{d.name}</p>
                      {d.notes && <p className="truncate text-xs text-ink-faint">{d.notes}</p>}
                      {d.link && (
                        <a
                          href={d.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-champagne-deep hover:underline"
                        >
                          <ExternalLink size={11} /> Open
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button onClick={() => { setEditing(d); setOpen(true) }} className="rounded-md p-1.5 text-ink-faint hover:bg-ink/5 hover:text-ink">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => remove('documents', d.id)} className="rounded-md p-1.5 text-ink-faint hover:bg-clay-soft/50 hover:text-clay">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentModal
        open={open}
        onClose={() => setOpen(false)}
        doc={editing}
        onSave={(data) => {
          if (editing) update('documents', editing.id, data)
          else add('documents', data)
          setOpen(false)
        }}
      />
    </div>
  )
}

function DocumentModal({
  open,
  onClose,
  doc,
  onSave,
}: {
  open: boolean
  onClose: () => void
  doc: DocumentItem | null
  onSave: (data: Omit<DocumentItem, 'id' | 'createdAt'>) => void
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Contracts')
  const [link, setLink] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setName(doc?.name ?? '')
    setCategory(doc?.category ?? 'Contracts')
    setLink(doc?.link ?? '')
    setNotes(doc?.notes ?? '')
  }, [open, doc])

  const canSave = name.trim().length > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doc ? 'Edit document' : 'Add document'}
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-gold"
            disabled={!canSave}
            onClick={() => onSave({ name: name.trim(), category, link: link.trim(), notes: notes.trim() })}
          >
            {doc ? 'Save' : 'Add document'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input className="input" autoFocus value={name} placeholder="e.g. Venue contract" onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Folder</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {FOLDERS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Share link</label>
          <input className="input" value={link} placeholder="https://drive.google.com/…" onChange={(e) => setLink(e.target.value)} />
          <p className="mt-1 text-xs text-ink-faint">Paste a Drive / Dropbox / photos link so everyone can open it.</p>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[60px] resize-none" value={notes} placeholder="Anything worth remembering…" onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
