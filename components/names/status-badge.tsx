import { Check, CircleDashed, Loader } from 'lucide-react'
import type { LearningStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

export const STATUS_LABELS: Record<LearningStatus, string> = {
  not_started: 'Not started',
  learning: 'Learning',
  learned: 'Learned',
}

const styles: Record<LearningStatus, string> = {
  not_started: 'bg-muted text-muted-foreground',
  learning: 'bg-accent-soft text-accent',
  learned: 'bg-success-soft text-success',
}

const icons = { not_started: CircleDashed, learning: Loader, learned: Check }

export function StatusBadge({ status, className }: { status: LearningStatus; className?: string }) {
  const Icon = icons[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        styles[status],
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.2} aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  )
}
