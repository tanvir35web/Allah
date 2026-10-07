import { dayNumber, type DateKey } from '@/lib/date'
import type { AllahName } from '@/lib/types'

/** Deterministic index for a local date: same day → same index, no network needed. */
export function calculateDayIndex(date: DateKey, total: number): number {
  if (total <= 0) return 0
  return ((dayNumber(date) % total) + total) % total
}

export function getDailyName(names: readonly AllahName[], date: DateKey): AllahName {
  const name = names[calculateDayIndex(date, names.length)]
  if (!name) throw new Error('Names data is empty')
  return name
}
