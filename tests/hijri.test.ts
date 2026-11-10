import { describe, expect, it } from 'vitest'
import { daysInHijriMonth, formatHijri, hijriMonthName, toHijri, upcomingIslamicDays } from '@/lib/hijri'

/** Local noon, so the tests do not depend on the machine's time zone. */
const on = (year: number, month: number, day: number) => new Date(year, month - 1, day, 12)

describe('Hijri dates (Umm al-Qura)', () => {
  it('converts Gregorian days to Hijri', () => {
    // 1 Ramadan 1445 and 1 Shawwal 1445 (Eid al-Fitr) in the Umm al-Qura calendar.
    expect(toHijri(on(2024, 3, 11))).toEqual({ day: 1, month: 9, year: 1445 })
    expect(toHijri(on(2024, 4, 10))).toEqual({ day: 1, month: 10, year: 1445 })
  })

  it('formats the date and month in English, Arabic and Bangla', () => {
    const date = on(2024, 3, 11)
    expect(formatHijri(date, 'en')).toBe('1 Ramadan 1445 AH')
    expect(formatHijri(date, 'ar')).toMatch(/رمضان .*هـ$/)
    expect(formatHijri(date, 'bn')).toMatch(/হিজরি$/)
    expect(hijriMonthName(date, 'en')).toBe('Ramadan')
  })

  it('knows the length of the month', () => {
    // Ramadan 1445 had 30 days in Umm al-Qura (11 March to 9 April 2024).
    expect(daysInHijriMonth(on(2024, 3, 20))).toBe(30)
    expect([29, 30]).toContain(daysInHijriMonth(on(2026, 11, 10)))
  })

  it('lists upcoming Islamic days soonest first, counting today as 0', () => {
    const upcoming = upcomingIslamicDays(on(2024, 3, 11), 6)
    expect(upcoming[0]).toMatchObject({ key: 'ramadan', daysAway: 0 })
    expect(upcoming.map((day) => day.key)).toContain('eid-al-fitr')
    expect(upcoming.find((day) => day.key === 'eid-al-fitr')?.daysAway).toBe(30)
    const gaps = upcoming.map((day) => day.daysAway)
    expect(gaps).toEqual([...gaps].sort((a, b) => a - b))
  })
})
