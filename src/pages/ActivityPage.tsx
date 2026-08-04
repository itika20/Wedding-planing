import { ActivityFeed } from '@/components/activity/ActivityFeed'

export function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Activity</h1>
        <p className="text-ink-soft">Everything your family has been up to.</p>
      </div>
      <div className="card max-w-2xl p-6">
        <ActivityFeed />
      </div>
    </div>
  )
}
