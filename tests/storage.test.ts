import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { toDateKey } from '@/lib/date'
import {
  clearAllData,
  closeDB,
  DB_NAME,
  getAllActivity,
  getAllFavorites,
  getAllProgress,
  getAllReviewItems,
  getQuizResults,
  getSettings,
  loadAllData,
  recordNameReview,
  resetLearningProgress,
  resetQuizHistory,
  saveQuizResult,
  setNameStatus,
  toggleFavorite,
  updateSettings,
} from '@/lib/storage'
import type { QuizResult } from '@/lib/types'

function quiz(id: string, completedAt: string): QuizResult {
  return {
    id,
    mode: 'meaning',
    scope: 'all',
    total: 2,
    correct: 1,
    startedAt: completedAt,
    completedAt,
    answers: [
      { questionType: 'meaning', nameId: 1, selectedNameId: 1, isCorrect: true },
      { questionType: 'meaning', nameId: 2, selectedNameId: 3, isCorrect: false },
    ],
  }
}

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

describe('IndexedDB storage', () => {
  it('persists a learned name and records today’s activity atomically', async () => {
    const { progress, activity } = await setNameStatus(4, 'learned')
    expect(progress.status).toBe('learned')
    expect(activity?.date).toBe(toDateKey())
    expect(await getAllProgress()).toHaveLength(1)
    expect((await getAllActivity())[0]?.learnedNames).toEqual([4])
  })

  it('does not record activity again when an already learned name is re-marked', async () => {
    await setNameStatus(4, 'learned')
    const again = await setNameStatus(4, 'learned')
    expect(again.activity).toBeUndefined()
  })

  it('removes the record when a name is reset to not started', async () => {
    await setNameStatus(4, 'learning')
    await setNameStatus(4, 'not_started')
    expect(await getAllProgress()).toEqual([])
  })

  it('toggles favorites', async () => {
    expect(await toggleFavorite(9)).toBe(true)
    expect((await getAllFavorites()).map((f) => f.nameId)).toEqual([9])
    expect(await toggleFavorite(9)).toBe(false)
    expect(await getAllFavorites()).toEqual([])
  })

  it('saves quizzes newest first with review stats and activity', async () => {
    await saveQuizResult(quiz('a', '2026-01-01T10:00:00.000Z'))
    await saveQuizResult(quiz('b', '2026-01-02T10:00:00.000Z'))
    expect((await getQuizResults()).map((r) => r.id)).toEqual(['b', 'a'])
    const items = await getAllReviewItems()
    expect(items.find((item) => item.nameId === 2)).toMatchObject({ incorrectCount: 2, correctCount: 0 })
    const [today] = await getAllActivity()
    expect(today).toMatchObject({ quizCompleted: true, quizzesCompleted: 2 })
  })

  it('records reviews', async () => {
    await setNameStatus(3, 'learned')
    const { progress } = await recordNameReview(3, true)
    expect(progress.reviewCount).toBe(1)
    expect(progress.lastReviewedAt).toBeDefined()
  })

  it('merges settings with defaults', async () => {
    expect((await getSettings()).theme).toBe('system')
    await updateSettings({ theme: 'dark', onboardingComplete: true })
    const settings = await getSettings()
    expect(settings).toMatchObject({ theme: 'dark', onboardingComplete: true, language: 'both', dailyGoal: 3 })
  })

  it('resets progress and quiz history independently', async () => {
    await setNameStatus(1, 'learned')
    await toggleFavorite(1)
    await saveQuizResult(quiz('a', '2026-01-01T10:00:00.000Z'))

    await resetQuizHistory()
    expect(await getQuizResults()).toEqual([])
    expect(await getAllProgress()).toHaveLength(1)

    await resetLearningProgress()
    expect(await getAllProgress()).toEqual([])
    expect(await getAllActivity()).toEqual([])
    expect(await getAllFavorites()).toHaveLength(1)
  })

  it('clears all data', async () => {
    await setNameStatus(1, 'learned')
    await updateSettings({ onboardingComplete: true })
    await clearAllData()
    const data = await loadAllData()
    expect(data.progress).toEqual([])
    expect(data.settings.onboardingComplete).toBe(false)
  })
})
