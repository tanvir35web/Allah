import { daysBetween, type DateKey } from '@/lib/date'
import type { ReadingDay, SurahReading } from '@/lib/types'

/** The surah a reading report is about. */
export type SurahRef = Pick<SurahReading, 'surahId' | 'surahName'>

/** Adds reading time to a surah's record. */
export function applyReading(
  existing: SurahReading | undefined,
  { surahId, surahName }: SurahRef,
  seconds: number,
  now: string,
): SurahReading {
  return {
    surahId,
    surahName,
    seconds: (existing?.seconds ?? 0) + Math.max(0, Math.round(seconds)),
    lastReadAt: now,
  }
}

export function addReadingTime(existing: ReadingDay | undefined, date: DateKey, seconds: number): ReadingDay {
  return { date, seconds: (existing?.seconds ?? 0) + Math.max(0, Math.round(seconds)) }
}

export interface ReadingSummary {
  todaySeconds: number
  /** Today and the six days before it. */
  weekSeconds: number
  totalSeconds: number
  /** Surahs with any reading time. */
  surahsRead: number
}

export function summarizeReading(
  readings: Record<number, SurahReading>,
  days: readonly ReadingDay[],
  today: DateKey | null,
): ReadingSummary {
  const entries = Object.values(readings)
  const inLastWeek = (date: DateKey) => {
    if (!today) return false
    const age = daysBetween(date, today)
    return age >= 0 && age < 7
  }
  return {
    todaySeconds: days.find((day) => day.date === today)?.seconds ?? 0,
    weekSeconds: days.filter((day) => inLastWeek(day.date)).reduce((sum, day) => sum + day.seconds, 0),
    totalSeconds: entries.reduce((sum, entry) => sum + entry.seconds, 0),
    surahsRead: entries.filter((entry) => entry.seconds > 0).length,
  }
}

/** "45 sec", "12 min", "1 hr 5 min". */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  if (total < 60) return `${total} sec`
  const minutes = Math.floor(total / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`
}

/** A running timer: "0:42", "12:05", "1:02:05". */
export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = String(total % 60).padStart(2, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${secs}` : `${minutes}:${secs}`
}
