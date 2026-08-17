import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CalendarDays, CalendarHeart, Check, Plus, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { EventMeta } from '@/lib/types'
import { blankSettings } from '@/lib/settings'
import { nextAccent } from '@/lib/events'
import { useStore } from '@/store/useStore'
import { Calendar } from '@/components/ui/Calendar'
import { DateField } from '@/components/ui/DateField'
import { fmtDate } from '@/lib/utils'

export function SetupWizard() {
  const existing = useStore((s) => s.settings)
  const completeSetup = useStore((s) => s.completeSetup)

  const [step, setStep] = useState(existing.setupDone ? 2 : 1)
  const [weddingDate, setWeddingDate] = useState(existing.weddingDate)
  const [events, setEvents] = useState<EventMeta[]>(() => existing.events.map((e) => ({ ...e })))

  const setEvent = (id: string, patch: Partial<EventMeta>) =>
    setEvents((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  const addEvent = () =>
    setEvents((list) => [
      ...list,
      { id: nanoid(8), name: '', emoji: '🎊', accent: nextAccent(list.length), date: '' },
    ])
  const removeEvent = (id: string) => setEvents((list) => list.filter((e) => e.id !== id))

  const finish = () => {
    const cleaned = events
      .map((e) => ({
        ...e,
        name: e.name.trim(),
        emoji: e.emoji.trim() || '🎊',
        // The Wedding event always falls on the wedding date — no second question.
        date: e.id === 'wedding' ? weddingDate : e.date,
      }))
      .filter((e) => e.name.length > 0)
    completeSetup({ ...blankSettings(), setupDone: true, weddingDate, events: cleaned })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-champagne/10 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-rose/15 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">💍</div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne-deep">Wedding 101</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            {existing.setupDone ? 'Edit your wedding' : "Let's set up your wedding"}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {step === 1 ? 'First, when is the big day?' : 'Add the events/functions you want to plan. Add or remove any.'}
          </p>
        </div>

        <div className="mb-5 flex items-center justify-center gap-2">
          {[1, 2].map((s) => (
            <span key={s} className={`h-1.5 rounded-full transition-all ${step === s ? 'w-6 bg-champagne' : 'w-2 bg-line'}`} />
          ))}
        </div>

        <div className="card p-6">
          {step === 1 ? (
            <div>
              <label className="label flex items-center justify-center gap-1.5 text-center">
                <CalendarHeart size={13} className="text-champagne-deep" /> Choose your wedding date
              </label>
              <div className="mt-2 flex justify-center">
                <Calendar value={weddingDate} onChange={setWeddingDate} />
              </div>
              <div className="mt-3 rounded-xl bg-champagne/10 py-2.5 text-center text-sm">
                {weddingDate ? (
                  <span className="font-semibold text-champagne-deep">{fmtDate(weddingDate, 'EEEE, d MMMM yyyy')}</span>
                ) : (
                  <span className="text-ink-faint">Tap a day above to set the big day ✨</span>
                )}
              </div>
              <button className="btn-gold mt-4 w-full" disabled={!weddingDate} onClick={() => setStep(2)}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div>
              <div className="space-y-2">
                {events.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 rounded-xl border border-line bg-white p-2">
                    <input
                      className="w-10 shrink-0 rounded-lg border border-line bg-ivory py-2 text-center text-lg outline-none focus:border-champagne"
                      value={e.emoji}
                      maxLength={2}
                      aria-label="Emoji"
                      onChange={(ev) => setEvent(e.id, { emoji: ev.target.value })}
                    />
                    <input
                      className="min-w-0 flex-1 rounded-lg border border-line px-2.5 py-2 text-sm outline-none focus:border-champagne"
                      placeholder="Event name (e.g. Haldi)"
                      value={e.name}
                      onChange={(ev) => setEvent(e.id, { name: ev.target.value })}
                    />
                    {e.id === 'wedding' ? (
                      <div
                        className="flex w-[150px] shrink-0 items-center gap-2 rounded-xl border border-line bg-ivory px-3 py-2.5 text-sm text-ink-soft"
                        title="This is your wedding date from the previous step"
                      >
                        <CalendarDays size={15} className="shrink-0 text-champagne-deep" />
                        <span className="truncate">{weddingDate ? fmtDate(weddingDate) : 'Wedding day'}</span>
                      </div>
                    ) : (
                      <DateField
                        value={e.date}
                        onChange={(iso) => setEvent(e.id, { date: iso })}
                        placeholder="Date (optional)"
                        clearable
                        align="right"
                        className="w-[150px] shrink-0"
                      />
                    )}
                    <button
                      onClick={() => removeEvent(e.id)}
                      className="shrink-0 rounded-lg p-1.5 text-ink-faint transition hover:bg-clay-soft/50 hover:text-clay"
                      aria-label="Remove event"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="rounded-xl border border-dashed border-line py-4 text-center text-sm text-ink-faint">
                    No events yet — add your first one.
                  </p>
                )}
              </div>

              <button
                onClick={addEvent}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-sm font-medium text-champagne-deep transition hover:border-champagne hover:bg-champagne/5"
              >
                <Plus size={15} /> Add event
              </button>

              <div className="mt-5 flex gap-2">
                <button className="btn-outline" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn-gold flex-1" onClick={finish} disabled={events.every((e) => !e.name.trim())}>
                  <Check size={16} /> {existing.setupDone ? 'Save changes' : 'Start planning'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
