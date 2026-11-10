/**
 * Whether the desktop sidebar is collapsed to icons. A per-device layout
 * preference, so it lives in localStorage (not IndexedDB) and is mirrored as
 * `data-sidebar="collapsed"` on <html>, which drives `--sidebar-width`.
 */
export const SIDEBAR_STORAGE_KEY = 'asma-sidebar'

const listeners = new Set<() => void>()

export function isSidebarCollapsed(): boolean {
  return document.documentElement.dataset.sidebar === 'collapsed'
}

export function setSidebarCollapsed(collapsed: boolean): void {
  const root = document.documentElement
  if (collapsed) root.dataset.sidebar = 'collapsed'
  else delete root.dataset.sidebar
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? 'collapsed' : 'expanded')
  } catch {
    // storage blocked: the choice still applies for this session
  }
  listeners.forEach((listener) => listener())
}

export function subscribeSidebar(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Inline script (runs before hydration) that restores the saved state without a layout jump. */
export const sidebarInitScript = `(function(){try{if(localStorage.getItem('${SIDEBAR_STORAGE_KEY}')==='collapsed')document.documentElement.dataset.sidebar='collapsed';}catch(e){}})();`
