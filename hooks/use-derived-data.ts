'use client'

import { useMemo } from 'react'
import { useAppData } from '@/components/providers/app-data-provider'
import { allahNames, TOTAL_NAMES } from '@/lib/storage/names'
import { nextNameToLearn, summarizeProgress } from '@/lib/progress'
import { overallAccuracy } from '@/lib/quiz'
import { getReviewRecommendations } from '@/lib/review'
import { computeStreakStats } from '@/lib/streak'
import { useToday } from './use-today'

/** Streak statistics for today (null until the client knows the date). */
export function useStreak() {
  const { activities } = useAppData()
  const today = useToday()
  return useMemo(() => (today ? computeStreakStats(activities, today) : null), [activities, today])
}

export function useProgressSummary() {
  const { progress } = useAppData()
  return useMemo(() => summarizeProgress(progress, TOTAL_NAMES), [progress])
}

export function useNextName() {
  const { progress } = useAppData()
  return useMemo(() => nextNameToLearn(allahNames, progress), [progress])
}

export function useQuizStats() {
  const { quizResults } = useAppData()
  return useMemo(
    () => ({ total: quizResults.length, accuracy: overallAccuracy(quizResults) }),
    [quizResults],
  )
}

export function useReviewQueue() {
  const { progress, reviewItems } = useAppData()
  const today = useToday()
  return useMemo(
    () => (today ? getReviewRecommendations(progress, reviewItems, today) : []),
    [progress, reviewItems, today],
  )
}

/** Names learned today, for the daily goal. */
export function useTodayActivity() {
  const { activities } = useAppData()
  const today = useToday()
  return useMemo(() => activities.find((activity) => activity.date === today), [activities, today])
}
