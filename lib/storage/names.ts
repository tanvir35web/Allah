/**
 * Read-only access to the bundled Names data, plus search helpers.
 * The data itself ships with the app (and is precached by the service worker),
 * so it never needs to be written to IndexedDB.
 */
import { allahNames, getNameById, TOTAL_NAMES } from '@/data/allah-names'
import type { AllahName } from '@/lib/types'

export { allahNames, getNameById, TOTAL_NAMES }

const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g

/** Strips harakat/tatweel and unifies alef forms so plain Arabic input matches. */
export function normalizeArabic(text: string): string {
  return text.replace(ARABIC_DIACRITICS, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
}

/** Lowercases Latin text and drops punctuation so "al rahman" matches "Ar-Rahman". */
export function normalizeLatin(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’‘`ʿʾ\-\s]/g, '')
}

export function stripArticle(text: string): string {
  return text.replace(/^(ash|al|ar|as|at|ad|an|az)/, '')
}

const searchIndex = new Map(
  allahNames.map((name) => [
    name.id,
    {
      latin: normalizeLatin(`${name.transliteration}|${name.englishName}|${name.englishMeaning}`),
      root: stripArticle(normalizeLatin(name.transliteration)),
      arabic: normalizeArabic(name.arabic),
      bangla: `${name.banglaName} ${name.banglaMeaning}`,
    },
  ]),
)

export function matchesQuery(name: AllahName, query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return true
  if (/^\d+$/.test(trimmed)) return name.id === Number(trimmed)
  const entry = searchIndex.get(name.id)
  if (!entry) return false
  const latin = normalizeLatin(trimmed)
  const latinRoot = stripArticle(latin)
  const arabic = normalizeArabic(trimmed)
  return (
    (latin.length > 0 && entry.latin.includes(latin)) ||
    (latinRoot.length >= 2 && entry.root.includes(latinRoot)) ||
    (arabic.length > 0 && /[\u0600-\u06FF]/.test(arabic) && entry.arabic.includes(arabic)) ||
    entry.bangla.includes(trimmed)
  )
}

export function searchNames(query: string, names: readonly AllahName[] = allahNames): AllahName[] {
  return names.filter((name) => matchesQuery(name, query))
}
