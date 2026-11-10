import type { ThemePreference } from '@/lib/types'

/**
 * IndexedDB is the source of truth for the theme preference, but it is async.
 * A tiny mirror in localStorage lets an inline script apply the theme before
 * first paint, avoiding a light/dark flash. Only this one string is stored there.
 */
export const THEME_STORAGE_KEY = 'asma-theme'

export const THEME_COLORS = { light: '#f6f3ec', dark: '#0b1517' } as const

function paint(theme: ThemePreference) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute('content', THEME_COLORS[theme])
  })
}

export function applyTheme(preference: ThemePreference): void {
  if (typeof window === 'undefined') return
  // Older versions also stored 'system'; anything but light is dark, the default.
  const theme: ThemePreference = preference === 'light' ? 'light' : 'dark'
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // storage blocked: theme still applies for this session
  }
  paint(theme)
}

/**
 * Inline script (runs before hydration) that applies the mirrored preference.
 * Dark unless light was chosen, so first-time visitors start in dark.
 */
export const themeInitScript = `(function(){try{var d=localStorage.getItem('${THEME_STORAGE_KEY}')!=='light';var r=document.documentElement;if(d)r.classList.add('dark');r.style.colorScheme=d?'dark':'light';}catch(e){document.documentElement.classList.add('dark');}})();`
