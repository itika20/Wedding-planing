import { motion } from 'framer-motion'

interface Props {
  value: number // 0..100
  color?: string
  track?: string
  height?: number
  className?: string
}

export function ProgressBar({ value, color = '#D4AF37', track = '#EFE6DD', height = 8, className }: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={className} style={{ background: track, height, borderRadius: 999 }}>
      <motion.div
        style={{ background: color, height, borderRadius: 999 }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
