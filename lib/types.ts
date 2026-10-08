/** Core domain types shared across the app. */

export interface AllahName {
  /** Order in the traditional list, 1–99. */
  id: number
  /** Arabic with full diacritics (rendered RTL). */
  arabic: string
  /** Common Latin transliteration, e.g. "Ar-Rahman". */
  transliteration: string
  /** Transliteration written in Bangla script, e.g. "আর-রহমান". */
  banglaName: string
  /** Short English rendering, used as the primary title and quiz answer. */
  englishName: string
  /** Slightly fuller English gloss of the meaning. */
  englishMeaning: string
  /** Short Bangla meaning. */
  banglaMeaning: string
  shortExplanationEn: string
  shortExplanationBn: string
}

export type LearningStatus = 'not_started' | 'learning' | 'learned'

export interface LearningProgress {
  nameId: number
  status: LearningStatus
  learnedAt?: string
  reviewCount: number
  lastReviewedAt?: string
  updatedAt: string
}

export interface FavoriteRecord {
  nameId: number
  createdAt: string
}

export type QuestionType = 'meaning' | 'arabic-to-name' | 'name-to-arabic' | 'bangla'
export type QuizMode = QuestionType | 'mixed'
export type QuizScope = 'all' | 'learned'

export interface QuizAnswer {
  questionType: QuestionType
  nameId: number
  selectedNameId: number
  isCorrect: boolean
}

export interface QuizResult {
  id: string
  mode: QuizMode
  scope: QuizScope
  total: number
  correct: number
  startedAt: string
  completedAt: string
  answers: QuizAnswer[]
}

/** Time spent reading one surah. */
export interface SurahReading {
  surahId: number
  /** Transliterated name, so lists can show it without the surah data. */
  surahName: string
  /** Active reading time, in seconds. */
  seconds: number
  lastReadAt: string
}

/** Quran reading time on one local calendar day (YYYY-MM-DD). */
export interface ReadingDay {
  date: string
  seconds: number
}

/** Activity performed on a given local calendar day (YYYY-MM-DD). */
export interface DailyActivity {
  date: string
  learnedNames: number[]
  quizCompleted: boolean
  quizzesCompleted: number
  reviewedNames: number[]
}

/** Per-name quiz performance, used by the review recommender. */
export interface ReviewItem {
  nameId: number
  correctCount: number
  incorrectCount: number
  lastIncorrectAt?: string
  lastCorrectAt?: string
}

export type ThemePreference = 'light' | 'dark' | 'system'
export type ContentLanguage = 'en' | 'bn' | 'both'

export interface AppSettings {
  theme: ThemePreference
  language: ContentLanguage
  dailyGoal: number
  reminderEnabled: boolean
  reminderTime: string
  onboardingComplete: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'both',
  dailyGoal: 3,
  reminderEnabled: false,
  reminderTime: '20:00',
  onboardingComplete: false,
}

export interface Ayah {
  /** Ayah number within the surah. */
  number: number
  bangla: string
}

export interface Surah {
  /** Surah number in the Qur'an, 1–114. */
  id: number
  arabicName: string
  transliteration: string
  banglaName: string
  englishMeaning: string
  banglaMeaning: string
  revelation: 'meccan' | 'medinan'
  /**
   * Whole surah in IndoPak script, with ayah-end numbers, waqf signs and ruku
   * marks embedded. Excludes the Bismillah heading (except in Al-Fatihah).
   */
  arabic: string
  /** Bangla meaning, ayah by ayah. */
  ayahs: Ayah[]
}
