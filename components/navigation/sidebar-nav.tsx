'use client'

import {
  BarChart3,
  BookOpen,
  BookOpenText,
  Clapperboard,
  House,
  Info,
  Moon,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArabicText } from '@/components/common/localized-text'
import { useAppData } from '@/components/providers/app-data-provider'
import { useReviewQueue } from '@/hooks/use-derived-data'
import type { ThemePreference } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
  icon: LucideIcon
  match: (path: string) => boolean
  badge?: number
}

interface NavSection {
  title: string
  items: NavLink[]
}

export function SidebarNav() {
  const pathname = usePathname() ?? '/'
  const { favorites, settings, updateSettings } = useAppData()
  const reviewQueue = useReviewQueue()

  const sections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { href: '/', label: 'Home', icon: House, match: (p) => p === '/' || p.startsWith('/learn') },
        { href: '/names/', label: 'All 99 Names', icon: BookOpen, match: (p) => p.startsWith('/names') },
        { href: '/reels/', label: 'Reels', icon: Clapperboard, match: (p) => p.startsWith('/reels') },
        { href: '/surahs/', label: 'Quran', icon: BookOpenText, match: (p) => p.startsWith('/surahs') },
      ],
    },
    {
      title: 'Practice & Stats',
      items: [
        { href: '/quiz/', label: 'Quiz', icon: Sparkles, match: (p) => p.startsWith('/quiz') },
        { href: '/progress/', label: 'Progress', icon: BarChart3, match: (p) => p.startsWith('/progress') },
        {
          href: '/review/',
          label: 'Review',
          icon: RotateCcw,
          match: (p) => p.startsWith('/review'),
          badge: reviewQueue.length || undefined,
        },
        {
          href: '/favorites/',
          label: 'Favorites',
          icon: Star,
          match: (p) => p.startsWith('/favorites'),
          badge: favorites.length || undefined,
        },
      ],
    },
    {
      title: 'App',
      items: [
        { href: '/settings/', label: 'Settings', icon: Settings, match: (p) => p.startsWith('/settings') },
        { href: '/about/', label: 'About', icon: Info, match: (p) => p.startsWith('/about') },
      ],
    },
  ]

  const nextTheme: Record<ThemePreference, ThemePreference> = {
    light: 'dark',
    dark: 'system',
    system: 'light',
  }

  const cycleTheme = () => {
    void updateSettings({ theme: nextTheme[settings.theme] })
  }

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/70 bg-card/60 backdrop-blur-xl md:flex"
    >
      {/* Brand Header */}
      <div className="flex flex-col gap-1 border-b border-border/60 px-5 py-5">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <BookOpen className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-base font-bold tracking-tight text-foreground">99 Names of Allah</span>
            <ArabicText className="block text-xs leading-none text-muted-foreground">
              أسماء الله الحسنى
            </ArabicText>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h2 className="px-3 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              {section.title}
            </h2>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, match, badge }) => {
                const active = match(pathname)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-[1.125rem] shrink-0 transition-transform group-hover:scale-110',
                          active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground',
                        )}
                        strokeWidth={active ? 2.2 : 1.8}
                        aria-hidden
                      />
                      <span className="flex-1 truncate">{label}</span>
                      {badge ? (
                        <span
                          className={cn(
                            'grid min-w-5 place-items-center rounded-full px-1.5 text-xs font-semibold tabular-nums',
                            active
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-primary-soft text-primary',
                          )}
                        >
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / Utilities */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2">
          <div className="flex items-center gap-2 pl-1">
            <span className="size-2 rounded-full bg-success" aria-hidden />
            <span className="text-xs text-muted-foreground">Offline ready</span>
          </div>

          <button
            type="button"
            onClick={cycleTheme}
            title={`Current theme: ${settings.theme}. Click to change.`}
            aria-label={`Toggle theme (currently ${settings.theme})`}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {settings.theme === 'dark' ? (
              <Moon className="size-4" aria-hidden />
            ) : settings.theme === 'light' ? (
              <Sun className="size-4" aria-hidden />
            ) : (
              <span className="text-xs font-semibold uppercase">Auto</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}

