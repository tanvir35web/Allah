import { getStatus, type ProgressMap } from '@/lib/progress'
import type { AllahName, ContentLanguage, QuestionType } from '@/lib/types'

/** How a Name in a learn session ended. */
export type LearnOutcome = 'learned' | 'missed' | 'skipped'

/**
 * Names for one learn session, in 1 → 99 order: Names already being learned
 * (including ones missed in an earlier recall check) first, then new ones.
 */
export function planLearnSession(names: readonly AllahName[], progress: ProgressMap, size: number): number[] {
  const learning = names.filter((name) => getStatus(progress, name.id) === 'learning')
  const fresh = names.filter((name) => getStatus(progress, name.id) === 'not_started')
  return [...learning, ...fresh].slice(0, Math.max(1, size)).map((name) => name.id)
}

/** A session covers what is left of today's goal, or a full goal's worth once it is met. */
export function learnSessionSize(dailyGoal: number, learnedToday: number): number {
  const remaining = dailyGoal - learnedToday
  return remaining > 0 ? remaining : dailyGoal
}

/** The recall check asks for the meaning in the language the reader uses. */
export function recallQuestionType(language: ContentLanguage): QuestionType {
  return language === 'bn' ? 'bangla' : 'meaning'
}

export function countOutcomes(outcomes: readonly LearnOutcome[]): Record<LearnOutcome, number> {
  const counts: Record<LearnOutcome, number> = { learned: 0, missed: 0, skipped: 0 }
  for (const outcome of outcomes) counts[outcome] += 1
  return counts
}
