import { describe, expect, it } from 'vitest'
import { matchesSurahQuery, toSurahSummary } from '@/lib/surah-search'
import { bismillah, getAdjacentSurahs, surahs, toBanglaDigits } from '@/lib/surahs'

/** Ayah counts from the standard Hafs numbering, surah 1 to 114. */
const AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111,
  43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64,
  77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83,
  182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29,
  18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28,
  20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25,
  22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19,
  5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
]

describe('Surah data', () => {
  it('contains all 114 surahs in order', () => {
    expect(surahs.map((surah) => surah.id)).toEqual(Array.from({ length: 114 }, (_, index) => index + 1))
  })

  it('has 6236 ayahs in total', () => {
    expect(AYAH_COUNTS.reduce((sum, count) => sum + count, 0)).toBe(6236)
    expect(surahs.reduce((sum, surah) => sum + surah.ayahs.length, 0)).toBe(6236)
  })

  it('has the correct number of ayahs, numbered from 1', () => {
    for (const surah of surahs) {
      expect(surah.ayahs, `surah ${surah.id}`).toHaveLength(AYAH_COUNTS[surah.id - 1] ?? -1)
      expect(surah.ayahs.map((ayah) => ayah.number)).toEqual(surah.ayahs.map((_, index) => index + 1))
    }
  })

  it('has one ayah-end mark in the Arabic for every Bangla ayah, in order', () => {
    for (const surah of surahs) {
      // U+06DD (or U+202E for Al-Fatihah's disputed ayah end) plus Arabic-Indic digits.
      const numbers = [...surah.arabic.matchAll(/[\u06DD\u202E]([\u0660-\u0669]+)/g)].map((match) =>
        Number([...(match[1] ?? '')].map((digit) => digit.charCodeAt(0) - 0x0660).join('')),
      )
      expect(numbers, `surah ${surah.id}`).toEqual(surah.ayahs.map((ayah) => ayah.number))
    }
  })

  it('uses Arabic script for Arabic and Bengali script for Bangla', () => {
    for (const surah of surahs) {
      expect(surah.arabic, `surah ${surah.id}`).toMatch(/^[\u0600-\u06FF\u0870-\u08FF\u034F\u202E\s]+$/)
      for (const ayah of surah.ayahs) {
        expect(ayah.bangla, `${surah.id}:${ayah.number}`).toMatch(/[ঀ-৿]/)
      }
    }
  })

  it('keeps the Bismillah in the text only for Al-Fatihah', () => {
    for (const surah of surahs) {
      expect(surah.arabic.startsWith(bismillah), `surah ${surah.id}`).toBe(surah.id === 1)
    }
  })
})

describe('Surah helpers', () => {
  it('links neighbours in Qur’an order', () => {
    expect(getAdjacentSurahs(1).previous).toBeUndefined()
    expect(getAdjacentSurahs(1).next?.id).toBe(2)
    expect(getAdjacentSurahs(18).previous?.id).toBe(17)
    expect(getAdjacentSurahs(18).next?.id).toBe(19)
    expect(getAdjacentSurahs(114).next).toBeUndefined()
  })

  it('converts digits to Bangla', () => {
    expect(toBanglaDigits(19)).toBe('১৯')
  })
})

describe('Surah search', () => {
  const summaries = surahs.map(toSurahSummary)
  const search = (query: string) => summaries.filter((surah) => matchesSurahQuery(surah, query)).map((surah) => surah.id)

  it('returns everything for an empty query', () => {
    expect(search('  ')).toHaveLength(114)
  })

  it('finds by number in English or Bangla digits', () => {
    expect(search('18')).toEqual([18])
    expect(search('১৮')).toEqual([18])
    expect(search('115')).toEqual([])
  })

  it('finds by transliteration regardless of case, article or punctuation', () => {
    expect(search('kahf')).toEqual([18])
    expect(search('AL KAHF')).toEqual([18])
    expect(search('al rahman')).toContain(55)
    expect(search('yasin')).toEqual([36])
  })

  it('finds by English meaning, Bangla name or meaning, and Arabic name', () => {
    expect(search('the cave')).toEqual([18])
    expect(search('কাহফ')).toEqual([18])
    expect(search('গুহা')).toEqual([18])
    expect(search('الملك')).toEqual([67])
  })

  it('does not send the surah text to the client', () => {
    expect(Object.keys(summaries[0] ?? {})).not.toContain('arabic')
    expect(Object.keys(summaries[0] ?? {})).not.toContain('ayahs')
  })
})
