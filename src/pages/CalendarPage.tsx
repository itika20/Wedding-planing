import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { useStore } from '@/store/useStore'
import type { EventMeta } from '@/lib/types'
import { cn, daysUntil, fmtDate } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function parse(iso: string): Date | null {
  if (!iso) return null
  const d = parseISO(iso)
  return isNaN(d.getTime()) ? null : d
}

export function CalendarPage() {
  const settings = useStore((s) => s.settings)
  const navigate = useNavigate()

  const dated = useMemo(() => settings.events.filter((e) => e.date), [settings.events])
  const initial = useMemo(() => {
    const upcoming = [...dated].map((e) => parse(e.date)!).filter(Boolean).sort((a, b) => a.getTime() - b.getTime())
    const next = upcoming.find((d) => d >= new Date(new Date().toDateString()))
    return next ?? parse(settings.weddingDate) ?? new Date()
  }, [dated, settings.weddingDate])

  const [view, setView] = useState<Date>(initial)

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(view))
    const end = endOfWeek(endOfMonth(view))
    return eachDayOfInterval({ start, end })
  }, [view])

  const eventsByDay = (day: Date): EventMeta[] => dated.filter((e) => isSameDay(parse(e.date)!, day))
  const upcoming = [...dated]
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Calendar</h1>
        <p className="text-ink-soft">Your wedding events, laid out month by month.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">{format(view, 'MMMM yyyy')}</h2>
            <div className="flex gap-1">
              <button onClick={() => setView((v) => subMonths(v, 1))} className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition hover:bg-champagne/10 hover:text-champagne-deep">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setView(new Date())} className="rounded-lg px-3 text-sm font-medium text-ink-soft transition hover:bg-champagne/10 hover:text-champagne-deep">
                Today
              </button>
              <button onClick={() => setView((v) => addMonths(v, 1))} className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition hover:bg-champagne/10 hover:text-champagne-deep">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const inMonth = isSameMonth(day, view)
              const today = isToday(day)
              const dayEvents = eventsByDay(day)
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[74px] rounded-xl border p-1.5',
                    inMonth ? 'border-line bg-white' : 'border-transparent bg-transparent',
                    today && 'ring-1 ring-champagne/50',
                  )}
                >
                  <div className={cn('mb-1 text-right text-xs', today ? 'font-bold text-champagne-deep' : inMonth ? 'text-ink-soft' : 'text-ink-faint/50')}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => navigate(`/app/event/${e.id}`)}
                        className="flex w-full items-center gap-1 truncate rounded-md px-1.5 py-1 text-left text-[11px] font-medium text-white"
                        style={{ background: e.accent }}
                        title={`${e.name} · ${fmtDate(e.date)}`}
                      >
                        <span>{e.emoji}</span>
                        <span className="truncate">{e.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming list */}
        <div className="card h-fit p-5">
          <h3 className="mb-3 font-display text-lg font-semibold text-ink">Upcoming</h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-soft">No dated events yet. Add dates in Settings → Events &amp; dates.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((e) => (
                <button
                  key={e.id}
                  onClick={() => navigate(`/app/event/${e.id}`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 text-left transition hover:border-champagne/50 hover:shadow-soft"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg" style={{ background: `${e.accent}1a` }}>
                    {e.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{e.name}</p>
                    <p className="text-xs text-ink-faint">{fmtDate(e.date)}</p>
                  </div>
                  <span className="chip bg-ivory text-ink-soft">{daysUntil(e.date)}d</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
