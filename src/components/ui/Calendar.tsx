import { useMemo, useState } from 'react'
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
import { cn } from '@/lib/utils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface Props {
  value: string // ISO yyyy-MM-dd or ''
  onChange: (iso: string) => void
  className?: string
}

function safeParse(iso: string): Date | null {
  if (!iso) return null
  try {
    const d = parseISO(iso)
    return isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

export function Calendar({ value, onChange, className }: Props) {
  const selected = safeParse(value)
  const [view, setView] = useState<Date>(selected ?? new Date())

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(view), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(view), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [view])

  return (
    <div className={cn('w-[280px] select-none', className)}>
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setView((v) => subMonths(v, 1))}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft transition hover:bg-champagne/10 hover:text-champagne-deep"
          aria-label="Previous month"
        >
          <ChevronLeft size={17} />
        </button>
        <span className="font-display text-sm font-semibold text-ink">{format(view, 'MMMM yyyy')}</span>
        <button
          type="button"
          onClick={() => setView((v) => addMonths(v, 1))}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft transition hover:bg-champagne/10 hover:text-champagne-deep"
          aria-label="Next month"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="grid h-7 place-items-center text-[11px] font-semibold uppercase text-ink-faint">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const isSel = selected && isSameDay(day, selected)
          const inMonth = isSameMonth(day, view)
          const today = isToday(day)
          return (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => onChange(format(day, 'yyyy-MM-dd'))}
              className={cn(
                'grid h-9 place-items-center rounded-lg text-sm transition',
                isSel && 'bg-champagne font-semibold text-white shadow-soft',
                !isSel && inMonth && 'text-ink hover:bg-champagne/10',
                !isSel && !inMonth && 'text-ink-faint/60 hover:bg-champagne/5',
                !isSel && today && 'font-semibold text-champagne-deep ring-1 ring-inset ring-champagne/40',
              )}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
