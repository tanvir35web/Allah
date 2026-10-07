import { ProgressBar } from '@/components/ui/progress-bar'

export function QuizProgress({ current, total, correct }: { current: number; total: number; correct: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold tabular-nums">
          Question {current} <span className="text-muted-foreground">/ {total}</span>
        </span>
        <span className="text-muted-foreground tabular-nums">{correct} correct</span>
      </div>
      <ProgressBar value={current - 1} max={total} label="Quiz progress" />
    </div>
  )
}
