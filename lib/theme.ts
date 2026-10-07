import type { ThemePreference } from '@/lib/types'

/**
 * IndexedDB is the source of truth for the theme preference, but it is async.
 * A tiny mirror in localStorage lets an inline script apply the theme before
 * first paint, avoiding a light/dark flash. Only this one string is stored there.
 */
export const THEME_STORAGE_KEY = 'asma-theme'

export const THEME_COLORS = { light: '#f6f3ec', dark: '#0b1517' } as const

let mediaQuery: MediaQueryList | null = null
let currentPreference: ThemePreference = 'system'

function resolve(preference: ThemePreference): 'light' | 'dark' {
  if (preference !== 'system') return preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function paint() {
  const resolved = resolve(currentPreference)
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute('content', THEME_COLORS[resolved])
  })
}

export function applyTheme(preference: ThemePreference): void {
  if (typeof window === 'undefined') return
  currentPreference = preference
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // storage blocked: theme still applies for this session
  }
  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (currentPreference === 'system') paint()
    })
  }
  paint()
}

/** Inline script (runs before hydration) that applies the mirrored preference. */
export const themeInitScript = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d)r.classList.add('dark');r.style.colorScheme=d?'dark':'light';}catch(e){}})();`
