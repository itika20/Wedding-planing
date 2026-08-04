import type { User } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  user?: User | null
  size?: number
  ring?: boolean
  className?: string
}

export function Avatar({ user, size = 36, ring, className }: Props) {
  if (!user) {
    return (
      <div
        className={cn('flex items-center justify-center rounded-full bg-line text-ink-faint', className)}
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        ?
      </div>
    )
  }
  return (
    <div
      className={cn('flex items-center justify-center rounded-full', ring && 'ring-2 ring-white', className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        background: `linear-gradient(135deg, ${user.color}33, ${user.color}22)`,
        boxShadow: `inset 0 0 0 1.5px ${user.color}55`,
      }}
      title={user.name}
    >
      <span>{user.emoji}</span>
    </div>
  )
}
