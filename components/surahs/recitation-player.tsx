'use client'

import { Loader2, Pause, Play } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RECITER, surahPlaylist } from '@/lib/audio'
import { cn } from '@/lib/utils'

export interface Recitation {
  /** The ayah being recited (0 = the Bismillah before it), or null when stopped. */
  ayah: number | null
  playing: boolean
  loading: boolean
  error: boolean
  /** Starts at a given ayah, or resumes / starts from the beginning. */
  play: (fromAyah?: number) => void
  pause: () => void
  stop: () => void
  next: () => void
  previous: () => void
  index: number | null
  total: number
}

/**
 * Plays a surah ayah by ayah from the bundled files, moving on to the next
 * ayah when one ends. One <audio> element is reused for every ayah.
 * Also wires up the lock screen / media keys (Media Session API).
 */
export function useRecitation(surahId: number, surahName: string, ayahCount: number, enabled: boolean): Recitation {
  const tracks = useMemo(() => (enabled ? surahPlaylist(surahId, ayahCount) : []), [enabled, surahId, ayahCount])
  const audio = useRef<HTMLAudioElement | null>(null)
  const [index, setIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const load = useCallback(
    (at: number) => {
      const element = audio.current
      const track = tracks[at]
      if (!element || !track) return
      setIndex(at)
      setError(false)
      setLoading(true)
      element.src = track.url
      element.play().catch((reason: unknown) => {
        // A newer load interrupted this one: not an error.
        if (reason instanceof DOMException && reason.name === 'AbortError') return
        setError(true)
        setPlaying(false)
        setLoading(false)
      })
    },
    [tracks],
  )

  // The audio element lives as long as the page; listeners keep state in sync with it.
  useEffect(() => {
    if (!enabled) return
    const element = new Audio()
    element.preload = 'auto'
    audio.current = element
    const onPlaying = () => {
      setPlaying(true)
      setLoading(false)
    }
    const onPause = () => setPlaying(false)
    const onWaiting = () => setLoading(true)
    const onError = () => {
      setError(true)
      setPlaying(false)
      setLoading(false)
    }
    element.addEventListener('playing', onPlaying)
    element.addEventListener('pause', onPause)
    element.addEventListener('waiting', onWaiting)
    element.addEventListener('error', onError)
    return () => {
      element.pause()
      element.removeAttribute('src')
      element.removeEventListener('playing', onPlaying)
      element.removeEventListener('pause', onPause)
      element.removeEventListener('waiting', onWaiting)
      element.removeEventListener('error', onError)
      audio.current = null
    }
  }, [enabled])

  // When an ayah ends, go on to the next; stop after the last.
  useEffect(() => {
    const element = audio.current
    if (!element) return
    const onEnded = () => {
      if (index !== null && index < tracks.length - 1) load(index + 1)
      else {
        setIndex(null)
        setPlaying(false)
      }
    }
    element.addEventListener('ended', onEnded)
    return () => element.removeEventListener('ended', onEnded)
  }, [index, tracks.length, load])

  const play = useCallback(
    (fromAyah?: number) => {
      const element = audio.current
      if (!element) return
      if (fromAyah !== undefined) {
        const at = tracks.findIndex((track) => track.ayah === fromAyah)
        load(at === -1 ? 0 : at)
      } else if (index !== null && !error) {
        void element.play().catch(() => setError(true))
      } else {
        load(index ?? 0)
      }
    },
    [tracks, index, error, load],
  )
  const pause = useCallback(() => audio.current?.pause(), [])
  const stop = useCallback(() => {
    audio.current?.pause()
    setIndex(null)
    setError(false)
  }, [])
  const next = useCallback(() => {
    if (index !== null && index < tracks.length - 1) load(index + 1)
  }, [index, tracks.length, load])
  const previous = useCallback(() => {
    if (index !== null && index > 0) load(index - 1)
  }, [index, load])

  const ayah = index === null ? null : (tracks[index]?.ayah ?? null)

  // Lock screen and media keys.
  useEffect(() => {
    if (!enabled || !('mediaSession' in navigator) || ayah === null) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: ayah === 0 ? `${surahName} · Bismillah` : `${surahName} · Ayah ${ayah}`,
      artist: RECITER.name,
      album: 'The Holy Quran',
      artwork: [{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }],
    })
    navigator.mediaSession.setActionHandler('play', () => play())
    navigator.mediaSession.setActionHandler('pause', pause)
    navigator.mediaSession.setActionHandler('nexttrack', next)
    navigator.mediaSession.setActionHandler('previoustrack', previous)
  }, [enabled, ayah, surahName, play, pause, next, previous])

  return { ayah, playing, loading, error, play, pause, stop, next, previous, index, total: tracks.length }
}

/**
 * A single round play/pause button in the bottom-right corner, kept on screen
 * while the surah is. A thin ring around it shows progress through the surah;
 * the ayah and reciter are in its tooltip and accessible name. The wrapper is
 * zero-height, so the button takes no room in the page. Next / previous stay
 * available from the lock screen and media keys.
 */
export function RecitationBar({
  recitation,
  ayahCount,
  bookmark,
}: {
  recitation: Recitation
  ayahCount: number
  bookmark?: number
}) {
  const { ayah, playing, loading, error, play, pause, index, total } = recitation
  const started = index !== null
  const status = error
    ? 'Audio is not available yet'
    : !started
      ? bookmark
        ? `Listen from Ayah ${bookmark}`
        : 'Listen to this surah'
      : ayah === 0
        ? 'Bismillah'
        : `Ayah ${ayah} of ${ayahCount}`
  const label = `${playing ? 'Pause' : 'Play'} recitation. ${status}. ${RECITER.name}.`

  // Progress ring: 48px button, 2.5px stroke.
  const size = 52
  const radius = (size - 3) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = started ? (index + 1) / total : 0

  return (
    <div className="pointer-events-none sticky bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom)+0.75rem)] z-20 h-0 lg:bottom-6">
      <button
        type="button"
        onClick={() => (playing ? pause() : play(started ? undefined : bookmark))}
        aria-label={label}
        title={`${status} · ${RECITER.name}`}
        className={cn(
          'pointer-events-auto absolute right-0 bottom-0 grid size-13 place-items-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95',
          error ? 'bg-danger-soft text-danger' : 'bg-primary text-primary-foreground',
        )}
      >
        {started && !error ? (
          <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={2.5} className="stroke-primary-foreground/25" />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - ratio)}
              className="stroke-primary-foreground transition-[stroke-dashoffset] duration-500"
            />
          </svg>
        ) : null}
        {loading && !error ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : playing ? (
          <Pause className="size-5 fill-current" aria-hidden />
        ) : (
          <Play className="ml-0.5 size-5 fill-current" aria-hidden />
        )}
      </button>
    </div>
  )
}
