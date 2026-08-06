import { useState } from 'react'
import { motion } from 'framer-motion'
import { MailCheck } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'

// Cloud-mode sign-in gate. Only shown when Supabase sync is configured and no
// family member is signed in. Magic-link email (no password) + optional Google.
export function Login() {
  const authError = useStore((s) => s.authError)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const sendLink = async () => {
    const addr = email.trim()
    if (!supabase || !addr) return
    setBusy(true)
    setErr(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { emailRedirectTo: window.location.origin },
    })
    setBusy(false)
    if (error) setErr(error.message)
    else setSent(true)
  }

  const google = async () => {
    if (!supabase) return
    setErr(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setErr(error.message)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-champagne/10 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-rose/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">💍</div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne-deep">Wedding 101</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Family sign-in</h1>
          <p className="mt-2 text-sm text-ink-soft">
            This dashboard is private to the family. Sign in with the email you were invited with.
          </p>
        </div>

        <div className="card p-6">
          {authError && (
            <div className="mb-4 rounded-xl border border-clay/30 bg-clay-soft/40 px-3 py-2.5 text-sm text-clay">
              {authError}
            </div>
          )}

          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-sage/15 text-sage-deep">
                <MailCheck size={22} />
              </div>
              <p className="font-medium text-ink">Check your email</p>
              <p className="text-sm text-ink-soft">
                We sent a sign-in link to <span className="font-medium text-ink">{email.trim()}</span>. Open it on this
                device to continue.
              </p>
              <button className="btn-ghost mt-1 text-sm" onClick={() => setSent(false)}>
                Use a different email
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  autoFocus
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendLink()}
                />
              </div>
              {err && <p className="text-sm text-clay">{err}</p>}
              <button className="btn-gold w-full justify-center" onClick={sendLink} disabled={busy || !email.trim()}>
                {busy ? 'Sending…' : 'Email me a sign-in link'}
              </button>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs text-ink-faint">or</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <button className="btn-outline w-full justify-center" onClick={google}>
                Continue with Google
              </button>
              <p className="pt-1 text-center text-xs text-ink-faint">
                Only invited family emails can get in. No passwords.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
