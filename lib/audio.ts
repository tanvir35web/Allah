/**
 * Bundled Quran recitation: one MP3 per ayah, for the surahs listed in
 * `data/audio.json`, stored in `public/audio/{reciter}/SSSAAA.mp3` (e.g.
 * `001007.mp3` is Al-Fatihah 7). `scripts/download-audio.mjs` fetches them.
 * Being part of the static export, the service worker precaches them, so
 * they play offline.
 */
import audio from '@/data/audio.json'

export const RECITER = audio.reciter

const BUNDLED = new Set(audio.surahs.map((surah) => surah.id))

export function hasAudio(surahId: number): boolean {
  return BUNDLED.has(surahId)
}

const pad = (n: number) => String(n).padStart(3, '0')

/** URL of one ayah's recitation. */
export function ayahAudioUrl(surahId: number, ayah: number): string {
  return `/audio/${RECITER.id}/${pad(surahId)}${pad(ayah)}.mp3`
}

/** One step of a surah's recitation. Ayah 0 is the Bismillah recited before it. */
export interface AudioTrack {
  ayah: number
  url: string
}

/**
 * The surah's recitation in order. Every surah but Al-Fatihah (where it is
 * ayah 1) and At-Tawbah (which has none) starts with the Bismillah, played
 * from Al-Fatihah's first ayah.
 */
export function surahPlaylist(surahId: number, ayahCount: number): AudioTrack[] {
  const tracks: AudioTrack[] = []
  if (surahId !== 1 && surahId !== 9) tracks.push({ ayah: 0, url: ayahAudioUrl(1, 1) })
  for (let ayah = 1; ayah <= ayahCount; ayah += 1) tracks.push({ ayah, url: ayahAudioUrl(surahId, ayah) })
  return tracks
}
