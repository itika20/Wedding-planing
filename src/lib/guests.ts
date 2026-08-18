import type { Guest } from './types'

// Overall (whole-wedding) head math, with sensible fallbacks for guests saved
// before expected/coming existed: everyone invited is expected, and a "yes"
// RSVP means the whole party is coming until the actual count is edited.
export const overallInvited = (g: Guest) => g.count || 1
export const overallExpected = (g: Guest) => g.expected ?? overallInvited(g)
export const overallComing = (g: Guest) => g.coming ?? (g.rsvp === 'yes' ? overallInvited(g) : 0)

// Head math for a given view: a specific function (using its per-event override
// when set) or the family's overall figure when viewing all guests.
export const invitedFor = (g: Guest, ev?: string) =>
  ev && g.perEvent?.[ev]?.invited != null ? g.perEvent[ev]!.invited! : overallInvited(g)
export const expectedFor = (g: Guest, ev?: string) =>
  ev && g.perEvent?.[ev]?.expected != null ? g.perEvent[ev]!.expected! : overallExpected(g)
export const comingFor = (g: Guest, ev?: string) =>
  ev && g.perEvent?.[ev]?.coming != null ? g.perEvent[ev]!.coming! : overallComing(g)
