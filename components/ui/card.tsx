import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.03),0_8px_24px_-12px_rgb(16_48_46/0.12)] dark:shadow-none',
        className,
      )}
      {...props}
    />
  )
}

export function SectionTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn('px-1 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase', className)}
      {...props}
    />
  )
}
