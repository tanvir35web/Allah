'use client'

import { Loader2 } from 'lucide-react'
import { useLinkStatus } from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Shows a spinner in place of `children` while the enclosing `<Link>` is
 * navigating, so a tap gets instant feedback even when the next page
 * (e.g. a long surah) takes a moment to load. Must be rendered inside a Link.
 */
export function LinkPending({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useLinkStatus()
  if (!pending) return children
  return <Loader2 className={cn('size-4 shrink-0 animate-spin', className)} aria-label="Loading" />
}
