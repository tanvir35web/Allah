import { applyQuizToReviewItems } from '@/lib/review'
import type { DailyActivity, QuizResult, ReviewItem } from '@/lib/types'
import { clearStores, getDB } from './db'
import { recordActivityInTx } from './streak'

/** All quiz results, newest first. */
export async function getQuizResults(): Promise<QuizResult[]> {
  const db = await getDB()
  const results = await db.getAllFromIndex('quizResults', 'by-completedAt')
  return results.reverse()
}

export async function getQuizResult(id: string): Promise<QuizResult | undefined> {
  const db = await getDB()
  return db.get('quizResults', id)
}

export interface SaveQuizResult {
  result: QuizResult
  reviewItems: ReviewItem[]
  activity: DailyActivity
}

/**
 * Saves a completed quiz, updates per-name review statistics and counts the
 * quiz as today's learning activity — all in one transaction.
 */
export async function saveQuizResult(result: QuizResult): Promise<SaveQuizResult> {
  const db = await getDB()
  const tx = db.transaction(['quizResults', 'reviewItems', 'dailyActivity'], 'readwrite')
  await tx.objectStore('quizResults').put(result)

  const reviewStore = tx.objectStore('reviewItems')
  const existing: Record<number, ReviewItem> = {}
  for (const nameId of new Set(result.answers.map((answer) => answer.nameId))) {
    const item = await reviewStore.get(nameId)
    if (item) existing[nameId] = item
  }
  const reviewItems = applyQuizToReviewItems(existing, result.answers, result.completedAt)
  await Promise.all(reviewItems.map((item) => reviewStore.put(item)))

  const activity = await recordActivityInTx(tx, { type: 'quiz' })
  await tx.done
  return { result, reviewItems, activity }
}

/** Removes quiz history and the quiz-based review statistics. */
export async function resetQuizHistory(): Promise<void> {
  await clearStores(['quizResults', 'reviewItems'])
}
