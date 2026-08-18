// Who a shopping item is for. Used to group the Shopping page (like guest
// categories) and offered as the "For" options on tasks and shopping items.
// "Other" is both a pickable option and the bucket for anything untagged.
export const SHOP_CATEGORIES = ['Itika', 'Ishita', 'Mummy', 'Papa', 'Sayyam and Fam', 'Other'] as const
export const SHOP_OTHER = 'Other'

// Resolve a category label to its bucket, folding unknown/empty into "Other".
export function shopCategory(forWhom?: string | null): string {
  return forWhom && (SHOP_CATEGORIES as readonly string[]).includes(forWhom) ? forWhom : SHOP_OTHER
}
