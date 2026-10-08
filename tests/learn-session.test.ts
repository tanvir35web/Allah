import { describe, expect, it } from 'vitest'
import { allahNames } from '@/data/allah-names'
import { countOutcomes, learnSessionSize, planLearnSession, recallQuestionType } from '@/lib/learn-session'
import { applyStatus, type ProgressMap } from '@/lib/progress'

const NOW = '2026-03-10T09:00:00.000Z'

function progressOf(statuses: Record<number, 'learning' | 'learned'>): ProgressMap {
  return Object.fromEntries(
    Object.entries(statuses).map(([id, status]) => [id, applyStatus(undefined, Number(id), status, NOW)]),
  )
}

describe('learn session', () => {
  it('starts from Name 1 for a new learner', () => {
    expect(planLearnSession(allahNames, {}, 3)).toEqual([1, 2, 3])
  })

  it('puts Names still being learned first, then new ones in order', () => {
    const progress = progressOf({ 1: 'learned', 2: 'learned', 5: 'learning' })
    expect(planLearnSession(allahNames, progress, 3)).toEqual([5, 3, 4])
  })

  it('returns nothing once all 99 are learned', () => {
    const all = progressOf(Object.fromEntries(allahNames.map((name) => [name.id, 'learned' as const])))
    expect(planLearnSession(allahNames, all, 3)).toEqual([])
  })

  it('sizes the session to what is left of the daily goal, or a full goal once met', () => {
    expect(learnSessionSize(3, 0)).toBe(3)
    expect(learnSessionSize(3, 2)).toBe(1)
    expect(learnSessionSize(3, 3)).toBe(3)
    expect(learnSessionSize(3, 5)).toBe(3)
  })

  it('checks recall in the reader’s language', () => {
    expect(recallQuestionType('en')).toBe('meaning')
    expect(recallQuestionType('both')).toBe('meaning')
    expect(recallQuestionType('bn')).toBe('bangla')
  })

  it('counts outcomes', () => {
    expect(countOutcomes(['learned', 'missed', 'learned', 'skipped'])).toEqual({ learned: 2, missed: 1, skipped: 1 })
  })
})
