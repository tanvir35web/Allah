import { describe, expect, it } from 'vitest'
import { AYAH_COUNTS, FIRST_AYAH_SURAH, pickRandomAyah, splitArabicAyahs } from '@/lib/ayah'
import { seededRandom } from '@/lib/random'
import { surahs } from '@/lib/surahs'

describe('Ayah card data', () => {
  it('has the ayah counts of the surah data', () => {
    expect(AYAH_COUNTS).toEqual(surahs.map((surah) => surah.ayahs.length))
  })

  it('splits every surah from Al-Baqarah into one Arabic ayah per Bangla ayah, each ending in its number', () => {
    for (const surah of surahs.filter((surah) => surah.id >= FIRST_AYAH_SURAH)) {
      const ayahs = splitArabicAyahs(surah.arabic)
      expect(ayahs, `surah ${surah.id}`).toHaveLength(surah.ayahs.length)
      ayahs.forEach((ayah, index) => {
        const number = String(index + 1).replace(/\d/g, (digit) => String.fromCharCode(0x0660 + Number(digit)))
        expect(ayah, `${surah.id}:${index + 1}`).toMatch(new RegExp(String.raw`\S\s*\u06DD${number}\S*$`))
      })
    }
  })

  it('picks from Al-Baqarah 1 to An-Nas 6, never Al-Fatihah', () => {
    expect(pickRandomAyah(() => 0)).toEqual({ surah: 2, ayah: 1 })
    expect(pickRandomAyah(() => 0.999_999_9)).toEqual({ surah: 114, ayah: 6 })
    const random = seededRandom(7)
    for (let i = 0; i < 2000; i += 1) {
      const { surah, ayah } = pickRandomAyah(random)
      expect(surah).toBeGreaterThanOrEqual(FIRST_AYAH_SURAH)
      expect(ayah).toBeGreaterThanOrEqual(1)
      expect(ayah).toBeLessThanOrEqual(AYAH_COUNTS[surah - 1] ?? 0)
    }
  })
})
