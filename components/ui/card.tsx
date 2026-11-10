import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** The app's card surface, matching the home cards: a soft border and the lightest shadow. */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-3xl border border-border/70 bg-card text-card-foreground shadow-xs', className)}
      {...props}
    />
  )
}

/** Small uppercase label above a section, matching the home section headers. */
export function SectionTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn('px-1 text-xs font-bold tracking-wider text-muted-foreground uppercase', className)}
      {...props}
    />
  )
}
