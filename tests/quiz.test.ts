import { describe, expect, it } from 'vitest'
import { allahNames, getNameById } from '@/data/allah-names'
import { pickRandomName } from '@/lib/daily-name'
import {
  answerQuestion,
  createQuestion,
  generateQuiz,
  isCorrectAnswer,
  overallAccuracy,
  QUESTION_TYPES,
  scoreQuiz,
} from '@/lib/quiz'
import { seededRandom } from '@/lib/random'

const rahman = getNameById(1)!

describe('question generation', () => {
  it.each(QUESTION_TYPES)('builds a valid "%s" question', (type) => {
    const question = createQuestion(type, rahman, allahNames, seededRandom(1))
    expect(question.options).toHaveLength(4)
    expect(question.options.filter((option) => option.nameId === rahman.id)).toHaveLength(1)
    expect(new Set(question.options.map((option) => option.nameId)).size).toBe(4)
    expect(new Set(question.options.map((option) => option.label)).size).toBe(4)
  })

  it('asks about the right thing for each type', () => {
    const random = seededRandom(2)
    expect(createQuestion('meaning', rahman, allahNames, random).prompt).toBe('What does “Ar-Rahman” mean?')
    expect(createQuestion('arabic-to-name', rahman, allahNames, random).subject).toBe(rahman.arabic)
    const toArabic = createQuestion('name-to-arabic', rahman, allahNames, random)
    expect(toArabic.options.every((option) => option.kind === 'arabic')).toBe(true)
    expect(createQuestion('bangla', rahman, allahNames, random).subject).toBe(rahman.banglaMeaning)
  })

  it('generates the requested number of questions with unique Names', () => {
    for (const count of [5, 10, 20]) {
      const quiz = generateQuiz({ mode: 'meaning', count, allNames: allahNames, random: seededRandom(count) })
      expect(quiz).toHaveLength(count)
      expect(new Set(quiz.map((question) => question.nameId)).size).toBe(count)
      expect(quiz.every((question) => question.type === 'meaning')).toBe(true)
    }
  })

  it('mixes question types in mixed mode', () => {
    const quiz = generateQuiz({ mode: 'mixed', count: 20, allNames: allahNames, random: seededRandom(3) })
    expect(new Set(quiz.map((question) => question.type)).size).toBeGreaterThan(1)
  })

  it('limits questions to the pool but draws distractors from all Names', () => {
    const pool = allahNames.slice(0, 2)
    const quiz = generateQuiz({ mode: 'meaning', count: 10, pool, allNames: allahNames, random: seededRandom(4) })
    expect(quiz).toHaveLength(2)
    expect(quiz.every((question) => question.nameId <= 2 && question.options.length === 4)).toBe(true)
  })

  it('is deterministic for a given seed', () => {
    const a = generateQuiz({ mode: 'mixed', count: 5, allNames: allahNames, random: seededRandom(9) })
    const b = generateQuiz({ mode: 'mixed', count: 5, allNames: allahNames, random: seededRandom(9) })
    expect(a).toEqual(b)
  })
})

describe('answers and scoring', () => {
  const question = createQuestion('meaning', rahman, allahNames, seededRandom(5))
  const wrong = question.options.find((option) => option.nameId !== rahman.id)!

  it('accepts the correct answer', () => {
    expect(isCorrectAnswer(question, rahman.id)).toBe(true)
    expect(answerQuestion(question, rahman.id)).toEqual({
      questionType: 'meaning',
      nameId: 1,
      selectedNameId: 1,
      isCorrect: true,
    })
  })

  it('rejects an incorrect answer', () => {
    expect(isCorrectAnswer(question, wrong.nameId)).toBe(false)
    expect(answerQuestion(question, wrong.nameId).isCorrect).toBe(false)
  })

  it('calculates the score', () => {
    const answers = [
      ...Array.from({ length: 8 }, () => answerQuestion(question, rahman.id)),
      answerQuestion(question, wrong.nameId),
      answerQuestion(question, wrong.nameId),
    ]
    expect(scoreQuiz(answers)).toEqual({ total: 10, correct: 8, wrong: 2, percentage: 80 })
    expect(scoreQuiz([])).toEqual({ total: 0, correct: 0, wrong: 0, percentage: 0 })
  })

  it('computes accuracy across quizzes weighted by questions', () => {
    expect(overallAccuracy([{ correct: 5, total: 5 }, { correct: 5, total: 15 }])).toBe(50)
    expect(overallAccuracy([])).toBe(0)
  })
})

describe('daily name', () => {
  it('picks by the random value', () => {
    expect(pickRandomName(allahNames, undefined, () => 0)).toBe(allahNames[0])
    expect(pickRandomName(allahNames, undefined, () => 0.999)).toBe(allahNames[98])
  })

  it('never repeats the previous Name', () => {
    const first = allahNames[0]!
    for (const value of [0, 0.5, 0.999]) {
      expect(pickRandomName(allahNames, first.id, () => value).id).not.toBe(first.id)
    }
  })

  it('can reach every Name', () => {
    const ids = new Set(Array.from({ length: 99 }, (_, i) => pickRandomName(allahNames, undefined, () => (i + 0.5) / 99).id))
    expect(ids.size).toBe(99)
  })
})
