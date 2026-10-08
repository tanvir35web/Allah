import { bismillah, surahs } from '@/data/surahs'
import type { Surah } from '@/lib/types'

export { bismillah, surahs }

const BANGLA_DIGITS = '০১২৩৪৫৬৭৮৯'

export function getSurahById(id: number): Surah | undefined {
  return surahs.find((surah) => surah.id === id)
}

/** Neighbours in the reading list, which skips over gaps in Qur'an order. */
export function getAdjacentSurahs(id: number): { previous?: Surah; next?: Surah } {
  const index = surahs.findIndex((surah) => surah.id === id)
  if (index === -1) return {}
  return { previous: surahs[index - 1], next: surahs[index + 1] }
}

export function toBanglaDigits(value: number): string {
  return String(value).replace(/\d/g, (digit) => BANGLA_DIGITS.charAt(Number(digit)))
}

export function revelationLabel(surah: Surah): string {
  return surah.revelation === 'meccan' ? 'মাক্কী' : 'মাদানী'
}
