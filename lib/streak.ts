import { addDays, dayNumber, type DateKey } from '@/lib/date'
import type { DailyActivity } from '@/lib/types'

export interface StreakStats {
  currentStreak: number
  longestStreak: number
  totalLearningDays: number
  /** True when today already counts towards the streak. */
  todayActive: boolean
}

export function createEmptyActivity(date: DateKey): DailyActivity {
  return { date, learnedNames: [], quizCompleted: false, quizzesCompleted: 0, reviewedNames: [] }
}

/** A day only counts when a meaningful learning activity happened. */
export function isActiveDay(activity: DailyActivity | undefined): boolean {
  if (!activity) return false
  return (
    activity.learnedNames.length > 0 ||
    activity.quizCompleted ||
    (activity.reviewedNames?.length ?? 0) > 0
  )
}

export type ActivityEvent =
  | { type: 'learned'; nameId: number }
  | { type: 'quiz' }
  | { type: 'reviewed'; nameId: number }

/** Returns a new activity record with the event applied (idempotent for names). */
export function applyActivityEvent(activity: DailyActivity, event: ActivityEvent): DailyActivity {
  switch (event.type) {
    case 'learned':
      return activity.learnedNames.includes(event.nameId)
        ? activity
        : { ...activity, learnedNames: [...activity.learnedNames, event.nameId] }
    case 'reviewed':
      return activity.reviewedNames.includes(event.nameId)
        ? activity
        : { ...activity, reviewedNames: [...activity.reviewedNames, event.nameId] }
    case 'quiz':
      return { ...activity, quizCompleted: true, quizzesCompleted: activity.quizzesCompleted + 1 }
  }
}

/**
 * Computes streak statistics from stored daily activity.
 *
 * The current streak stays alive through today: if the user was active
 * yesterday but has not done anything yet today, the streak is not broken
 * until the day ends.
 */
export function computeStreakStats(activities: DailyActivity[], today: DateKey): StreakStats {
  const activeDays = new Set<number>()
  for (const activity of activities) {
    if (isActiveDay(activity)) activeDays.add(dayNumber(activity.date))
  }

  const todayNumber = dayNumber(today)
  const todayActive = activeDays.has(todayNumber)

  let currentStreak = 0
  let cursor = todayActive ? todayNumber : todayNumber - 1
  while (activeDays.has(cursor)) {
    currentStreak += 1
    cursor -= 1
  }

  let longestStreak = 0
  let run = 0
  let previous: number | undefined
  for (const day of [...activeDays].sort((a, b) => a - b)) {
    run = previous !== undefined && day === previous + 1 ? run + 1 : 1
    longestStreak = Math.max(longestStreak, run)
    previous = day
  }

  return { currentStreak, longestStreak, totalLearningDays: activeDays.size, todayActive }
}

/** Activity flags for the last `count` days, oldest first (for the week strip). */
export function recentDays(
  activities: DailyActivity[],
  today: DateKey,
  count = 7,
): { date: DateKey; active: boolean }[] {
  const byDate = new Map(activities.map((activity) => [activity.date, activity]))
  return Array.from({ length: count }, (_, index) => {
    const date = addDays(today, index - (count - 1))
    return { date, active: isActiveDay(byDate.get(date)) }
  })
}
