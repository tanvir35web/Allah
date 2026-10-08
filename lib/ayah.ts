/**
 * The home "Ayah" card. Kept apart from `lib/surahs.ts` so the client never
 * bundles the full surah text: it fetches one surah's ayahs at a time from
 * the static `/quran/{id}.json` files.
 */
import type { Random } from '@/lib/random'

/** Ayahs per surah, 1 to 114. Checked against the surah data in tests. */
export const AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77,
  227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55,
  78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36,
  25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
] as const

/**
 * Al-Fatihah is left out: its IndoPak ayah marks follow a count that does
 * not number the Bismillah, so they do not line up with the Bangla ayahs.
 */
export const FIRST_AYAH_SURAH = 2

export interface SurahAyahs {
  id: number
  transliteration: string
  banglaName: string
  ayahs: { number: number; arabic: string; bangla: string }[]
}

export function surahAyahsUrl(id: number): string {
  return `/quran/${id}.json`
}

/** An ayah-end mark and number, plus any waqf or ruku signs written against it. */
const AYAH_END = /[۝‮][٠-٩]+\S*/g

/** Splits a surah's continuous IndoPak text into ayahs, each keeping its end mark. */
export function splitArabicAyahs(arabic: string): string[] {
  const ayahs: string[] = []
  let start = 0
  for (const match of arabic.matchAll(AYAH_END)) {
    const end = match.index + match[0].length
    ayahs.push(arabic.slice(start, end).trim())
    start = end
  }
  return ayahs
}

/** A random ayah, every ayah from Al-Baqarah on equally likely. `random` returns [0, 1). */
export function pickRandomAyah(random: Random = Math.random): { surah: number; ayah: number } {
  const counts = AYAH_COUNTS.slice(FIRST_AYAH_SURAH - 1)
  let index = Math.floor(random() * counts.reduce((sum, count) => sum + count, 0))
  for (const [offset, count] of counts.entries()) {
    if (index < count) return { surah: FIRST_AYAH_SURAH + offset, ayah: index + 1 }
    index -= count
  }
  throw new Error('Random source returned a value outside [0, 1)')
}
