import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthed } from '../server/auth'
import { fetchSnapshot } from '../server/neon'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not signed in' })
  try {
    const snap = await fetchSnapshot()
    return res.status(200).json(snap)
  } catch (err) {
    console.error('[snapshot]', err)
    return res.status(500).json({ error: 'Could not read the database' })
  }
}
