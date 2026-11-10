/* global self, caches */
/**
 * Service worker for the 99 Names PWA.
 * Generated at build time by scripts/generate-sw.mjs — do not edit out/sw.js.
 *
 * Strategy
 * - Install: precache every file of the static export (HTML, RSC payloads,
 *   JS, CSS, fonts, icons). The whole app therefore works offline after the
 *   first visit, including pages that were never opened.
 * - Audio (/audio/): not precached; cached in AUDIO the first time each file
 *   plays (byte-range requests answered from the cached file).
 * - Fetch: serve precached responses first (they are versioned by build),
 *   otherwise go to the network and keep a runtime copy.
 * - Update: a new build has a new CACHE_VERSION. The new worker waits until
 *   the page asks it to activate (the app shows an "Update available" prompt).
 */
const CACHE_VERSION = '__CACHE_VERSION__'
const PRECACHE = `precache-${CACHE_VERSION}`
const RUNTIME = 'runtime-v1'
/**
 * Recitation audio (/audio/…): not precached (it is large), but kept here the
 * first time each file plays, so it works offline afterwards. Files are named
 * by surah and ayah and never change, so this cache survives app updates.
 */
const AUDIO = 'audio-v1'
const PRECACHE_URLS = __PRECACHE_URLS__
const OFFLINE_FALLBACK = '/'

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE)
      // Add in small batches so one slow request does not stall everything.
      const batchSize = 20
      for (let i = 0; i < PRECACHE_URLS.length; i += batchSize) {
        await cache.addAll(PRECACHE_URLS.slice(i, i + batchSize).map((url) => new Request(url, { cache: 'reload' })))
      }
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key.startsWith('precache-') && key !== PRECACHE).map((key) => caches.delete(key)),
      )
      // Runtime entries may belong to an old build; start fresh.
      await caches.delete(RUNTIME)
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

/** `/names/1` → `/names/1/` so it matches the exported `index.html`. */
function normalizeNavigationPath(url) {
  const { pathname } = url
  if (pathname.endsWith('/')) return pathname
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname
  return `${pathname}/`
}

async function fromPrecache(request, path) {
  const cache = await caches.open(PRECACHE)
  return cache.match(path || request, { ignoreSearch: true })
}

async function handleNavigation(request) {
  const url = new URL(request.url)
  const cached = await fromPrecache(request, normalizeNavigationPath(url))
  if (cached) return cached
  try {
    return await fetch(request)
  } catch {
    return (await fromPrecache(request, '/404.html')) || (await fromPrecache(request, OFFLINE_FALLBACK)) || Response.error()
  }
}

async function handleAsset(request) {
  const cached = await fromPrecache(request)
  if (cached) return cached
  const runtime = await caches.open(RUNTIME)
  const runtimeHit = await runtime.match(request)
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') runtime.put(request, response.clone())
    return response
  } catch (error) {
    if (runtimeHit) return runtimeHit
    throw error
  }
}

/**
 * Audio: cache first; on a miss, fetch the whole file (without the Range
 * header), keep it, and serve from it. Browsers (Safari especially) ask for
 * media in byte ranges and need a 206 Partial Content reply, so a Range
 * request is answered with the requested slice of the cached file.
 */
async function handleAudio(request, url) {
  const cache = await caches.open(AUDIO)
  const key = url.origin + url.pathname
  let response = await cache.match(key)
  if (!response) {
    const fresh = await fetch(key)
    if (!fresh.ok || fresh.status !== 200) return fresh
    await cache.put(key, fresh.clone())
    response = fresh
  }

  const range = request.headers.get('range')
  const match = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim())
  if (!match) return response

  const blob = await response.blob()
  const size = blob.size
  let start = match[1] ? Number(match[1]) : NaN
  let end = match[2] ? Number(match[2]) : size - 1
  if (Number.isNaN(start)) {
    // "bytes=-N": the last N bytes.
    start = Math.max(0, size - end)
    end = size - 1
  }
  end = Math.min(end, size - 1)
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } })
  }
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
    },
  })
}

async function handleHead(request, url) {
  const cached = await fromPrecache(request, normalizeNavigationPath(url))
  if (cached) return new Response(null, { status: cached.status, headers: cached.headers })
  return fetch(request)
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname === '/sw.js') return

  // Next.js probes link targets with HEAD in static exports; answer offline too.
  if (request.method === 'HEAD') {
    event.respondWith(handleHead(request, url))
    return
  }
  if (request.method !== 'GET') return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
  if (url.pathname.startsWith('/audio/')) {
    event.respondWith(handleAudio(request, url))
    return
  }
  event.respondWith(handleAsset(request))
})
