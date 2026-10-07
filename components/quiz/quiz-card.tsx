'use client'

import { ArrowRight, CircleCheck, CircleX } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { Button } from '@/components/ui/button'
import { optionFor, type QuizQuestion } from '@/lib/quiz'
import { getNameById } from '@/lib/storage/names'
import type { ContentLanguage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { QuizOption, type OptionState } from './quiz-option'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

interface QuizCardProps {
  question: QuizQuestion
  selectedId: number | null
  isLast: boolean
  language: ContentLanguage
  onSelect: (nameId: number) => void
  onNext: () => void
}

export function QuizCard({ question, selectedId, isLast, language, onSelect, onNext }: QuizCardProps) {
  const answered = selectedId !== null
  const isCorrect = selectedId === question.nameId
  const name = getNameById(question.nameId)
  const nextRef = useRef<HTMLButtonElement>(null)

  // Move focus to "Next" after answering so keyboard/screen-reader users can continue.
  useEffect(() => {
    if (answered) nextRef.current?.focus({ preventScroll: true })
  }, [answered])

  const stateFor = (optionId: number): OptionState => {
    if (!answered) return 'idle'
    if (optionId === question.nameId) return 'correct'
    if (optionId === selectedId) return 'incorrect'
    return 'dimmed'
  }

  return (
    <div className="animate-rise space-y-5">
      <section className="pattern-stars rounded-[2rem] border border-border bg-gradient-to-b from-primary-soft to-card px-5 py-7 text-center">
        <h2 className="text-sm font-medium text-muted-foreground">
          <span aria-hidden>{question.instruction}</span>
          <span className="sr-only">{question.prompt}</span>
        </h2>
        <p className="mt-3" aria-hidden={question.subjectKind !== 'arabic'}>
          {question.subjectKind === 'arabic' ? (
            <ArabicText className="text-[3.75rem] leading-[1.7]">{question.subject}</ArabicText>
          ) : question.subjectKind === 'bangla' ? (
            <BanglaText className="text-3xl font-semibold">“{question.subject}”</BanglaText>
          ) : (
            <span className="text-3xl font-bold tracking-tight">{question.subject}</span>
          )}
        </p>
      </section>

      <div className="space-y-3" role="group" aria-label="Answer options">
        {question.options.map((option, index) => (
          <QuizOption
            key={option.nameId}
            option={option}
            letter={LETTERS[index] ?? String(index + 1)}
            state={stateFor(option.nameId)}
            disabled={answered}
            onSelect={() => onSelect(option.nameId)}
          />
        ))}
      </div>

      {answered && name ? (
        <div
          role="status"
          className={cn(
            'animate-rise rounded-3xl border p-4',
            isCorrect ? 'border-success/30 bg-success-soft' : 'border-danger/30 bg-danger-soft',
          )}
        >
          <p className={cn('flex items-center gap-2 font-semibold', isCorrect ? 'text-success' : 'text-danger')}>
            {isCorrect ? <CircleCheck className="size-5" aria-hidden /> : <CircleX className="size-5" aria-hidden />}
            {isCorrect ? 'Correct' : 'Not quite'}
          </p>
          {!isCorrect ? (
            <p className="mt-1 text-sm">
              Correct answer:{' '}
              {question.type === 'name-to-arabic' ? (
                <ArabicText className="text-xl">{optionFor(question.type, name).label}</ArabicText>
              ) : (
                <strong>{optionFor(question.type, name).label}</strong>
              )}
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            <span className="font-medium">
              {name.transliteration} — {name.englishName}.
            </span>{' '}
            {language !== 'bn' ? name.shortExplanationEn : null}
          </p>
          {language !== 'en' ? (
            <BanglaText className="mt-1 block text-sm leading-relaxed text-foreground/80">
              {name.banglaMeaning}। {language === 'bn' ? name.shortExplanationBn : null}
            </BanglaText>
          ) : null}
        </div>
      ) : null}

      {answered ? (
        <Button ref={nextRef} size="lg" className="w-full" onClick={onNext}>
          {isLast ? 'See results' : 'Next question'}
          <ArrowRight className="size-5" aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}
