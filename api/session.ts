import { isAuthed } from '../server/auth'

export default function handler(req: any, res: any) {
  try {
    const authed = isAuthed(req)
    return res.status(authed ? 200 : 401).json({ authed })
  } catch (err: any) {
    console.error('[session]', err)
    return res.status(500).json({ error: err?.message || 'Server error' })
  }
}
