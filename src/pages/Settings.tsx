import { useNavigate } from 'react-router-dom'
import { Cloud, HardDrive, RefreshCw } from 'lucide-react'
import { useStore, useCurrentUser } from '@/store/useStore'
import { Avatar } from '@/components/ui/Avatar'
import { EVENTS, WEDDING_DATE } from '@/data/config'
import { fmtDate, relativeTime } from '@/lib/utils'

export function Settings() {
  const users = useStore((s) => s.users)
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const mode = useStore((s) => s.mode)
  const showToast = useStore((s) => s.showToast)
  const current = useCurrentUser()
  const navigate = useNavigate()

  const resetData = () => {
    localStorage.removeItem('wedding-dashboard:snapshot:v2')
    showToast('Local data reset — reloading', 'info')
    setTimeout(() => window.location.reload(), 600)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Settings</h1>
        <p className="text-ink-soft">Manage profiles, sync, and your workspace.</p>
      </div>

      {/* Profiles */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Family profiles</h2>
        <p className="mb-4 text-sm text-ink-soft">Everyone can view and edit all details. Tap to switch.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setCurrentUser(u.id)
                showToast(`Switched to ${u.name}`)
              }}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
                current?.id === u.id ? 'border-champagne bg-champagne/5' : 'border-line hover:border-champagne/40'
              }`}
            >
              <Avatar user={u} size={48} />
              <span className="text-sm font-semibold text-ink">{u.name}</span>
              <span className="text-[11px] text-ink-faint">Active {relativeTime(u.lastActive)}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setCurrentUser(null)
            navigate('/')
          }}
          className="btn-outline mt-4"
        >
          Back to profile screen
        </button>
      </section>

      {/* Sync */}
      <section className="card p-6">
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${mode === 'cloud' ? 'bg-sage-soft text-sage-deep' : 'bg-line text-ink-soft'}`}>
            {mode === 'cloud' ? <Cloud size={18} /> : <HardDrive size={18} />}
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              {mode === 'cloud' ? 'Cloud sync is on' : 'Running in local mode'}
            </h2>
            <p className="text-sm text-ink-soft">
              {mode === 'cloud'
                ? 'Changes sync live across every device your family uses.'
                : 'Data is saved in this browser only. Add Supabase keys to sync across devices.'}
            </p>
          </div>
        </div>

        {mode === 'local' && (
          <div className="mt-4 rounded-xl border border-line bg-offwhite/60 p-4 text-sm text-ink-soft">
            <p className="font-semibold text-ink">To enable cloud sync</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Create a free project at supabase.com</li>
              <li>Run the SQL in <code className="rounded bg-white px-1 py-0.5 text-xs">supabase/schema.sql</code></li>
              <li>Copy your Project URL & anon key into <code className="rounded bg-white px-1 py-0.5 text-xs">.env.local</code></li>
              <li>Restart the dev server — you'll see “Synced”.</li>
            </ol>
            <p className="mt-2 text-xs">Full steps are in the project README.</p>
          </div>
        )}
      </section>

      {/* Events summary */}
      <section className="card p-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Events & dates</h2>
        <div className="divide-y divide-line">
          {EVENTS.map((e) => (
            <div key={e.key} className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-2 text-sm text-ink">
                <span className="text-lg">{e.emoji}</span> {e.name}
              </span>
              <span className="text-sm text-ink-soft">{fmtDate(e.date)}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          The big day: <span className="font-semibold text-ink">{fmtDate(WEDDING_DATE)}</span>
        </p>
        <div className="mt-4 rounded-xl border border-line bg-offwhite/60 p-4 text-sm text-ink-soft">
          <p className="font-semibold text-ink">Make it your wedding</p>
          <p className="mt-1">
            Profiles, events, dates and budgets all live in one file:{' '}
            <code className="rounded bg-white px-1 py-0.5 text-xs">src/data/config.ts</code>. Edit it, then reset
            the sample data below to start fresh.
          </p>
        </div>
      </section>

      {/* Danger */}
      <section className="card border-clay-soft p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Reset local data</h2>
        <p className="mb-3 text-sm text-ink-soft">
          Clears everything stored in this browser and reloads the seed data. {mode === 'cloud' && 'Cloud data is not affected.'}
        </p>
        <button onClick={resetData} className="btn-outline border-clay text-clay hover:bg-clay-soft/40">
          <RefreshCw size={15} /> Reset to sample data
        </button>
      </section>
    </div>
  )
}
