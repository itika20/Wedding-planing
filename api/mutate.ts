import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthed } from '../server/auth'
import { addActivity, deleteTask, upsertTask, upsertUser } from '../server/neon'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not signed in' })

  const { op, data } = req.body || {}
  try {
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
      default:
        return res.status(400).json({ error: `Unknown op: ${op}` })
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[mutate]', op, err)
    return res.status(500).json({ error: 'Write failed' })
  }
}
