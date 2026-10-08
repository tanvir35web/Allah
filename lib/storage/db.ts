/**
 * IndexedDB connection and schema.
 *
 * This is the only module that opens the database. Feature modules
 * (progress, favorites, quiz, streak, settings, review) build on `getDB()`.
 *
 * Versioning: bump DB_VERSION and add a new `if (oldVersion < N)` block in
 * `upgrade`. Blocks run in order, so users upgrading from any older version
 * get every migration they missed.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  AppSettings,
  DailyActivity,
  FavoriteRecord,
  LearningProgress,
  QuizResult,
  ReadingDay,
  ReviewItem,
  SurahReading,
} from '@/lib/types'

export const DB_NAME = 'asma-ul-husna'
export const DB_VERSION = 2

export interface SettingsRecord extends AppSettings {
  id: 'app'
}

export interface AsmaDB extends DBSchema {
  progress: { key: number; value: LearningProgress; indexes: { 'by-status': string } }
  favorites: { key: number; value: FavoriteRecord }
  quizResults: { key: string; value: QuizResult; indexes: { 'by-completedAt': string } }
  dailyActivity: { key: string; value: DailyActivity }
  settings: { key: string; value: SettingsRecord }
  reviewItems: { key: number; value: ReviewItem }
  surahReading: { key: number; value: SurahReading }
  readingDays: { key: string; value: ReadingDay }
}

export type StoreName =
  | 'progress'
  | 'favorites'
  | 'quizResults'
  | 'dailyActivity'
  | 'settings'
  | 'reviewItems'
  | 'surahReading'
  | 'readingDays'
export const ALL_STORES: StoreName[] = [
  'progress',
  'favorites',
  'quizResults',
  'dailyActivity',
  'settings',
  'reviewItems',
  'surahReading',
  'readingDays',
]

export class StorageUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('IndexedDB is not available in this browser context.')
    this.name = 'StorageUnavailableError'
    this.cause = cause
  }
}

let dbPromise: Promise<IDBPDatabase<AsmaDB>> | null = null

export function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== 'undefined'
}

export function getDB(): Promise<IDBPDatabase<AsmaDB>> {
  if (!isIndexedDBSupported()) return Promise.reject(new StorageUnavailableError())
  if (!dbPromise) {
    dbPromise = openDB<AsmaDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const progress = db.createObjectStore('progress', { keyPath: 'nameId' })
          progress.createIndex('by-status', 'status')
          db.createObjectStore('favorites', { keyPath: 'nameId' })
          const quiz = db.createObjectStore('quizResults', { keyPath: 'id' })
          quiz.createIndex('by-completedAt', 'completedAt')
          db.createObjectStore('dailyActivity', { keyPath: 'date' })
          db.createObjectStore('settings', { keyPath: 'id' })
          db.createObjectStore('reviewItems', { keyPath: 'nameId' })
        }
        if (oldVersion < 2) {
          // Quran reading time, per surah and per day.
          db.createObjectStore('surahReading', { keyPath: 'surahId' })
          db.createObjectStore('readingDays', { keyPath: 'date' })
        }
        // Future migrations: if (oldVersion < 3) { ... }
      },
      blocking() {
        // A newer version of the app wants to upgrade: release our connection.
        void dbPromise?.then((db) => db.close())
        dbPromise = null
      },
      terminated() {
        dbPromise = null
      },
    }).catch((error: unknown) => {
      dbPromise = null
      throw new StorageUnavailableError(error)
    })
  }
  return dbPromise
}

/** Closes the cached connection (used by tests and after deleting data). */
export async function closeDB(): Promise<void> {
  if (!dbPromise) return
  const pending = dbPromise
  dbPromise = null
  try {
    ;(await pending).close()
  } catch {
    // ignore: the connection never opened
  }
}

export async function clearStores(stores: StoreName[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(stores, 'readwrite')
  await Promise.all([...stores.map((store) => tx.objectStore(store).clear()), tx.done])
}

/** Asks the browser not to evict our data under storage pressure (best effort). */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      return (await navigator.storage.persisted()) || (await navigator.storage.persist())
    }
  } catch {
    // not supported
  }
  return false
}
