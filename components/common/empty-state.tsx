import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('animate-rise flex flex-col items-center px-6 py-14 text-center', className)}>
      <div className="pattern-stars mb-5 grid size-20 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-8" strokeWidth={1.6} aria-hidden />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
