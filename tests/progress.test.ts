import { describe, expect, it } from 'vitest'
import { allahNames } from '@/data/allah-names'
import {
  applyReview,
  applyStatus,
  getStatus,
  nextNameToLearn,
  progressPercentage,
  summarizeProgress,
  type ProgressMap,
} from '@/lib/progress'
import { applyQuizToReviewItems, getReviewRecommendations } from '@/lib/review'

const NOW = '2026-03-10T09:00:00.000Z'
const LATER = '2026-03-12T09:00:00.000Z'

function mapOf(...entries: ReturnType<typeof applyStatus>[]): ProgressMap {
  return Object.fromEntries(entries.map((entry) => [entry.nameId, entry]))
}

describe('learning status', () => {
  it('marks a name as learned and records when', () => {
    const progress = applyStatus(undefined, 1, 'learned', NOW)
    expect(progress).toMatchObject({ nameId: 1, status: 'learned', learnedAt: NOW, reviewCount: 0 })
  })

  it('keeps the original learnedAt when marked learned again', () => {
    const first = applyStatus(undefined, 1, 'learned', NOW)
    expect(applyStatus(first, 1, 'learned', LATER).learnedAt).toBe(NOW)
  })

  it('unmarks a learned name back to learning', () => {
    const learned = applyStatus(undefined, 1, 'learned', NOW)
    const learning = applyStatus(learned, 1, 'learning', LATER)
    expect(learning.status).toBe('learning')
  })

  it('resets a name to not started and clears its history', () => {
    const reviewed = applyReview(applyStatus(undefined, 1, 'learned', NOW), 1, true, LATER)
    const reset = applyStatus(reviewed, 1, 'not_started', LATER)
    expect(reset).toEqual({ nameId: 1, status: 'not_started', reviewCount: 0, updatedAt: LATER })
  })

  it('defaults to not started', () => {
    expect(getStatus({}, 5)).toBe('not_started')
  })
})

describe('progress summary', () => {
  it('computes counts and percentage', () => {
    const progress = mapOf(
      applyStatus(undefined, 1, 'learned', NOW),
      applyStatus(undefined, 2, 'learned', NOW),
      applyStatus(undefined, 3, 'learning', NOW),
    )
    expect(summarizeProgress(progress, 99)).toEqual({
      learned: 2,
      learning: 1,
      notStarted: 96,
      total: 99,
      percentage: 2,
    })
  })

  it('rounds and clamps the percentage', () => {
    expect(progressPercentage(23, 99)).toBe(23)
    expect(progressPercentage(99, 99)).toBe(100)
    expect(progressPercentage(0, 0)).toBe(0)
  })

  it('suggests the next name, preferring ones in progress', () => {
    expect(nextNameToLearn(allahNames, {})?.id).toBe(1)
    const progress = mapOf(applyStatus(undefined, 1, 'learned', NOW), applyStatus(undefined, 7, 'learning', NOW))
    expect(nextNameToLearn(allahNames, progress)?.id).toBe(7)
    expect(nextNameToLearn(allahNames, progress, 7)?.id).toBe(8)
  })

  it('returns nothing when every name is learned', () => {
    const progress = mapOf(...allahNames.map((name) => applyStatus(undefined, name.id, 'learned', NOW)))
    expect(nextNameToLearn(allahNames, progress)).toBeUndefined()
  })
})

describe('review recommendations', () => {
  it('recommends a recently learned name the next day', () => {
    const progress = mapOf(applyStatus(undefined, 1, 'learned', '2026-03-09T10:00:00'))
    expect(getReviewRecommendations(progress, {}, '2026-03-09')).toEqual([])
    expect(getReviewRecommendations(progress, {}, '2026-03-10')).toMatchObject([{ nameId: 1, reason: 'recent' }])
  })

  it('spaces reviews further apart after successful reviews', () => {
    let entry = applyStatus(undefined, 1, 'learned', '2026-03-01T10:00:00')
    entry = applyReview(entry, 1, true, '2026-03-02T10:00:00')
    entry = applyReview(entry, 1, true, '2026-03-04T10:00:00') // reviewCount 2 → 4-day interval
    expect(getReviewRecommendations(mapOf(entry), {}, '2026-03-07')).toEqual([])
    expect(getReviewRecommendations(mapOf(entry), {}, '2026-03-08')).toMatchObject([{ nameId: 1, reason: 'due' }])
  })

  it('prioritises names missed in a quiz until they are reviewed', () => {
    const progress = mapOf(applyStatus(undefined, 2, 'learned', '2026-03-01T10:00:00'))
    const items = Object.fromEntries(
      applyQuizToReviewItems({}, [{ nameId: 5, isCorrect: false }], '2026-03-10T08:00:00').map((item) => [item.nameId, item]),
    )
    const recommendations = getReviewRecommendations(progress, items, '2026-03-10')
    expect(recommendations[0]).toMatchObject({ nameId: 5, reason: 'mistakes' })

    const reviewed = mapOf(progress[2]!, applyReview(undefined, 5, true, '2026-03-10T09:00:00'))
    expect(getReviewRecommendations(reviewed, items, '2026-03-10').some((r) => r.nameId === 5)).toBe(false)
  })

  it('tracks correct and incorrect quiz counts per name', () => {
    const items = applyQuizToReviewItems(
      {},
      [
        { nameId: 1, isCorrect: true },
        { nameId: 1, isCorrect: false },
        { nameId: 2, isCorrect: true },
      ],
      NOW,
    )
    expect(items).toEqual([
      { nameId: 1, correctCount: 1, incorrectCount: 1, lastCorrectAt: NOW, lastIncorrectAt: NOW },
      { nameId: 2, correctCount: 1, incorrectCount: 0, lastCorrectAt: NOW },
    ])
  })
})
