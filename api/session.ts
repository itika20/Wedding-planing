import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthed } from '../server/auth'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const authed = isAuthed(req)
  return res.status(authed ? 200 : 401).json({ authed })
}
