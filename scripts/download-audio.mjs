/**
 * Downloads the bundled per-ayah recitation listed in data/audio.json into
 * public/audio/{reciter}/SSSAAA.mp3. Files that already exist are skipped, so
 * it is safe to re-run after adding surahs to the list.
 *
 *   node scripts/download-audio.mjs
 *
 * The source is the reciter's `source` URL in data/audio.json. Check that
 * source's terms of use before shipping its files with the app.
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const config = JSON.parse(await readFile(path.join(root, 'data', 'audio.json'), 'utf8'))
const { reciter, surahs } = config
const outDir = path.join(root, 'public', 'audio', reciter.id)
await mkdir(outDir, { recursive: true })

const pad = (n) => String(n).padStart(3, '0')
const exists = (file) =>
  stat(file).then(
    () => true,
    () => false,
  )

// Every surah's ayahs, plus Al-Fatihah 1, which is also played as the Bismillah before other surahs.
const files = new Set(['001001.mp3'])
for (const { id, ayahs } of surahs) {
  for (let ayah = 1; ayah <= ayahs; ayah += 1) files.add(`${pad(id)}${pad(ayah)}.mp3`)
}

let downloaded = 0
let skipped = 0
let bytes = 0
for (const name of [...files].sort()) {
  const target = path.join(outDir, name)
  if (await exists(target)) {
    skipped += 1
    continue
  }
  const url = `${reciter.source}/${name}`
  const response = await fetch(url, { headers: { 'User-Agent': 'asma-ul-husna-audio-script' } })
  const type = response.headers.get('content-type') ?? ''
  if (!response.ok || !/audio|octet-stream/.test(type)) {
    throw new Error(`Failed to download ${url}: HTTP ${response.status} (${type || 'no content type'})`)
  }
  const data = Buffer.from(await response.arrayBuffer())
  if (data.length === 0) throw new Error(`Empty file from ${url}`)
  await writeFile(target, data)
  downloaded += 1
  bytes += data.length
  console.log(`[audio] ${name} (${(data.length / 1024).toFixed(0)} KB)`)
}

console.log(
  `[audio] ${downloaded} downloaded (${(bytes / 1024 / 1024).toFixed(2)} MB), ${skipped} already present, in ${path.relative(root, outDir)}`,
)
