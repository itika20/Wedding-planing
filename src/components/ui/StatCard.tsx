import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  accent?: string
  className?: string
  index?: number
}

export function StatCard({ icon, label, value, sub, accent = '#D4AF37', className, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn('card card-hover p-5', className)}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</span>
        <span
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ background: `${accent}1a`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold text-ink">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-soft">{sub}</div>}
    </motion.div>
  )
}
