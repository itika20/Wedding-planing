import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  color?: string
  bg?: string
  className?: string
  dot?: boolean
}

export function Badge({ children, color = '#6B6259', bg = '#F1EAE3', className, dot }: Props) {
  return (
    <span className={cn('chip', className)} style={{ color, background: bg }}>
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  )
}
