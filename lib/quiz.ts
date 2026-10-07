import { shuffle, type Random } from '@/lib/random'
import type { AllahName, QuestionType, QuizAnswer, QuizMode } from '@/lib/types'

export const QUESTION_TYPES: QuestionType[] = ['meaning', 'arabic-to-name', 'name-to-arabic', 'bangla']
export const QUIZ_LENGTHS = [5, 10, 20] as const
export const OPTIONS_PER_QUESTION = 4

export type OptionKind = 'english' | 'transliteration' | 'arabic'

export interface QuizOption {
  nameId: number
  label: string
  kind: OptionKind
}

export interface QuizQuestion {
  id: string
  type: QuestionType
  nameId: number
  /** The text the user is asked about (a transliteration, Arabic, or Bangla meaning). */
  subject: string
  subjectKind: 'transliteration' | 'arabic' | 'bangla'
  /** Full question text, e.g. `What does “Ar-Rahman” mean?`. */
  prompt: string
  /** Short visual instruction shown above the large subject. */
  instruction: string
  options: QuizOption[]
}

export const QUIZ_MODE_LABELS: Record<QuizMode, { title: string; description: string }> = {
  meaning: { title: 'Meaning', description: 'Pick the meaning of a Name' },
  'arabic-to-name': { title: 'Arabic → Name', description: 'Recognise the Arabic script' },
  'name-to-arabic': { title: 'Name → Arabic', description: 'Find the Arabic for a Name' },
  bangla: { title: 'বাংলা অর্থ', description: 'Match the Bangla meaning' },
  mixed: { title: 'Mixed', description: 'A bit of everything' },
}

/** The answer label a given Name has for a question type. */
export function optionFor(type: QuestionType, name: AllahName): QuizOption {
  switch (type) {
    case 'meaning':
      return { nameId: name.id, label: name.englishName, kind: 'english' }
    case 'name-to-arabic':
      return { nameId: name.id, label: name.arabic, kind: 'arabic' }
    case 'arabic-to-name':
    case 'bangla':
      return { nameId: name.id, label: name.transliteration, kind: 'transliteration' }
  }
}

type QuestionText = Pick<QuizQuestion, 'subject' | 'subjectKind' | 'prompt' | 'instruction'>

function subjectFor(type: QuestionType, name: AllahName): QuestionText {
  switch (type) {
    case 'meaning':
      return {
        subject: name.transliteration,
        subjectKind: 'transliteration',
        prompt: `What does “${name.transliteration}” mean?`,
        instruction: 'What does this Name mean?',
      }
    case 'arabic-to-name':
      return { subject: name.arabic, subjectKind: 'arabic', prompt: 'Which Name is this?', instruction: 'Which Name is this?' }
    case 'name-to-arabic':
      return {
        subject: name.transliteration,
        subjectKind: 'transliteration',
        prompt: `Which is the Arabic for “${name.transliteration}”?`,
        instruction: 'Which is the Arabic for this Name?',
      }
    case 'bangla':
      return {
        subject: name.banglaMeaning,
        subjectKind: 'bangla',
        prompt: `“${name.banglaMeaning}” refers to which Name?`,
        instruction: 'This meaning refers to which Name?',
      }
  }
}

/**
 * Builds one question. Distractors are drawn from `allNames` and never share
 * the same visible label as the correct answer, so exactly one option is right.
 */
export function createQuestion(
  type: QuestionType,
  target: AllahName,
  allNames: readonly AllahName[],
  random: Random = Math.random,
  index = 0,
): QuizQuestion {
  const correct = optionFor(type, target)
  const seen = new Set([correct.label])
  const distractors: QuizOption[] = []
  for (const candidate of shuffle(allNames, random)) {
    if (distractors.length >= OPTIONS_PER_QUESTION - 1) break
    if (candidate.id === target.id) continue
    const option = optionFor(type, candidate)
    if (seen.has(option.label)) continue
    seen.add(option.label)
    distractors.push(option)
  }
  return {
    id: `${index}-${type}-${target.id}`,
    type,
    nameId: target.id,
    ...subjectFor(type, target),
    options: shuffle([correct, ...distractors], random),
  }
}

export interface GenerateQuizOptions {
  mode: QuizMode
  count: number
  /** Names the questions are about. Defaults to all names. */
  pool?: readonly AllahName[]
  /** Names used as distractors. */
  allNames: readonly AllahName[]
  random?: Random
}

/** Generates a quiz with unique target names (as long as the pool allows). */
export function generateQuiz({ mode, count, pool, allNames, random = Math.random }: GenerateQuizOptions): QuizQuestion[] {
  const source = pool && pool.length > 0 ? pool : allNames
  const total = Math.max(0, Math.min(count, source.length))
  const targets = shuffle(source, random).slice(0, total)
  return targets.map((target, index) => {
    const type =
      mode === 'mixed' ? (QUESTION_TYPES[Math.floor(random() * QUESTION_TYPES.length)] as QuestionType) : mode
    return createQuestion(type, target, allNames, random, index)
  })
}

export function isCorrectAnswer(question: QuizQuestion, selectedNameId: number): boolean {
  return question.nameId === selectedNameId
}

export function answerQuestion(question: QuizQuestion, selectedNameId: number): QuizAnswer {
  return {
    questionType: question.type,
    nameId: question.nameId,
    selectedNameId,
    isCorrect: isCorrectAnswer(question, selectedNameId),
  }
}

export interface QuizScore {
  total: number
  correct: number
  wrong: number
  percentage: number
}

export function scoreQuiz(answers: readonly QuizAnswer[]): QuizScore {
  const correct = answers.filter((answer) => answer.isCorrect).length
  const total = answers.length
  return {
    total,
    correct,
    wrong: total - correct,
    percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
  }
}

/** Overall accuracy across many quiz results, as a 0–100 integer. */
export function overallAccuracy(results: readonly { correct: number; total: number }[]): number {
  const totals = results.reduce(
    (acc, result) => ({ correct: acc.correct + result.correct, total: acc.total + result.total }),
    { correct: 0, total: 0 },
  )
  return totals.total === 0 ? 0 : Math.round((totals.correct / totals.total) * 100)
}
