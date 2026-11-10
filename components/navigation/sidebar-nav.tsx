'use client'

import {
  BarChart3,
  BookOpen,
  BookOpenText,
  Clapperboard,
  House,
  Info,
  ChevronLeft,
  Moon,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { useAppData } from '@/components/providers/app-data-provider'
import { useReviewQueue } from '@/hooks/use-derived-data'
import { isSidebarCollapsed, setSidebarCollapsed, subscribeSidebar } from '@/lib/sidebar'
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

/** Desktop sidebar. Collapses to an icon rail; the choice is remembered per device. */
export function SidebarNav() {
  const pathname = usePathname() ?? '/'
  const { favorites, settings, updateSettings } = useAppData()
  const reviewQueue = useReviewQueue()
  const collapsed = useSyncExternalStore(subscribeSidebar, isSidebarCollapsed, () => false)

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

  const isDark = settings.theme === 'dark'
  const themeLabel = isDark ? 'Switch to light theme' : 'Switch to dark theme'
  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar'

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="safe-top safe-bottom fixed inset-y-0 left-0 z-40 hidden w-(--sidebar-width) flex-col border-r border-border/70 bg-card/60 backdrop-blur-xl transition-[width] duration-200 lg:flex"
    >
      {/* Collapse toggle: a small round button sitting on the sidebar's right
          edge, level with the logo. The chevron turns to point the way it will go. */}
      <button
        type="button"
        onClick={() => setSidebarCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        aria-label={toggleLabel}
        title={toggleLabel}
        className="absolute top-[calc(env(safe-area-inset-top)+1.625rem)] -right-3.5 z-10 grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-[color,border-color,transform] hover:scale-110 hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
      >
        <ChevronLeft
          className={cn('size-4 transition-transform duration-200', collapsed && 'rotate-180')}
          strokeWidth={2.4}
          aria-hidden
        />
      </button>

      {/* Brand header */}
      <div
        className={cn(
          'flex items-center overflow-hidden border-b border-border/60 py-5',
          collapsed ? 'justify-center px-2' : 'px-5',
        )}
      >
        <Link
          href="/"
          title={collapsed ? '99 Names of Allah' : undefined}
          className={cn('group flex min-w-0 items-center gap-3', !collapsed && 'flex-1')}
        >
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={40}
            height={40}
            priority
            className="size-10 shrink-0 rounded-xl shadow-sm transition-transform group-hover:scale-105"
          />
          {collapsed ? (
            <span className="sr-only">99 Names of Allah</span>
          ) : (
            <div className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[0.95rem] font-bold tracking-tight text-foreground">
                99 Names of Allah
              </span>
              <span className="mt-0.5 block truncate text-xs font-medium text-primary">Asma ul Husna</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation sections */}
      <nav className={cn('flex-1 space-y-6 overflow-x-hidden overflow-y-auto py-4', collapsed ? 'px-2' : 'px-3')}>
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h2
              className={cn(
                collapsed
                  ? 'sr-only'
                  : 'px-3 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground/80 uppercase',
              )}
            >
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
                      title={collapsed ? (badge ? `${label} (${badge})` : label) : undefined}
                      className={cn(
                        'group relative flex min-h-10 items-center gap-3 rounded-xl py-2 text-sm font-medium transition-all duration-150',
                        collapsed ? 'justify-center' : 'px-3',
                        active
                          ? 'bg-primary font-semibold text-primary-foreground shadow-xs'
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
                      <span className={collapsed ? 'sr-only' : 'flex-1 truncate'}>{label}</span>
                      {badge ? (
                        collapsed ? (
                          // A dot on the icon; the count is in the title and read out below.
                          <span
                            className={cn(
                              'absolute top-1.5 right-2.5 size-2 rounded-full',
                              active ? 'bg-primary-foreground' : 'bg-primary',
                            )}
                          >
                            <span className="sr-only">{badge}</span>
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'grid min-w-5 place-items-center rounded-full px-1.5 text-xs font-semibold tabular-nums',
                              active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary-soft text-primary',
                            )}
                          >
                            {badge}
                          </span>
                        )
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: offline status and the light/dark toggle */}
      <div className={cn('overflow-hidden border-t border-border/60', collapsed ? 'p-2' : 'p-3')}>
        <div
          className={cn('flex items-center rounded-xl bg-muted/40 p-2', collapsed ? 'justify-center' : 'justify-between')}
        >
          {collapsed ? null : (
            <div className="flex items-center gap-2 pl-1">
              <span className="size-2 rounded-full bg-success" aria-hidden />
              <span className="text-xs text-muted-foreground">Offline ready</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => void updateSettings({ theme: isDark ? 'light' : 'dark' })}
            title={themeLabel}
            aria-label={themeLabel}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
    </aside>
  )
}
