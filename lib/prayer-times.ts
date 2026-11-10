/**
 * Prayer times, calculated on the device (no network) with the standard
 * astronomical method used by PrayTimes.org.
 *
 * Settings follow common practice in Bangladesh: University of Islamic
 * Sciences, Karachi (Fajr and Isha at 18° below the horizon) and the Hanafi
 * Asr (shadow twice an object's length). These are astronomical times;
 * mosques and the Islamic Foundation timetable may add a few minutes of
 * precaution, so local times can differ slightly.
 */

export interface Location {
  name: string
  latitude: number
  longitude: number
  /** IANA time zone, e.g. "Asia/Dhaka". */
  timeZone: string
}

export const DHAKA: Location = { name: 'Dhaka', latitude: 23.8103, longitude: 90.4125, timeZone: 'Asia/Dhaka' }

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export interface PrayerTime {
  key: PrayerKey
  en: string
  bn: string
  /** False for sunrise, which marks the end of Fajr rather than a prayer. */
  isPrayer: boolean
  time: Date
}

const NAMES: Record<PrayerKey, { en: string; bn: string }> = {
  fajr: { en: 'Fajr', bn: 'ফজর' },
  sunrise: { en: 'Sunrise', bn: 'সূর্যোদয়' },
  dhuhr: { en: 'Dhuhr', bn: 'যোহর' },
  asr: { en: 'Asr', bn: 'আসর' },
  maghrib: { en: 'Maghrib', bn: 'মাগরিব' },
  isha: { en: 'Isha', bn: 'এশা' },
}

const FAJR_ANGLE = 18
const ISHA_ANGLE = 18
/** Sun's upper edge on the horizon, with refraction. */
const RISE_SET_ANGLE = 0.833
/** Hanafi: the shadow is twice the object's length (Shafi'i would be 1). */
const ASR_SHADOW = 2

const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI
const fix = (a: number, b: number) => {
  const value = a - b * Math.floor(a / b)
  return value < 0 ? value + b : value
}
const sin = (d: number) => Math.sin(rad(d))
const cos = (d: number) => Math.cos(rad(d))
const tan = (d: number) => Math.tan(rad(d))
const arcsin = (x: number) => deg(Math.asin(x))
const arccos = (x: number) => deg(Math.acos(x))
const arccot = (x: number) => deg(Math.atan(1 / x))
const arctan2 = (y: number, x: number) => deg(Math.atan2(y, x))

function julianDay(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1
    month += 12
  }
  const a = Math.floor(year / 100)
  const b = 2 - a + Math.floor(a / 4)
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5
}

/** The sun's declination and the equation of time, for a Julian day. */
function sunPosition(jd: number): { declination: number; equation: number } {
  const d = jd - 2451545.0
  const g = fix(357.529 + 0.98560028 * d, 360)
  const q = fix(280.459 + 0.98564736 * d, 360)
  const l = fix(q + 1.915 * sin(g) + 0.02 * sin(2 * g), 360)
  const e = 23.439 - 0.00000036 * d
  const ra = fix(arctan2(cos(e) * sin(l), cos(l)) / 15, 24)
  return { declination: arcsin(sin(e) * sin(l)), equation: q / 15 - ra }
}

/** The local calendar day (year, month, day) of `date` in a time zone. */
export function dayIn(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value)
  return { year: part('year'), month: part('month'), day: part('day') }
}

/**
 * The day's prayer times at a location, as absolute instants. `date` picks
 * the calendar day in the location's time zone.
 */
export function prayerTimes(date: Date, location: Location = DHAKA): PrayerTime[] {
  const { year, month, day } = dayIn(date, location.timeZone)
  const { latitude: lat, longitude: lng } = location
  const jd = julianDay(year, month, day) - lng / (15 * 24)

  // Times below are in hours of "local solar" time; `t` is a rough guess of
  // the time of day, as a fraction, used to sample the sun's position.
  const noon = (t: number) => fix(12 - sunPosition(jd + t).equation, 24)
  const angleTime = (angle: number, t: number, beforeNoon: boolean) => {
    const { declination } = sunPosition(jd + t)
    const hours = arccos((-sin(angle) - sin(declination) * sin(lat)) / (cos(declination) * cos(lat))) / 15
    return noon(t) + (beforeNoon ? -hours : hours)
  }
  const asrTime = (t: number) => {
    const { declination } = sunPosition(jd + t)
    return angleTime(-arccot(ASR_SHADOW + tan(Math.abs(lat - declination))), t, false)
  }

  const hours: Record<PrayerKey, number> = {
    fajr: angleTime(FAJR_ANGLE, 5 / 24, true),
    sunrise: angleTime(RISE_SET_ANGLE, 6 / 24, true),
    dhuhr: noon(12 / 24),
    asr: asrTime(13 / 24),
    maghrib: angleTime(RISE_SET_ANGLE, 18 / 24, false),
    isha: angleTime(ISHA_ANGLE, 18 / 24, false),
  }

  // Local solar hours → UTC: subtract the longitude's offset (15° per hour).
  const midnightUtc = Date.UTC(year, month - 1, day)
  return (Object.keys(hours) as PrayerKey[]).map((key) => ({
    key,
    ...NAMES[key],
    isPrayer: key !== 'sunrise',
    time: new Date(midnightUtc + (hours[key] - lng / 15) * 3_600_000),
  }))
}

/** The next prayer after `now` (tomorrow's Fajr after Isha). */
export function nextPrayer(now: Date, location: Location = DHAKA): PrayerTime {
  const upcoming = prayerTimes(now, location).find((prayer) => prayer.isPrayer && prayer.time > now)
  if (upcoming) return upcoming
  const tomorrow = new Date(now.getTime() + 86_400_000)
  return prayerTimes(tomorrow, location)[0] as PrayerTime
}

/**
 * The prayer whose time it is now, or null between sunrise and Dhuhr (when
 * Fajr has ended and no obligatory prayer is due).
 */
export function currentPrayer(now: Date, location: Location = DHAKA): PrayerKey | null {
  const today = prayerTimes(now, location)
  const passed = today.filter((prayer) => prayer.time <= now)
  const last = passed.at(-1)
  if (!last) return 'isha' // after midnight, before Fajr: still Isha's time
  return last.key === 'sunrise' ? null : last.key
}
