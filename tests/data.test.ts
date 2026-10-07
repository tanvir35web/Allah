import { describe, expect, it } from 'vitest'
import { allahNames, getNameById } from '@/data/allah-names'
import { matchesQuery, normalizeArabic, searchNames } from '@/lib/storage/names'
import type { AllahName } from '@/lib/types'

const REQUIRED_FIELDS: (keyof AllahName)[] = [
  'arabic',
  'transliteration',
  'banglaName',
  'englishName',
  'englishMeaning',
  'banglaMeaning',
  'shortExplanationEn',
  'shortExplanationBn',
]

describe('99 Names data', () => {
  it('contains exactly 99 names', () => {
    expect(allahNames).toHaveLength(99)
  })

  it('has unique ids numbered 1 to 99 in order', () => {
    expect(allahNames.map((name) => name.id)).toEqual(Array.from({ length: 99 }, (_, index) => index + 1))
  })

  it('has every required field filled in', () => {
    for (const name of allahNames) {
      for (const field of REQUIRED_FIELDS) {
        const value = name[field]
        expect(typeof value, `#${name.id} ${field}`).toBe('string')
        expect((value as string).trim().length, `#${name.id} ${field}`).toBeGreaterThan(0)
      }
    }
  })

  it('uses Arabic script for Arabic and Bengali script for Bangla fields', () => {
    for (const name of allahNames) {
      expect(name.arabic, `#${name.id}`).toMatch(/^[\u0600-\u06FF\s]+$/)
      expect(name.banglaMeaning, `#${name.id}`).toMatch(/[\u0980-\u09FF]/)
      expect(name.shortExplanationBn, `#${name.id}`).toMatch(/[\u0980-\u09FF]/)
    }
  })

  // Quiz answers must be unambiguous, so these must be unique per Name.
  it.each(['arabic', 'transliteration', 'englishName', 'banglaMeaning'] as const)('has unique %s values', (field) => {
    const values = allahNames.map((name) => name[field])
    expect(new Set(values).size).toBe(values.length)
  })

  it('looks names up by id', () => {
    expect(getNameById(1)?.transliteration).toBe('Ar-Rahman')
    expect(getNameById(99)?.transliteration).toBe('As-Sabur')
    expect(getNameById(100)).toBeUndefined()
  })
})

describe('name search', () => {
  const rahman = getNameById(1)!

  it('matches transliteration loosely', () => {
    expect(matchesQuery(rahman, 'rahman')).toBe(true)
    expect(matchesQuery(rahman, 'Ar Rahman')).toBe(true)
    expect(matchesQuery(rahman, 'ar-rahman')).toBe(true)
  })

  it('matches English meaning, Bangla and Arabic without diacritics', () => {
    expect(matchesQuery(rahman, 'gracious')).toBe(true)
    expect(matchesQuery(rahman, 'করুণাময়')).toBe(true)
    expect(matchesQuery(rahman, 'الرحمن')).toBe(true)
    expect(normalizeArabic('الرَّحْمَٰنُ')).toBe('الرحمن')
  })

  it('matches by number', () => {
    expect(searchNames('42').map((name) => name.id)).toEqual([42])
  })

  it('does not match everything for a bare article', () => {
    expect(searchNames('al').length).toBeLessThan(99)
    expect(searchNames('').length).toBe(99)
  })
})
