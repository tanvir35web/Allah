import { describe, expect, it } from 'vitest'
import { AYAH_COUNTS, FIRST_AYAH_SURAH, pickRandomAyah, splitArabicAyahs, surahArabicSegments } from '@/lib/ayah'
import { seededRandom } from '@/lib/random'
import { bismillah, surahs } from '@/lib/surahs'

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

  it('splits every surah into bookmarkable segments that keep all its text and cover every Bangla ayah', () => {
    for (const surah of surahs) {
      const { heading, body } = surahArabicSegments(surah.id, surah.arabic, bismillah)
      const segments = heading ? [heading, ...body] : body
      // No text dropped: the segments rebuild the surah, ignoring spacing.
      expect(segments.map((segment) => segment.text).join('').replace(/\s/g, ''), `surah ${surah.id}`).toBe(
        surah.arabic.replace(/\s/g, ''),
      )
      expect([...new Set(segments.map((segment) => segment.ayah))], `surah ${surah.id}`).toEqual(
        surah.ayahs.map((ayah) => ayah.number),
      )
    }
  })

  it('maps Al-Fatihah: Bismillah is ayah 1 and the last two IndoPak marks are both ayah 7', () => {
    const fatihah = surahs[0]!
    const { heading, body } = surahArabicSegments(1, fatihah.arabic, bismillah)
    expect(heading).toEqual({ text: `${bismillah} ۝`, ayah: 1 })
    expect(body.map((segment) => segment.ayah)).toEqual([2, 3, 4, 5, 6, 7, 7])
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
