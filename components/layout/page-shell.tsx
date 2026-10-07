import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { StorageNotice } from '@/components/common/storage-notice'
import { cn } from '@/lib/utils'

interface PageShellProps {
  title: string
  /** Large iOS-style title for top-level tabs; compact bar with back link otherwise. */
  variant?: 'large' | 'compact'
  backHref?: string
  backLabel?: string
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Page frame: a sticky translucent header that respects the iPhone notch
 * (safe-area-inset-top) and a main region padded above the bottom nav.
 * Standalone PWAs have no browser back button, so sub-pages always get one.
 */
export function PageShell({
  title,
  variant = 'large',
  backHref,
  backLabel = 'Back',
  subtitle,
  actions,
  children,
  className,
}: PageShellProps) {
  // Top-level tabs with nothing in the bar only need a translucent strip
  // behind the status bar; the large title lives in the content.
  const barless = variant === 'large' && !backHref && !actions

  return (
    <>
      <header className="safe-top sticky top-0 z-30 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
        <div className={cn('mx-auto flex max-w-2xl items-center gap-2 px-4', barless ? 'hidden' : 'min-h-14')}>
          {backHref ? (
            <Link
              href={backHref}
              className="-ml-2 inline-flex min-h-11 items-center gap-0.5 rounded-xl pr-2 text-sm font-medium text-primary hover:bg-muted"
            >
              <ChevronLeft className="size-5" aria-hidden />
              {backLabel}
            </Link>
          ) : null}
          {variant === 'compact' ? (
            <h1 className="flex-1 truncate text-center text-base font-semibold">{title}</h1>
          ) : (
            <span className="flex-1" />
          )}
          <div className={cn('flex min-w-11 items-center justify-end gap-1', backHref && variant === 'compact' && 'min-w-[4.5rem]')}>
            {actions}
          </div>
        </div>
      </header>
      <main id="main" className={cn('animate-rise pb-nav mx-auto max-w-2xl px-4', className)}>
        {variant === 'large' ? (
          <div className={cn('mb-5', barless ? 'pt-5' : 'pt-1')}>
            <h1 className="text-[2rem] leading-tight font-bold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
        ) : null}
        <StorageNotice />
        {children}
      </main>
    </>
  )
}
