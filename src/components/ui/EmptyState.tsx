interface Props {
  emoji?: string
  title: string
  hint?: string
  action?: React.ReactNode
}

export function EmptyState({ emoji = '🌸', title, hint, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/50 px-6 py-14 text-center">
      <div className="mb-3 text-4xl">{emoji}</div>
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-ink-soft">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
