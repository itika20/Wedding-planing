import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, X } from 'lucide-react'
import { Calendar } from './Calendar'
import { cn, fmtDate } from '@/lib/utils'

interface Props {
  value: string // ISO yyyy-MM-dd or ''
  onChange: (iso: string) => void
  placeholder?: string
  clearable?: boolean
  className?: string
  align?: 'left' | 'right'
}

export function DateField({ value, onChange, placeholder = 'Pick a date', clearable, className, align = 'left' }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-left text-sm transition',
          open ? 'border-champagne ring-4 ring-champagne/15' : 'border-line hover:border-champagne/50',
          value ? 'text-ink' : 'text-ink-faint',
        )}
      >
        <CalendarDays size={15} className="shrink-0 text-ink-faint" />
        <span className="flex-1 truncate">{value ? fmtDate(value) : placeholder}</span>
        {clearable && value && (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
            }}
            className="rounded p-0.5 text-ink-faint hover:text-clay"
          >
            <X size={14} />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className={cn(
                'absolute z-50 mt-2 rounded-2xl border border-line bg-ivory p-3 shadow-lift',
                align === 'right' ? 'right-0' : 'left-0',
              )}
            >
              <Calendar value={value} onChange={(iso) => { onChange(iso); setOpen(false) }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
