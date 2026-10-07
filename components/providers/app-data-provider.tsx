'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toDateKey } from '@/lib/date'
import { applyReview, applyStatus, type ProgressMap } from '@/lib/progress'
import { applyQuizToReviewItems } from '@/lib/review'
import { applyActivityEvent, createEmptyActivity, type ActivityEvent } from '@/lib/streak'
import * as storage from '@/lib/storage'
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type DailyActivity,
  type LearningStatus,
  type QuizResult,
  type ReviewItem,
} from '@/lib/types'
import { applyTheme } from '@/lib/theme'

interface AppDataState {
  ready: boolean
  /** False when IndexedDB could not be opened; data then lives in memory only. */
  storageAvailable: boolean
  progress: ProgressMap
  favorites: number[]
  quizResults: QuizResult[]
  activities: DailyActivity[]
  reviewItems: Record<number, ReviewItem>
  settings: AppSettings
}

interface AppDataActions {
  setStatus: (nameId: number, status: LearningStatus) => Promise<void>
  toggleFavorite: (nameId: number) => Promise<boolean>
  saveQuiz: (result: QuizResult) => Promise<void>
  recordReview: (nameId: number, remembered: boolean) => Promise<void>
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>
  resetProgress: () => Promise<void>
  resetQuizHistory: () => Promise<void>
  clearAllData: () => Promise<void>
}

export type AppData = AppDataState & AppDataActions

const initialState: AppDataState = {
  ready: false,
  storageAvailable: true,
  progress: {},
  favorites: [],
  quizResults: [],
  activities: [],
  reviewItems: {},
  settings: DEFAULT_SETTINGS,
}

const AppDataContext = createContext<AppData | null>(null)

const toMap = <T extends { nameId: number }>(items: T[]): Record<number, T> =>
  Object.fromEntries(items.map((item) => [item.nameId, item]))

function upsertActivity(activities: DailyActivity[], activity: DailyActivity): DailyActivity[] {
  const others = activities.filter((entry) => entry.date !== activity.date)
  return [...others, activity]
}

/**
 * Loads all persisted data from IndexedDB once and exposes it with actions.
 * IndexedDB stays the source of truth: every action writes first, then
 * updates React state with what was stored. If IndexedDB is unavailable
 * (e.g. some private browsing modes), the app keeps working in memory.
 */
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppDataState>(initialState)
  // Latest state for use inside stable action callbacks.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    let cancelled = false
    storage
      .loadAllData()
      .then((data) => {
        if (cancelled) return
        setState({
          ready: true,
          storageAvailable: true,
          progress: toMap(data.progress),
          favorites: data.favorites.map((favorite) => favorite.nameId),
          quizResults: data.quizResults,
          activities: data.activities,
          reviewItems: toMap(data.reviewItems),
          settings: data.settings,
        })
        applyTheme(data.settings.theme)
        void storage.requestPersistentStorage()
      })
      .catch((error: unknown) => {
        console.warn('[storage] Falling back to in-memory data', error)
        if (!cancelled) setState((current) => ({ ...current, ready: true, storageAvailable: false }))
      })
    return () => {
      cancelled = true
    }
  }, [])

  /** Runs a storage operation, falling back to an in-memory computation on failure. */
  const persist = useCallback(async <T,>(operation: () => Promise<T>, fallback: () => T): Promise<T> => {
    if (!stateRef.current.storageAvailable) return fallback()
    try {
      return await operation()
    } catch (error) {
      console.warn('[storage] Write failed, continuing in memory', error)
      setState((current) => ({ ...current, storageAvailable: false }))
      return fallback()
    }
  }, [])

  const localActivity = useCallback((event: ActivityEvent): DailyActivity => {
    const today = toDateKey()
    const existing = stateRef.current.activities.find((entry) => entry.date === today) ?? createEmptyActivity(today)
    return applyActivityEvent(existing, event)
  }, [])

  const setStatus = useCallback<AppDataActions['setStatus']>(
    async (nameId, status) => {
      const current = stateRef.current.progress[nameId]
      const result = await persist(
        () => storage.setNameStatus(nameId, status),
        () => ({
          progress: applyStatus(current, nameId, status, new Date().toISOString()),
          activity:
            status === 'learned' && current?.status !== 'learned'
              ? localActivity({ type: 'learned', nameId })
              : undefined,
        }),
      )
      setState((s) => {
        const progress = { ...s.progress }
        if (result.progress.status === 'not_started') delete progress[nameId]
        else progress[nameId] = result.progress
        return {
          ...s,
          progress,
          activities: result.activity ? upsertActivity(s.activities, result.activity) : s.activities,
        }
      })
    },
    [persist, localActivity],
  )

  const toggleFavorite = useCallback<AppDataActions['toggleFavorite']>(
    async (nameId) => {
      const isFavorite = await persist(
        () => storage.toggleFavorite(nameId),
        () => !stateRef.current.favorites.includes(nameId),
      )
      setState((s) => ({
        ...s,
        favorites: isFavorite
          ? [...s.favorites.filter((id) => id !== nameId), nameId]
          : s.favorites.filter((id) => id !== nameId),
      }))
      return isFavorite
    },
    [persist],
  )

  const saveQuiz = useCallback<AppDataActions['saveQuiz']>(
    async (result) => {
      const saved = await persist(
        () => storage.saveQuizResult(result),
        () => ({
          result,
          reviewItems: applyQuizToReviewItems(stateRef.current.reviewItems, result.answers, result.completedAt),
          activity: localActivity({ type: 'quiz' }),
        }),
      )
      setState((s) => ({
        ...s,
        quizResults: [saved.result, ...s.quizResults.filter((entry) => entry.id !== saved.result.id)],
        reviewItems: { ...s.reviewItems, ...toMap(saved.reviewItems) },
        activities: upsertActivity(s.activities, saved.activity),
      }))
    },
    [persist, localActivity],
  )

  const recordReview = useCallback<AppDataActions['recordReview']>(
    async (nameId, remembered) => {
      const result = await persist(
        () => storage.recordNameReview(nameId, remembered),
        () => ({
          progress: applyReview(stateRef.current.progress[nameId], nameId, remembered, new Date().toISOString()),
          activity: localActivity({ type: 'reviewed', nameId }),
        }),
      )
      setState((s) => ({
        ...s,
        progress: { ...s.progress, [nameId]: result.progress },
        activities: upsertActivity(s.activities, result.activity),
      }))
    },
    [persist, localActivity],
  )

  const updateSettings = useCallback<AppDataActions['updateSettings']>(
    async (patch) => {
      const settings = await persist(
        () => storage.updateSettings(patch),
        () => ({ ...stateRef.current.settings, ...patch }),
      )
      if (patch.theme) applyTheme(settings.theme)
      setState((s) => ({ ...s, settings }))
    },
    [persist],
  )

  const resetProgress = useCallback(async () => {
    await persist(storage.resetLearningProgress, () => undefined)
    setState((s) => ({ ...s, progress: {}, reviewItems: {}, activities: [] }))
  }, [persist])

  const resetQuizHistory = useCallback(async () => {
    await persist(storage.resetQuizHistory, () => undefined)
    setState((s) => ({ ...s, quizResults: [], reviewItems: {} }))
  }, [persist])

  const clearAllData = useCallback(async () => {
    await persist(storage.clearAllData, () => undefined)
    applyTheme(DEFAULT_SETTINGS.theme)
    setState((s) => ({ ...initialState, ready: true, storageAvailable: s.storageAvailable }))
  }, [persist])

  const value = useMemo<AppData>(
    () => ({
      ...state,
      setStatus,
      toggleFavorite,
      saveQuiz,
      recordReview,
      updateSettings,
      resetProgress,
      resetQuizHistory,
      clearAllData,
    }),
    [state, setStatus, toggleFavorite, saveQuiz, recordReview, updateSettings, resetProgress, resetQuizHistory, clearAllData],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppData {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData must be used inside <AppDataProvider>')
  return context
}
