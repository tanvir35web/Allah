/**
 * Search over the surah list. Kept apart from `lib/surahs.ts` so client
 * components can use it without bundling the full surah text.
 */
import { normalizeArabic, normalizeLatin, stripArticle } from '@/lib/storage/names'
import type { Surah } from '@/lib/types'

/** What the surah list shows and searches; small enough to send to the client. */
export type SurahSummary = Pick<
  Surah,
  'id' | 'arabicName' | 'transliteration' | 'banglaName' | 'banglaMeaning' | 'englishMeaning' | 'revelation'
> & { ayahCount: number }

export function toSurahSummary(surah: Surah): SurahSummary {
  const { id, arabicName, transliteration, banglaName, banglaMeaning, englishMeaning, revelation } = surah
  return { id, arabicName, transliteration, banglaName, banglaMeaning, englishMeaning, revelation, ayahCount: surah.ayahs.length }
}

const BANGLA_DIGITS = '০১২৩৪৫৬৭৮৯'

export function toBanglaDigits(value: number): string {
  return String(value).replace(/\d/g, (digit) => BANGLA_DIGITS.charAt(Number(digit)))
}

export function revelationLabel(surah: Pick<Surah, 'revelation'>): string {
  return surah.revelation === 'meccan' ? 'মাক্কী' : 'মাদানী'
}

/** Bangla digits to ASCII, so "১৮" finds surah 18. */
function toAsciiDigits(text: string): string {
  return text.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - 0x09e6))
}

/** Matches number, transliteration, English or Bangla name and meaning, or Arabic name. */
export function matchesSurahQuery(surah: SurahSummary, query: string): boolean {
  const trimmed = toAsciiDigits(query.trim())
  if (!trimmed) return true
  if (/^\d+$/.test(trimmed)) return surah.id === Number(trimmed)
  const latin = normalizeLatin(trimmed)
  const latinRoot = stripArticle(latin)
  const arabic = normalizeArabic(trimmed)
  return (
    (latin.length > 0 && normalizeLatin(`${surah.transliteration}|${surah.englishMeaning}`).includes(latin)) ||
    (latinRoot.length >= 2 && stripArticle(normalizeLatin(surah.transliteration)).includes(latinRoot)) ||
    (/[؀-ۿ]/.test(arabic) && normalizeArabic(surah.arabicName).includes(arabic)) ||
    `${surah.banglaName} ${surah.banglaMeaning}`.includes(trimmed)
  )
}
