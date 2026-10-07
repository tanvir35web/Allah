import { applyReview, applyStatus } from '@/lib/progress'
import type { DailyActivity, LearningProgress, LearningStatus } from '@/lib/types'
import { clearStores, getDB } from './db'
import { recordActivityInTx } from './streak'

export async function getAllProgress(): Promise<LearningProgress[]> {
  const db = await getDB()
  return db.getAll('progress')
}

export async function getProgress(nameId: number): Promise<LearningProgress | undefined> {
  const db = await getDB()
  return db.get('progress', nameId)
}

export interface StatusChangeResult {
  progress: LearningProgress
  /** Present when the change counted as a learning activity for today. */
  activity?: DailyActivity
}

/**
 * Sets a name's learning status. Marking a name as learned for the first time
 * also counts as today's learning activity (for the streak).
 */
export async function setNameStatus(
  nameId: number,
  status: LearningStatus,
  now: Date = new Date(),
): Promise<StatusChangeResult> {
  const db = await getDB()
  const tx = db.transaction(['progress', 'dailyActivity'], 'readwrite')
  const store = tx.objectStore('progress')
  const existing = await store.get(nameId)
  const progress = applyStatus(existing, nameId, status, now.toISOString())
  if (progress.status === 'not_started') await store.delete(nameId)
  else await store.put(progress)

  let activity: DailyActivity | undefined
  if (status === 'learned' && existing?.status !== 'learned') {
    activity = await recordActivityInTx(tx, { type: 'learned', nameId })
  }
  await tx.done
  return { progress, activity }
}

/** Records the result of a review card and counts it as today's activity. */
export async function recordNameReview(
  nameId: number,
  remembered: boolean,
  now: Date = new Date(),
): Promise<{ progress: LearningProgress; activity: DailyActivity }> {
  const db = await getDB()
  const tx = db.transaction(['progress', 'dailyActivity'], 'readwrite')
  const store = tx.objectStore('progress')
  const progress = applyReview(await store.get(nameId), nameId, remembered, now.toISOString())
  await store.put(progress)
  const activity = await recordActivityInTx(tx, { type: 'reviewed', nameId })
  await tx.done
  return { progress, activity }
}

/** Resets learning progress, review data and the streak history. */
export async function resetLearningProgress(): Promise<void> {
  await clearStores(['progress', 'reviewItems', 'dailyActivity'])
}
