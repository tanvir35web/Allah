import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, toDateKey } from '@/lib/date'
import { applyActivityEvent, computeStreakStats, createEmptyActivity, isActiveDay, recentDays } from '@/lib/streak'
import type { DailyActivity } from '@/lib/types'

const TODAY = '2026-03-10'

function learnedOn(date: string, ...ids: number[]): DailyActivity {
  return { ...createEmptyActivity(date), learnedNames: ids.length ? ids : [1] }
}

function quizOn(date: string): DailyActivity {
  return applyActivityEvent(createEmptyActivity(date), { type: 'quiz' })
}

describe('date helpers', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })

  it('does arithmetic across month, year and DST boundaries', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01')
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2) // EU DST change
  })
})

describe('streak calculation', () => {
  it('starts at zero with no activity', () => {
    expect(computeStreakStats([], TODAY)).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalLearningDays: 0,
      todayActive: false,
    })
  })

  it('counts the first activity as a one-day streak', () => {
    const stats = computeStreakStats([learnedOn(TODAY)], TODAY)
    expect(stats.currentStreak).toBe(1)
    expect(stats.todayActive).toBe(true)
    expect(stats.totalLearningDays).toBe(1)
  })

  it('counts multiple activities on the same day once', () => {
    let today = createEmptyActivity(TODAY)
    today = applyActivityEvent(today, { type: 'learned', nameId: 1 })
    today = applyActivityEvent(today, { type: 'learned', nameId: 2 })
    today = applyActivityEvent(today, { type: 'quiz' })
    today = applyActivityEvent(today, { type: 'quiz' })
    expect(today.learnedNames).toEqual([1, 2])
    expect(today.quizzesCompleted).toBe(2)
    expect(computeStreakStats([today], TODAY).currentStreak).toBe(1)
  })

  it('does not count a day without a learning activity', () => {
    const opened = createEmptyActivity(TODAY)
    expect(isActiveDay(opened)).toBe(false)
    expect(computeStreakStats([opened], TODAY).currentStreak).toBe(0)
  })

  it('grows across consecutive days with mixed activity types', () => {
    const activities = [learnedOn(addDays(TODAY, -2)), quizOn(addDays(TODAY, -1)), learnedOn(TODAY)]
    const stats = computeStreakStats(activities, TODAY)
    expect(stats.currentStreak).toBe(3)
    expect(stats.longestStreak).toBe(3)
  })

  it('keeps yesterday’s streak alive until today ends', () => {
    const activities = [learnedOn(addDays(TODAY, -2)), learnedOn(addDays(TODAY, -1))]
    const stats = computeStreakStats(activities, TODAY)
    expect(stats.currentStreak).toBe(2)
    expect(stats.todayActive).toBe(false)
  })

  it('resets after a single missed day', () => {
    const activities = [learnedOn(addDays(TODAY, -3)), learnedOn(addDays(TODAY, -2))]
    const stats = computeStreakStats(activities, TODAY)
    expect(stats.currentStreak).toBe(0)
    expect(stats.longestStreak).toBe(2)
  })

  it('restarts at one when returning after several missed days', () => {
    const activities = [
      learnedOn('2026-02-01'),
      learnedOn('2026-02-02'),
      learnedOn('2026-02-03'),
      learnedOn('2026-02-04'),
      quizOn(TODAY),
    ]
    const stats = computeStreakStats(activities, TODAY)
    expect(stats.currentStreak).toBe(1)
    expect(stats.longestStreak).toBe(4)
    expect(stats.totalLearningDays).toBe(5)
  })

  it('counts review sessions as activity', () => {
    const reviewed = applyActivityEvent(createEmptyActivity(TODAY), { type: 'reviewed', nameId: 7 })
    expect(computeStreakStats([reviewed], TODAY).currentStreak).toBe(1)
  })

  it('lists the last seven days for the week strip', () => {
    const week = recentDays([learnedOn(TODAY), learnedOn(addDays(TODAY, -6))], TODAY)
    expect(week).toHaveLength(7)
    expect(week[0]).toEqual({ date: addDays(TODAY, -6), active: true })
    expect(week[6]).toEqual({ date: TODAY, active: true })
    expect(week.filter((day) => day.active)).toHaveLength(2)
  })
})
