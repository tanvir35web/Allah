import { daysBetween, isoToDateKey, type DateKey } from '@/lib/date'
import type { ProgressMap } from '@/lib/progress'
import type { ReviewItem } from '@/lib/types'

/** Days to wait before the next review, indexed by successful review count. */
export const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30] as const
export const REVIEW_SESSION_SIZE = 10

export type ReviewReason = 'mistakes' | 'recent' | 'due'

export interface ReviewRecommendation {
  nameId: number
  reason: ReviewReason
  priority: number
}

export const REVIEW_REASON_LABELS: Record<ReviewReason, string> = {
  mistakes: 'Missed in a quiz',
  recent: 'Recently learned',
  due: 'Not reviewed recently',
}

function intervalFor(reviewCount: number): number {
  const index = Math.min(reviewCount, REVIEW_INTERVALS.length - 1)
  return REVIEW_INTERVALS[index] ?? 1
}

/**
 * A simple spaced-review recommender.
 *
 * A name is due when:
 * - it was answered incorrectly in a quiz after its last review, or
 * - its interval (based on successful reviews) has elapsed since it was last
 *   reviewed (or learned).
 */
export function getReviewRecommendations(
  progress: ProgressMap,
  reviewItems: Record<number, ReviewItem>,
  today: DateKey,
  limit = REVIEW_SESSION_SIZE,
): ReviewRecommendation[] {
  const ids = new Set<number>([
    ...Object.values(progress)
      .filter((entry) => entry.status !== 'not_started')
      .map((entry) => entry.nameId),
    ...Object.values(reviewItems)
      .filter((item) => item.incorrectCount > 0)
      .map((item) => item.nameId),
  ])

  const recommendations: ReviewRecommendation[] = []
  for (const nameId of ids) {
    const entry = progress[nameId]
    const item = reviewItems[nameId]
    const lastReviewedAt = entry?.lastReviewedAt

    const unresolvedMistake =
      !!item?.lastIncorrectAt && (!lastReviewedAt || item.lastIncorrectAt > lastReviewedAt)
    if (unresolvedMistake) {
      recommendations.push({ nameId, reason: 'mistakes', priority: 100 + (item?.incorrectCount ?? 0) })
      continue
    }

    if (!entry || entry.status === 'not_started') continue
    const anchor = lastReviewedAt ?? entry.learnedAt ?? entry.updatedAt
    const elapsed = daysBetween(isoToDateKey(anchor), today)
    const overdue = elapsed - intervalFor(entry.reviewCount)
    if (overdue < 0) continue

    const isRecent = entry.reviewCount === 0 && !lastReviewedAt
    recommendations.push({
      nameId,
      reason: isRecent ? 'recent' : 'due',
      priority: (isRecent ? 50 : 0) + overdue + (entry.status === 'learning' ? 5 : 0),
    })
  }

  return recommendations
    .sort((a, b) => b.priority - a.priority || a.nameId - b.nameId)
    .slice(0, limit)
}

/** Updates per-name quiz statistics from a finished quiz. */
export function applyQuizToReviewItems(
  items: Record<number, ReviewItem>,
  answers: readonly { nameId: number; isCorrect: boolean }[],
  now: string,
): ReviewItem[] {
  const updated = new Map<number, ReviewItem>()
  for (const answer of answers) {
    const current = updated.get(answer.nameId) ??
      items[answer.nameId] ?? { nameId: answer.nameId, correctCount: 0, incorrectCount: 0 }
    updated.set(
      answer.nameId,
      answer.isCorrect
        ? { ...current, correctCount: current.correctCount + 1, lastCorrectAt: now }
        : { ...current, incorrectCount: current.incorrectCount + 1, lastIncorrectAt: now },
    )
  }
  return [...updated.values()]
}
