import type { VercelRequest, VercelResponse } from '@vercel/node'
import { makeToken, passcodeOk, sessionCookie } from '../server/auth'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const passcode = (req.body || {}).passcode
  if (!passcodeOk(passcode)) return res.status(401).json({ error: 'That passcode is not right.' })
  res.setHeader('Set-Cookie', sessionCookie(makeToken()))
  return res.status(200).json({ ok: true })
}
