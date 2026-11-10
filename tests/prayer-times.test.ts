import { describe, expect, it } from 'vitest'
import { currentPrayer, DHAKA, nextPrayer, prayerTimes } from '@/lib/prayer-times'

/** "HH:MM" in Dhaka time. */
const dhaka = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: DHAKA.timeZone, hour: '2-digit', minute: '2-digit' }).format(date)

/** An instant given as Dhaka wall-clock time (UTC+6, no daylight saving). */
const at = (isoLocal: string) => new Date(`${isoLocal}+06:00`)

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

describe('Dhaka prayer times', () => {
  it('lists the six times in order through the day', () => {
    const times = prayerTimes(at('2026-11-11T09:00'))
    expect(times.map((p) => p.key)).toEqual(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'])
    const instants = times.map((p) => p.time.getTime())
    expect(instants).toEqual([...instants].sort((a, b) => a - b))
  })

  it('gives sensible November times for Dhaka', () => {
    const t = Object.fromEntries(prayerTimes(at('2026-11-11T09:00')).map((p) => [p.key, minutes(dhaka(p.time))]))
    // Sunrise ≈ 6:05–6:15 and sunset ≈ 5:10–5:20 in mid-November; noon ≈ 11:40–11:45.
    expect(t.sunrise).toBeGreaterThanOrEqual(minutes('06:05'))
    expect(t.sunrise).toBeLessThanOrEqual(minutes('06:15'))
    expect(t.maghrib).toBeGreaterThanOrEqual(minutes('17:10'))
    expect(t.maghrib).toBeLessThanOrEqual(minutes('17:20'))
    expect(t.dhuhr).toBeGreaterThanOrEqual(minutes('11:38'))
    expect(t.dhuhr).toBeLessThanOrEqual(minutes('11:46'))
    // 18° twilight is roughly 75–80 minutes from the horizon at this latitude.
    expect(t.sunrise! - t.fajr!).toBeGreaterThan(70)
    expect(t.isha! - t.maghrib!).toBeGreaterThan(70)
  })

  it('does not depend on the device time zone', () => {
    // The same instant always gives the same Dhaka day and times.
    const instant = at('2026-11-11T23:30')
    expect(prayerTimes(instant).map((p) => dhaka(p.time))).toEqual(
      prayerTimes(at('2026-11-11T08:00')).map((p) => dhaka(p.time)),
    )
  })

  it('finds the next prayer, and tomorrow’s Fajr after Isha', () => {
    expect(nextPrayer(at('2026-11-11T13:00')).key).toBe('asr')
    const late = nextPrayer(at('2026-11-11T22:00'))
    expect(late.key).toBe('fajr')
    expect(dhaka(late.time) < '06:00').toBe(true)
    expect(late.time > at('2026-11-11T22:00')).toBe(true)
  })

  it('knows the current prayer, with none between sunrise and Dhuhr', () => {
    expect(currentPrayer(at('2026-11-11T05:30'))).toBe('fajr')
    expect(currentPrayer(at('2026-11-11T09:00'))).toBeNull()
    expect(currentPrayer(at('2026-11-11T16:00'))).toBe('asr')
    expect(currentPrayer(at('2026-11-11T02:00'))).toBe('isha')
  })
})
