/**
 * Local-calendar date helpers.
 *
 * Activity is grouped by the user's *local* calendar day, stored as a
 * `YYYY-MM-DD` key. Day arithmetic is done on UTC-midnight timestamps derived
 * from those keys, so daylight-saving transitions never shift a day.
 */

const MS_PER_DAY = 86_400_000

export type DateKey = string

const pad = (value: number) => String(value).padStart(2, '0')

/** Returns the local calendar date of `date` as `YYYY-MM-DD`. */
export function toDateKey(date: Date = new Date()): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Days since 1970-01-01 for a date key (timezone independent). */
export function dayNumber(key: DateKey): number {
  const [year, month, day] = key.split('-').map(Number)
  if (!year || !month || !day) throw new Error(`Invalid date key: ${key}`)
  return Math.round(Date.UTC(year, month - 1, day) / MS_PER_DAY)
}

export function fromDayNumber(days: number): DateKey {
  const date = new Date(days * MS_PER_DAY)
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export function addDays(key: DateKey, amount: number): DateKey {
  return fromDayNumber(dayNumber(key) + amount)
}

/** Whole calendar days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: DateKey, to: DateKey): number {
  return dayNumber(to) - dayNumber(from)
}

/** Local date key for an ISO timestamp. */
export function isoToDateKey(iso: string): DateKey {
  return toDateKey(new Date(iso))
}
