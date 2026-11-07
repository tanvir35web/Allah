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
  /** Max width profile for responsive desktop layout. Defaults to 'wide'. */
  maxWidth?: 'wide' | 'narrow' | 'medium'
}

/**
 * Page frame: a sticky translucent header that respects the iPhone notch
 * (safe-area-inset-top) and a main region padded above the bottom nav on mobile,
 * and responsive container styling with generous spacing on desktop.
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
  maxWidth = 'wide',
}: PageShellProps) {
  // Top-level tabs with nothing in the bar only need a translucent strip
  // behind the status bar; the large title lives in the content.
  const barless = variant === 'large' && !backHref && !actions

  const widthClass =
    maxWidth === 'narrow'
      ? 'max-w-2xl'
      : maxWidth === 'medium'
        ? 'max-w-2xl md:max-w-4xl'
        : 'max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl'

  return (
    <>
      <header className="safe-top sticky top-0 z-30 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
        <div className={cn('mx-auto flex items-center gap-2 px-4 md:px-8', widthClass, barless ? 'hidden' : 'min-h-14')}>
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
            <h1 className="flex-1 truncate text-center md:text-left text-base font-semibold">{title}</h1>
          ) : (
            <span className="flex-1" />
          )}
          <div className={cn('flex min-w-11 items-center justify-end gap-1', backHref && variant === 'compact' && 'min-w-[4.5rem]')}>
            {actions}
          </div>
        </div>
      </header>
      <main id="main" className={cn('animate-rise pb-nav md:pb-12 mx-auto px-4 md:px-8', widthClass, className)}>
        {variant === 'large' ? (
          <div className={cn('mb-6', barless ? 'pt-6 md:pt-8' : 'pt-2')}>
            <h1 className="text-[2rem] md:text-[2.5rem] leading-tight font-bold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-1.5 text-sm md:text-base text-muted-foreground">{subtitle}</p> : null}
          </div>
        ) : null}
        <StorageNotice />
        {children}
      </main>
    </>
  )
}
