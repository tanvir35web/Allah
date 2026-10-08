'use client'

import { BookOpenText, ChevronRight, Clapperboard, Info, RotateCcw, Settings, Star, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useAppData } from '@/components/providers/app-data-provider'
import { Card } from '@/components/ui/card'
import { useReviewQueue } from '@/hooks/use-derived-data'

interface MenuItem {
  href: string
  label: string
  description: string
  icon: LucideIcon
  badge?: number
}

export function MoreMenu() {
  const { favorites } = useAppData()
  const reviewQueue = useReviewQueue()
  const items: MenuItem[] = [
    { href: '/reels/', label: 'Reels', description: 'Swipe through the 99 Names, one per screen', icon: Clapperboard },
    { href: '/surahs/', label: 'Surahs', description: 'All 114 surahs with Arabic and Bangla meaning', icon: BookOpenText },
    { href: '/favorites/', label: 'Favorites', description: 'Names you have saved', icon: Star, badge: favorites.length || undefined },
    { href: '/review/', label: 'Review', description: 'Keep learned Names fresh', icon: RotateCcw, badge: reviewQueue.length || undefined },
    { href: '/settings/', label: 'Settings', description: 'Theme, language and data', icon: Settings },
    { href: '/about/', label: 'About', description: 'Sources and privacy', icon: Info },
  ]

  return (
    <Card className="divide-y divide-border overflow-hidden">
      {items.map(({ href, label, description, icon: Icon, badge }) => (
        <Link key={href} href={href} className="flex min-h-16 items-center gap-4 px-4 py-3 hover:bg-muted/50">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{label}</span>
            <span className="block text-xs text-muted-foreground">{description}</span>
          </span>
          {badge ? (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums">{badge}</span>
          ) : null}
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </Link>
      ))}
    </Card>
  )
}
