import { toDateKey } from '@/lib/date'
import { addReadingTime, applyReading, type SurahRef } from '@/lib/reading'
import type { ReadingDay, SurahReading } from '@/lib/types'
import { clearStores, getDB } from './db'

export async function getAllSurahReadings(): Promise<SurahReading[]> {
  const db = await getDB()
  return db.getAll('surahReading')
}

export async function getAllReadingDays(): Promise<ReadingDay[]> {
  const db = await getDB()
  return db.getAll('readingDays')
}

/** Adds reading time to the surah and to today, atomically. */
export async function recordSurahReading(
  surah: SurahRef,
  seconds: number,
  now: Date = new Date(),
): Promise<{ reading: SurahReading; day: ReadingDay }> {
  const db = await getDB()
  const tx = db.transaction(['surahReading', 'readingDays'], 'readwrite')
  const readings = tx.objectStore('surahReading')
  const days = tx.objectStore('readingDays')
  const date = toDateKey(now)
  const reading = applyReading(await readings.get(surah.surahId), surah, seconds, now.toISOString())
  const day = addReadingTime(await days.get(date), date, seconds)
  await readings.put(reading)
  if (day.seconds > 0) await days.put(day)
  await tx.done
  return { reading, day }
}

/** Clears Quran reading time. */
export async function resetQuranReading(): Promise<void> {
  await clearStores(['surahReading', 'readingDays'])
}
