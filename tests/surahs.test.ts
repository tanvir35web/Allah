import { describe, expect, it } from 'vitest'
import { bismillah, getAdjacentSurahs, surahs, toBanglaDigits } from '@/lib/surahs'

/** Ayah counts from the standard Hafs numbering. */
const AYAH_COUNTS: Record<number, number> = {
  1: 7, 36: 83, 55: 78, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11, 101: 11, 102: 8, 103: 3, 104: 9,
  105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3, 111: 5, 112: 4, 113: 5, 114: 6,
}

describe('Surah data', () => {
  it('contains Al-Fatihah, Ya-Sin, Ar-Rahman and surahs 96 to 114 in order', () => {
    expect(surahs.map((surah) => surah.id)).toEqual([1, 36, 55, ...Array.from({ length: 19 }, (_, index) => 96 + index)])
  })

  it('has the correct number of ayahs, numbered from 1', () => {
    for (const surah of surahs) {
      expect(surah.ayahs, `surah ${surah.id}`).toHaveLength(AYAH_COUNTS[surah.id] ?? -1)
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
  it('links neighbours across gaps in Qur’an order', () => {
    expect(getAdjacentSurahs(1).next?.id).toBe(36)
    expect(getAdjacentSurahs(36).next?.id).toBe(55)
    expect(getAdjacentSurahs(55).next?.id).toBe(96)
    expect(getAdjacentSurahs(96).previous?.id).toBe(55)
    expect(getAdjacentSurahs(114).next).toBeUndefined()
  })

  it('converts digits to Bangla', () => {
    expect(toBanglaDigits(19)).toBe('১৯')
  })
})
