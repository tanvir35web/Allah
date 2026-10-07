'use client'

import { Star } from 'lucide-react'
import { useAppData } from '@/components/providers/app-data-provider'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  nameId: number
  label: string
  variant?: 'icon' | 'full'
  className?: string
}

export function FavoriteButton({ nameId, label, variant = 'icon', className }: FavoriteButtonProps) {
  const { favorites, toggleFavorite } = useAppData()
  const active = favorites.includes(nameId)
  const text = active ? 'Saved to favorites' : 'Add to favorites'

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={variant === 'icon' ? `${active ? 'Remove' : 'Add'} ${label} ${active ? 'from' : 'to'} favorites` : undefined}
      onClick={() => void toggleFavorite(nameId)}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-colors active:scale-95',
        variant === 'icon' ? 'size-11' : 'border border-border bg-card px-4',
        active ? 'text-accent' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      <Star
        key={String(active)}
        className={cn('size-5', active && 'animate-pop fill-accent')}
        strokeWidth={1.9}
        aria-hidden
      />
      {variant === 'full' ? text : null}
    </button>
  )
}
