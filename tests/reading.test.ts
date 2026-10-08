import 'fake-indexeddb/auto'
import { openDB } from 'idb'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { toDateKey } from '@/lib/date'
import { applyReading, formatClock, formatDuration, summarizeReading, type SurahRef } from '@/lib/reading'
import {
  clearAllData,
  closeDB,
  DB_NAME,
  getAllFavorites,
  getAllReadingDays,
  getAllSurahReadings,
  recordSurahReading,
  resetQuranReading,
} from '@/lib/storage'

const KAHF: SurahRef = { surahId: 18, surahName: 'Al-Kahf' }
const T1 = '2026-10-08T09:00:00.000Z'
const T2 = '2026-10-08T09:05:00.000Z'

describe('reading time', () => {
  it('adds time to a surah', () => {
    const first = applyReading(undefined, KAHF, 30, T1)
    expect(first).toEqual({ surahId: 18, surahName: 'Al-Kahf', seconds: 30, lastReadAt: T1 })
    expect(applyReading(first, KAHF, 15, T2)).toMatchObject({ seconds: 45, lastReadAt: T2 })
  })

  it('summarises today, the last 7 days and the total', () => {
    const readings = {
      18: applyReading(undefined, KAHF, 600, T1),
      112: applyReading(undefined, { surahId: 112, surahName: 'Al-Ikhlas' }, 60, T1),
    }
    const days = [
      { date: '2026-10-08', seconds: 300 },
      { date: '2026-10-02', seconds: 200 },
      { date: '2026-10-01', seconds: 160 },
    ]
    expect(summarizeReading(readings, days, '2026-10-08')).toEqual({
      todaySeconds: 300,
      weekSeconds: 500,
      totalSeconds: 660,
      surahsRead: 2,
    })
  })

  it('formats durations', () => {
    expect(formatDuration(42)).toBe('42 sec')
    expect(formatDuration(12 * 60 + 5)).toBe('12 min')
    expect(formatDuration(3600)).toBe('1 hr')
    expect(formatDuration(3600 + 5 * 60)).toBe('1 hr 5 min')
  })

  it('formats a running timer', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(42)).toBe('0:42')
    expect(formatClock(12 * 60 + 5)).toBe('12:05')
    expect(formatClock(3600 + 2 * 60 + 5)).toBe('1:02:05')
  })
})

describe('reading storage', () => {
  beforeEach(async () => {
    await closeDB()
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  })

  afterEach(async () => {
    await closeDB()
  })

  it('saves time to the surah and to today together', async () => {
    await recordSurahReading(KAHF, 90)
    await recordSurahReading(KAHF, 30)
    expect(await getAllSurahReadings()).toEqual([expect.objectContaining({ surahId: 18, seconds: 120 })])
    expect(await getAllReadingDays()).toEqual([{ date: toDateKey(), seconds: 120 }])
  })

  it('resets reading time, and clearing all data includes it', async () => {
    await recordSurahReading(KAHF, 90)
    await resetQuranReading()
    expect(await getAllSurahReadings()).toEqual([])
    await recordSurahReading(KAHF, 90)
    await clearAllData()
    expect(await getAllReadingDays()).toEqual([])
  })

  it('upgrades a version 1 database without losing data', async () => {
    const old = await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore('progress', { keyPath: 'nameId' }).createIndex('by-status', 'status')
        db.createObjectStore('favorites', { keyPath: 'nameId' })
        db.createObjectStore('quizResults', { keyPath: 'id' }).createIndex('by-completedAt', 'completedAt')
        db.createObjectStore('dailyActivity', { keyPath: 'date' })
        db.createObjectStore('settings', { keyPath: 'id' })
        db.createObjectStore('reviewItems', { keyPath: 'nameId' })
      },
    })
    await old.put('favorites', { nameId: 7, createdAt: T1 })
    old.close()

    await recordSurahReading(KAHF, 10)
    expect(await getAllSurahReadings()).toHaveLength(1)
    expect((await getAllFavorites()).map((favorite) => favorite.nameId)).toEqual([7])
  })
})
