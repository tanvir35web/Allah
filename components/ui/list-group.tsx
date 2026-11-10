import { ChevronRight, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * A grouped list (iOS settings style): one card with hairline dividers.
 * Every list on the More pages uses it, so they all look alike.
 */
export function ListGroup({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-2', className)}>
      {title ? (
        <h2 className="px-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">{title}</h2>
      ) : null}
      <div className="divide-y divide-border/60 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xs">
        {children}
      </div>
    </section>
  )
}

/** Colour of a row's icon tile. */
export type RowTone = 'primary' | 'accent' | 'success' | 'danger' | 'muted'

const TONES: Record<RowTone, string> = {
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  muted: 'bg-muted text-muted-foreground',
}

interface ListRowProps {
  icon?: LucideIcon
  tone?: RowTone
  title: ReactNode
  description?: ReactNode
  /** Shown before the chevron: a count, a value or a control. */
  trailing?: ReactNode
  href?: string
  onClick?: () => void
  /** Red title, for destructive actions. */
  destructive?: boolean
  className?: string
}

const rowClass = 'flex min-h-15 w-full items-center gap-3.5 px-4 py-3 text-left transition-colors'

/** One row: icon tile, title and description, then a trailing value and a chevron when it navigates. */
export function ListRow({ icon: Icon, tone = 'primary', title, description, trailing, href, onClick, destructive, className }: ListRowProps) {
  const content = (
    <>
      {Icon ? (
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', destructive ? TONES.danger : TONES[tone])}>
          <Icon className="size-[1.125rem]" aria-hidden />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className={cn('block text-[0.9375rem] font-semibold', destructive && 'text-danger')}>{title}</span>
        {description ? <span className="block text-xs leading-snug text-muted-foreground">{description}</span> : null}
      </span>
      {trailing}
      {href ? <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden /> : null}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn(rowClass, 'hover:bg-muted/50 active:bg-muted/70', className)}>
        {content}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(rowClass, destructive ? 'hover:bg-danger-soft/40' : 'hover:bg-muted/50', className)}
      >
        {content}
      </button>
    )
  }
  return <div className={cn(rowClass, className)}>{content}</div>
}

/** A small count pill for a row's trailing slot. */
export function RowBadge({ children, tone = 'primary' }: { children: ReactNode; tone?: RowTone }) {
  return (
    <span className={cn('grid min-w-6 place-items-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums', TONES[tone])}>
      {children}
    </span>
  )
}
