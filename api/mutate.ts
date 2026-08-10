import { isAuthed } from '../server/auth'
import {
  addActivity,
  deleteCollection,
  deleteTask,
  saveSettings,
  upsertCollection,
  upsertTask,
  upsertUser,
} from '../server/neon'

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    if (!isAuthed(req)) return res.status(401).json({ error: 'Not signed in' })

    const { op, data } = req.body || {}
    switch (op) {
      case 'upsertTask':
        await upsertTask(data)
        break
      case 'deleteTask':
        await deleteTask(data.id)
        break
      case 'addActivity':
        await addActivity(data)
        break
      case 'upsertUser':
        await upsertUser(data)
        break
      case 'saveSettings':
        await saveSettings(data)
        break
      case 'upsertCollection':
        await upsertCollection(data.kind, data.item)
        break
      case 'deleteCollection':
        await deleteCollection(data.id)
        break
      default:
        return res.status(400).json({ error: `Unknown op: ${op}` })
    }
    return res.status(200).json({ ok: true })
  } catch (err: any) {
    console.error('[mutate]', err)
    return res.status(500).json({ error: err?.message || 'Write failed' })
  }
}
