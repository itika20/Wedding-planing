import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const META: Record<string, { emoji: string; title: string; blurb: string; features: string[] }> = {
  vendors: {
    emoji: '🏪',
    title: 'Vendors',
    blurb: 'A directory of every photographer, caterer, decorator and more — with quotes, advances, and payment tracking.',
    features: ['Contacts & quotes', 'Advance vs balance', 'Contracts & ratings', 'Booking status'],
  },
  guests: {
    emoji: '👥',
    title: 'Guests',
    blurb: 'Your full guest list with RSVPs, food preferences, accommodation, and side (bride / groom).',
    features: ['RSVP tracking', 'Invitations sent', 'Food & stay', 'VIP tagging'],
  },
  calendar: {
    emoji: '📅',
    title: 'Calendar',
    blurb: 'A colour-coded monthly view of every event, deadline, vendor meeting and payment reminder.',
    features: ['Event timeline', 'Task deadlines', 'Payment reminders', 'Drag to reschedule'],
  },
  documents: {
    emoji: '📁',
    title: 'Documents',
    blurb: 'Central storage for contracts, bills, invitation designs, and receipts — organised in folders.',
    features: ['Contracts & bills', 'Invitation designs', 'Receipts', 'PDF / image / Excel'],
  },
  shopping: {
    emoji: '🛍️',
    title: 'Shopping',
    blurb: 'Track everything to buy for the bride, groom, parents, decor and gifts against budget.',
    features: ['By person & category', 'Budget vs actual', 'Purchased status', 'Store & receipts'],
  },
}

export function Placeholder({ page }: { page: string }) {
  const m = META[page] ?? { emoji: '✨', title: page, blurb: 'Coming soon.', features: [] }
  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden p-8 text-center">
        <div className="mb-4 text-5xl">{m.emoji}</div>
        <h1 className="font-display text-3xl font-semibold text-ink">{m.title}</h1>
        <span className="mt-2 inline-block rounded-full bg-champagne/15 px-3 py-1 text-xs font-semibold text-champagne-deep">
          Next up
        </span>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">{m.blurb}</p>
        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-2">
          {m.features.map((f) => (
            <div key={f} className="rounded-xl border border-line bg-offwhite/50 px-3 py-2.5 text-sm text-ink-soft">
              {f}
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-soft">
          Meanwhile, most of this already lives inside each event's <span className="font-medium text-ink">Tasks</span> and{' '}
          <span className="font-medium text-ink">Expenses</span> tabs.
        </p>
        <Link to="/app/home" className="btn-gold mt-4 inline-flex">
          Back to dashboard
        </Link>
      </motion.div>
    </div>
  )
}
