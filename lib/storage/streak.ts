import type { IDBPTransaction } from 'idb'
import { toDateKey } from '@/lib/date'
import { applyActivityEvent, createEmptyActivity, type ActivityEvent } from '@/lib/streak'
import type { DailyActivity } from '@/lib/types'
import { getDB, type AsmaDB, type StoreName } from './db'

export async function getAllActivity(): Promise<DailyActivity[]> {
  const db = await getDB()
  return db.getAll('dailyActivity')
}

type ActivityTx = IDBPTransaction<AsmaDB, StoreName[], 'readwrite'>

/**
 * Records an activity event for today inside an existing transaction, so the
 * activity and the change that caused it are written atomically.
 */
export async function recordActivityInTx(
  tx: ActivityTx,
  event: ActivityEvent,
  date: string = toDateKey(),
): Promise<DailyActivity> {
  const store = tx.objectStore('dailyActivity')
  const existing = (await store.get(date)) ?? createEmptyActivity(date)
  const updated = applyActivityEvent(existing, event)
  // applyActivityEvent returns the same object when nothing changed.
  if (updated !== existing) await store.put(updated)
  return updated
}

export async function recordActivity(event: ActivityEvent, date: string = toDateKey()): Promise<DailyActivity> {
  const db = await getDB()
  const tx = db.transaction(['dailyActivity'], 'readwrite')
  const result = await recordActivityInTx(tx, event, date)
  await tx.done
  return result
}
