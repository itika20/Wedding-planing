import { motion } from 'framer-motion'

interface Props {
  value: number // 0..100
  size?: number
  stroke?: number
  color?: string
  track?: string
  label?: React.ReactNode
  sublabel?: string
}

export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  color = '#D4AF37',
  track = '#EFE6DD',
  label,
  sublabel,
}: Props) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  const offset = c - (clamped / 100) * c

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ?? <span className="font-display text-lg font-semibold text-ink">{clamped}%</span>}
        {sublabel && <span className="text-[10px] uppercase tracking-wide text-ink-faint">{sublabel}</span>}
      </div>
    </div>
  )
}
