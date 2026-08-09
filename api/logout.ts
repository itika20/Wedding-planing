import { clearCookie } from '../server/auth'

export default function handler(_req: any, res: any) {
  try {
    res.setHeader('Set-Cookie', clearCookie())
    return res.status(200).json({ ok: true })
  } catch (err: any) {
    console.error('[logout]', err)
    return res.status(500).json({ error: err?.message || 'Server error' })
  }
}
