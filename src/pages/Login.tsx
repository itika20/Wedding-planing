import { useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound } from 'lucide-react'
import { useStore } from '@/store/useStore'

// Cloud-mode gate. Shown when the app is deployed (VITE_USE_CLOUD=1) and there's
// no family session yet. One shared passcode, kept in the backend.
export function Login() {
  const signIn = useStore((s) => s.signIn)
  const authError = useStore((s) => s.authError)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!code.trim() || busy) return
    setBusy(true)
    await signIn(code)
    setBusy(false)
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
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Family access</h1>
          <p className="mt-2 text-sm text-ink-soft">This dashboard is private. Enter the passcode your family shares.</p>
        </div>

        <div className="card p-6">
          <label className="label flex items-center gap-1.5">
            <KeyRound size={13} className="text-champagne-deep" /> Passcode
          </label>
          <input
            type="password"
            className="input"
            value={code}
            autoFocus
            placeholder="Enter the family passcode"
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {authError && <p className="mt-2 text-sm text-clay">{authError}</p>}
          <button className="btn-gold mt-4 w-full justify-center" onClick={submit} disabled={busy || !code.trim()}>
            {busy ? 'Checking…' : 'Enter'}
          </button>
          <p className="mt-3 text-center text-xs text-ink-faint">Ask whoever set up the dashboard for the passcode.</p>
        </div>
      </motion.div>
    </div>
  )
}
