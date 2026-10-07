import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Arabic text with correct direction, language and font. */
export function ArabicText({ className, ...props }: ComponentProps<'span'>) {
  return <span lang="ar" dir="rtl" className={cn('font-arabic text-arabic', className)} {...props} />
}

/** Bangla text with the Bengali font and language tag for screen readers. */
export function BanglaText({ className, ...props }: ComponentProps<'span'>) {
  return <span lang="bn" className={cn('font-bangla', className)} {...props} />
}
