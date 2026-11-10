/**
 * Hijri (Islamic) dates from the browser's built-in Umm al-Qura calendar
 * (`Intl`, `islamic-umalqura`). No network and no data files: works offline.
 *
 * Umm al-Qura is a calculated calendar. Dates announced locally from moon
 * sighting can differ by a day, and the Islamic day begins at sunset while
 * these dates change at midnight. The UI says so.
 */

export interface HijriDate {
  day: number
  /** 1 = Muharram … 12 = Dhul Hijjah. */
  month: number
  year: number
}

const numeric = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
})

/** The Umm al-Qura date of a (local) calendar day. */
export function toHijri(date: Date): HijriDate {
  const parts = numeric.formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value)
  return { day: part('day'), month: part('month'), year: part('year') }
}

function addDays(date: Date, days: number): Date {
  // Noon avoids skipping or repeating a day across daylight-saving changes.
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12)
}

/** Days in the Hijri month containing `date` (29 or 30). */
export function daysInHijriMonth(date: Date): number {
  const { day, month } = toHijri(date)
  let length = day
  while (toHijri(addDays(date, length - day + 1)).month === month) length += 1
  return length
}

export type HijriFormat = 'en' | 'ar' | 'bn'

const LOCALES: Record<HijriFormat, string> = { en: 'en', ar: 'ar-SA', bn: 'bn' }

/** The month's name, e.g. "Ramadan", "رمضان", "রমজান". */
export function hijriMonthName(date: Date, format: HijriFormat): string {
  return new Intl.DateTimeFormat(`${LOCALES[format]}-u-ca-islamic-umalqura`, { month: 'long' }).format(date)
}

/** "30 Jumada I 1448 AH", "٣٠ جمادى الأولى ١٤٤٨ هـ", "৩০ জমাদিউল আউয়াল ১৪৪৮ হিজরি". */
export function formatHijri(date: Date, format: HijriFormat): string {
  const formatter = new Intl.DateTimeFormat(`${LOCALES[format]}-u-ca-islamic-umalqura`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const parts = formatter.formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  const era = { en: 'AH', ar: 'هـ', bn: 'হিজরি' }[format]
  return `${value('day')} ${value('month')} ${value('year')} ${era}`
}

export interface IslamicDay {
  key: string
  en: string
  bn: string
  month: number
  day: number
}

/** Widely observed days, by their Hijri date. */
export const ISLAMIC_DAYS: readonly IslamicDay[] = [
  { key: 'new-year', en: 'Islamic New Year', bn: 'হিজরি নববর্ষ', month: 1, day: 1 },
  { key: 'ashura', en: 'Day of Ashura', bn: 'আশুরা', month: 1, day: 10 },
  { key: 'ramadan', en: 'Ramadan begins', bn: 'রমজান শুরু', month: 9, day: 1 },
  { key: 'eid-al-fitr', en: 'Eid al-Fitr', bn: 'ঈদুল ফিতর', month: 10, day: 1 },
  { key: 'arafah', en: 'Day of Arafah', bn: 'আরাফার দিন', month: 12, day: 9 },
  { key: 'eid-al-adha', en: 'Eid al-Adha', bn: 'ঈদুল আযহা', month: 12, day: 10 },
]

export interface UpcomingDay extends IslamicDay {
  /** 0 = today. */
  daysAway: number
  date: Date
}

/**
 * The next `count` Islamic days on or after `from`, soonest first. Also
 * includes the next Ayyam al-Bid (13th–15th of every month, recommended
 * fasting days) so there is always something near.
 */
export function upcomingIslamicDays(from: Date, count = 3): UpcomingDay[] {
  const found = new Map<string, UpcomingDay>()
  // A Hijri year is 354–355 days, so a little over a year finds every day.
  for (let offset = 0; offset <= 360 && found.size < ISLAMIC_DAYS.length + 1; offset += 1) {
    const date = addDays(from, offset)
    const { day, month } = toHijri(date)
    for (const event of ISLAMIC_DAYS) {
      if (!found.has(event.key) && event.month === month && event.day === day) {
        found.set(event.key, { ...event, daysAway: offset, date })
      }
    }
    if (!found.has('ayyam-al-bid') && day >= 13 && day <= 15) {
      found.set('ayyam-al-bid', {
        key: 'ayyam-al-bid',
        en: 'Ayyam al-Bid (white days)',
        bn: 'আইয়ামে বীজ',
        month,
        day,
        daysAway: offset,
        date,
      })
    }
  }
  return [...found.values()].sort((a, b) => a.daysAway - b.daysAway).slice(0, count)
}
