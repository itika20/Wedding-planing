// Shared-passcode session, used by the serverless API functions.
// A correct passcode mints a signed, HttpOnly cookie; every data endpoint checks it.
import * as crypto from 'node:crypto'
import type { VercelRequest } from '@vercel/node'

const COOKIE = 'wd_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days, in seconds

function secret(): string {
  return process.env.SESSION_SECRET || ''
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function makeToken(): string {
  const exp = Date.now() + MAX_AGE * 1000
  const payload = `v1.${exp}`
  return `${payload}.${sign(payload)}`
}

export function verifyToken(token?: string): boolean {
  if (!token || !secret()) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [v, exp, sig] = parts
  const expected = sign(`${v}.${exp}`)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false
  return Number(exp) > Date.now()
}

// Constant-time passcode comparison.
export function passcodeOk(input: unknown): boolean {
  const expected = process.env.FAMILY_PASSCODE || ''
  if (!expected || typeof input !== 'string') return false
  const a = Buffer.from(input)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function sessionCookie(token: string): string {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`
}

export function clearCookie(): string {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}

function readCookie(req: VercelRequest): string | undefined {
  const raw = req.headers.cookie || ''
  const m = raw.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`))
  return m ? m[1] : undefined
}

export function isAuthed(req: VercelRequest): boolean {
  return verifyToken(readCookie(req))
}
