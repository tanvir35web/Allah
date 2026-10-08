'use client'

import { BarChart3, BookOpen, Ellipsis, House, Sparkles, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  match: (path: string) => boolean
}

const MORE_ROUTES = ['/more', '/reels', '/surahs', '/favorites', '/review', '/settings', '/about']

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: House, match: (p) => p === '/' || p.startsWith('/learn') },
  { href: '/names/', label: 'Names', icon: BookOpen, match: (p) => p.startsWith('/names') },
  { href: '/quiz/', label: 'Quiz', icon: Sparkles, match: (p) => p.startsWith('/quiz') },
  { href: '/progress/', label: 'Progress', icon: BarChart3, match: (p) => p.startsWith('/progress') },
  { href: '/more/', label: 'More', icon: Ellipsis, match: (p) => MORE_ROUTES.some((route) => p.startsWith(route)) },
]

/** Fixed tab bar sitting above the iPhone home indicator. */
export function BottomNav() {
  const pathname = usePathname() ?? '/'

  return (
    <nav
      aria-label="Main"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
    >
      <ul className="mx-auto grid h-[var(--nav-height)] max-w-2xl grid-cols-5 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname)
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[0.6875rem] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'grid h-7 w-12 place-items-center rounded-full transition-colors duration-200',
                    active && 'bg-primary-soft',
                  )}
                >
                  <Icon className="size-[1.3rem]" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
