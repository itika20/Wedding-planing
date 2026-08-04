import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#D4AF37', '#D89CA4', '#8CA98C', '#E0A458', '#D98A7B', '#B87883']

interface Piece {
  id: number
  x: number
  color: string
  delay: number
  rotate: number
  size: number
}

export function Confetti({ fire }: { fire: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    if (!fire) return
    const next: Piece[] = Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.3,
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 8,
    }))
    setPieces(next)
    const t = setTimeout(() => setPieces([]), 2600)
    return () => clearTimeout(t)
  }, [fire])

  if (!pieces.length) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0"
          style={{ left: `${p.x}%`, width: p.size, height: p.size * 0.6, background: p.color, borderRadius: 2 }}
          initial={{ y: -40, opacity: 1, rotate: p.rotate }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: p.rotate + 360 }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}
