import { bismillah, surahs } from '@/data/surahs'
import type { Surah } from '@/lib/types'

export { bismillah, surahs }
export { revelationLabel, toBanglaDigits } from '@/lib/surah-search'

export function getSurahById(id: number): Surah | undefined {
  return surahs.find((surah) => surah.id === id)
}

/** Neighbours in the reading list, which skips over gaps in Qur'an order. */
export function getAdjacentSurahs(id: number): { previous?: Surah; next?: Surah } {
  const index = surahs.findIndex((surah) => surah.id === id)
  if (index === -1) return {}
  return { previous: surahs[index - 1], next: surahs[index + 1] }
}
