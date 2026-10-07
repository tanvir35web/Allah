import { Check, X } from 'lucide-react'
import { ArabicText } from '@/components/common/localized-text'
import type { QuizOption as QuizOptionData } from '@/lib/quiz'
import { cn } from '@/lib/utils'

export type OptionState = 'idle' | 'correct' | 'incorrect' | 'dimmed'

interface QuizOptionProps {
  option: QuizOptionData
  letter: string
  state: OptionState
  disabled: boolean
  onSelect: () => void
}

const stateStyles: Record<OptionState, string> = {
  idle: 'border-border bg-card hover:border-primary/40 hover:bg-primary-soft/40',
  correct: 'animate-pop border-success bg-success-soft',
  incorrect: 'animate-shake border-danger bg-danger-soft',
  dimmed: 'border-border bg-card opacity-55',
}

export function QuizOption({ option, letter, state, disabled, onSelect }: QuizOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-disabled={disabled}
      className={cn(
        'flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-[background-color,border-color,opacity] duration-200 disabled:cursor-default',
        stateStyles[state],
      )}
    >
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-xl text-sm font-semibold',
          state === 'correct'
            ? 'bg-success text-white dark:text-background'
            : state === 'incorrect'
              ? 'bg-danger text-white dark:text-background'
              : 'bg-muted text-muted-foreground',
        )}
        aria-hidden
      >
        {state === 'correct' ? <Check className="size-4" /> : state === 'incorrect' ? <X className="size-4" /> : letter}
      </span>
      {option.kind === 'arabic' ? (
        <ArabicText className="flex-1 text-right text-[1.9rem] leading-[1.6]">{option.label}</ArabicText>
      ) : (
        <span className="flex-1 font-medium">{option.label}</span>
      )}
      {state === 'correct' ? <span className="sr-only">(correct answer)</span> : null}
      {state === 'incorrect' ? <span className="sr-only">(your answer, incorrect)</span> : null}
    </button>
  )
}
