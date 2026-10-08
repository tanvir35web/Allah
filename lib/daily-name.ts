import type { AllahName } from '@/lib/types'

/**
 * A random Name for the home card, never the one shown last (`previousId`)
 * so every page load shows something new. `random` returns [0, 1).
 */
export function pickRandomName(
  names: readonly AllahName[],
  previousId?: number,
  random: () => number = Math.random,
): AllahName {
  const pool = names.length > 1 ? names.filter((name) => name.id !== previousId) : names
  const name = pool[Math.floor(random() * pool.length)]
  if (!name) throw new Error('Names data is empty')
  return name
}
