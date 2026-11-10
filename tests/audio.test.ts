import { describe, expect, it } from 'vitest'
import audio from '@/data/audio.json'
import { AYAH_COUNTS } from '@/lib/ayah'
import { ayahAudioUrl, hasAudio, surahPlaylist } from '@/lib/audio'

describe('bundled recitation', () => {
  it('lists each surah with its real ayah count', () => {
    for (const { id, ayahs } of audio.surahs) expect(ayahs, `surah ${id}`).toBe(AYAH_COUNTS[id - 1])
  })

  it('knows which surahs have audio', () => {
    expect(hasAudio(1)).toBe(true)
    expect(hasAudio(114)).toBe(true)
    expect(hasAudio(3)).toBe(false)
  })

  it('names files by surah and ayah', () => {
    expect(ayahAudioUrl(1, 7)).toBe('/audio/alafasy/001007.mp3')
    expect(ayahAudioUrl(114, 1)).toBe('/audio/alafasy/114001.mp3')
  })

  it('plays the Bismillah first, except in Al-Fatihah (its ayah 1) and At-Tawbah', () => {
    expect(surahPlaylist(114, 6).map((track) => track.ayah)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(surahPlaylist(114, 6)[0]?.url).toBe('/audio/alafasy/001001.mp3')
    expect(surahPlaylist(1, 7).map((track) => track.ayah)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(surahPlaylist(9, 129)[0]?.ayah).toBe(1)
  })
})
