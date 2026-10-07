/**
 * Post-build step: walks the static export in `out/`, builds the precache
 * list and writes `out/sw.js` from `scripts/sw-template.js`.
 *
 * The cache version is a hash of every precached file's content, so any
 * change to the app produces a new service worker and fresh caches.
 */
import { createHash } from 'node:crypto'
import { readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const outDir = path.join(root, 'out')

/** Not needed offline: iOS fetches splash images itself at install time. */
const EXCLUDE = [/^\/splash\//, /^\/sw\.js$/, /\.map$/, /^\/_next\/static\/.*\/_buildManifest\.js$/i, /^\/_next\/static\/.*\/_ssgManifest\.js$/i]

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name)
      return entry.isDirectory() ? walk(full) : [full]
    }),
  )
  return files.flat()
}

function toUrl(file) {
  let url = '/' + path.relative(outDir, file).split(path.sep).join('/')
  // `/names/1/index.html` is served at `/names/1/`.
  if (url.endsWith('/index.html')) url = url.slice(0, -'index.html'.length)
  return url
}

/**
 * The static exporter writes segment prefetch payloads as nested folders
 * (`quiz/__next.quiz/__PAGE__.txt`) while the client router requests a flat
 * file name (`quiz/__next.quiz.__PAGE__.txt`, see
 * convertSegmentPathToStaticExportFilename in Next.js). Flatten them so
 * prefetches resolve on any static host instead of returning 404.
 */
async function flattenSegmentFiles() {
  let moved = 0
  for (const file of await walk(outDir)) {
    const relative = path.relative(outDir, file).split(path.sep)
    const segmentDirIndex = relative.findIndex((part, index) => part.startsWith('__next.') && index < relative.length - 1)
    if (segmentDirIndex === -1) continue
    const routeDir = relative.slice(0, segmentDirIndex)
    const flatName = relative.slice(segmentDirIndex).join('.')
    const target = path.join(outDir, ...routeDir, flatName)
    await rename(file, target)
    moved += 1
  }
  // Remove the now-empty segment folders.
  const dirs = new Set()
  const collect = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const full = path.join(dir, entry.name)
      if (entry.name.startsWith('__next.')) dirs.add(full)
      else await collect(full)
    }
  }
  await collect(outDir)
  await Promise.all([...dirs].map((dir) => rm(dir, { recursive: true, force: true })))
  return moved
}

async function main() {
  try {
    await stat(outDir)
  } catch {
    throw new Error('out/ not found. Run `next build` first.')
  }

  const flattened = await flattenSegmentFiles()
  if (flattened) console.log(`[sw] Flattened ${flattened} segment prefetch files`)

  const files = (await walk(outDir)).sort()
  const hash = createHash('sha256')
  const urls = []
  let totalBytes = 0

  for (const file of files) {
    const url = toUrl(file)
    if (EXCLUDE.some((pattern) => pattern.test(url))) continue
    const content = await readFile(file)
    hash.update(url).update(content)
    totalBytes += content.length
    // Normalise exactly like the browser does, so cache keys match requests.
    urls.push(new URL(url, 'https://example.invalid').pathname)
  }

  const template = await readFile(path.join(import.meta.dirname, 'sw-template.js'), 'utf8')
  hash.update(template)
  const version = hash.digest('hex').slice(0, 12)
  const sw = template
    .replace('__CACHE_VERSION__', version)
    .replace('__PRECACHE_URLS__', JSON.stringify(urls, null, 0))

  await writeFile(path.join(outDir, 'sw.js'), sw)
  console.log(
    `[sw] Precaching ${urls.length} files (${(totalBytes / 1024 / 1024).toFixed(2)} MB), version ${version}`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
