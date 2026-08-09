import { isAuthed } from '../server/auth'
import { fetchSnapshot } from '../server/neon'

export default async function handler(req: any, res: any) {
  try {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Not signed in' })
    const snap = await fetchSnapshot()
    return res.status(200).json(snap)
  } catch (err: any) {
    console.error('[snapshot]', err)
    return res.status(500).json({ error: err?.message || 'Could not read the database' })
  }
}
