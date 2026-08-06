import { useStore } from '@/store/useStore'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { findEvent } from '@/lib/events'
import { relativeTime } from '@/lib/utils'

export function ActivityFeed({ limit }: { limit?: number }) {
  const activity = useStore((s) => s.activity)
  const users = useStore((s) => s.users)
  const events = useStore((s) => s.settings.events)
  const list = limit ? activity.slice(0, limit) : activity

  if (list.length === 0) {
    return <EmptyState emoji="✨" title="No activity yet" hint="Actions from your family will show up here." />
  }

  return (
    <ol className="relative space-y-1">
      {list.map((a, i) => {
        const u = users.find((x) => x.id === a.userId)
        return (
          <li key={a.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Avatar user={u} size={30} />
              {i < list.length - 1 && <span className="my-1 w-px flex-1 bg-line" />}
            </div>
            <div className="pb-4">
              <p className="text-sm text-ink">
                <span className="font-semibold">{u?.name ?? 'Someone'}</span> {a.summary}
              </p>
              <p className="mt-0.5 text-xs text-ink-faint">
                {relativeTime(a.createdAt)}
                {a.eventKey && <> · {findEvent(events, a.eventKey).name}</>}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
