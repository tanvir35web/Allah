import type { AllahName, LearningProgress, LearningStatus } from '@/lib/types'

export type ProgressMap = Record<number, LearningProgress>

export function getStatus(progress: ProgressMap, nameId: number): LearningStatus {
  return progress[nameId]?.status ?? 'not_started'
}

/**
 * Applies a status change. Keeps review history, records when a name was
 * first learned, and clears `learnedAt` when a name is reset.
 */
export function applyStatus(
  existing: LearningProgress | undefined,
  nameId: number,
  status: LearningStatus,
  now: string,
): LearningProgress {
  const base: LearningProgress = existing ?? { nameId, status: 'not_started', reviewCount: 0, updatedAt: now }
  if (status === 'not_started') {
    return { nameId, status, reviewCount: 0, updatedAt: now }
  }
  return {
    ...base,
    status,
    learnedAt: status === 'learned' ? (base.status === 'learned' && base.learnedAt ? base.learnedAt : now) : base.learnedAt,
    updatedAt: now,
  }
}

/** Applies the outcome of a review card. */
export function applyReview(
  existing: LearningProgress | undefined,
  nameId: number,
  remembered: boolean,
  now: string,
): LearningProgress {
  const base: LearningProgress = existing ?? { nameId, status: 'not_started', reviewCount: 0, updatedAt: now }
  return {
    ...base,
    status: base.status === 'not_started' ? 'learning' : base.status,
    reviewCount: remembered ? base.reviewCount + 1 : 0,
    lastReviewedAt: now,
    updatedAt: now,
  }
}

export interface ProgressSummary {
  learned: number
  learning: number
  notStarted: number
  total: number
  /** 0–100 integer of learned names. */
  percentage: number
}

export function summarizeProgress(progress: ProgressMap, total: number): ProgressSummary {
  let learned = 0
  let learning = 0
  for (const entry of Object.values(progress)) {
    if (entry.status === 'learned') learned += 1
    else if (entry.status === 'learning') learning += 1
  }
  return {
    learned,
    learning,
    notStarted: Math.max(0, total - learned - learning),
    total,
    percentage: progressPercentage(learned, total),
  }
}

export function progressPercentage(done: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((done / total) * 100))
}

/**
 * The next name to learn: the first one marked "learning", otherwise the
 * first not yet started. Returns undefined when all names are learned.
 */
export function nextNameToLearn(names: readonly AllahName[], progress: ProgressMap, afterId?: number): AllahName | undefined {
  const ordered = afterId === undefined ? names : [...names.filter((n) => n.id > afterId), ...names.filter((n) => n.id <= afterId)]
  return (
    ordered.find((name) => getStatus(progress, name.id) === 'learning' && name.id !== afterId) ??
    ordered.find((name) => getStatus(progress, name.id) === 'not_started' && name.id !== afterId)
  )
}
