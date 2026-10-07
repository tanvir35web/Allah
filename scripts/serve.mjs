/**
 * Minimal static server for the production build in `out/` (no dependencies).
 * Usage: npm run build && npm start   →  http://localhost:3000
 *
 * Service workers require a secure context. `localhost` qualifies; to test on
 * an iPhone, deploy to an HTTPS host or use an HTTPS tunnel (see README).
 */
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', 'out')
const portFlag = process.argv.findIndex((arg) => arg === '--port' || arg === '-p')
const port = Number(portFlag >= 0 ? process.argv[portFlag + 1] : process.env.PORT) || 3000
const host = process.env.HOST || '0.0.0.0'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath)
  const target = path.normalize(path.join(root, decoded))
  if (!target.startsWith(root)) return null
  const candidates = [target, path.join(target, 'index.html'), `${target}.html`]
  for (const candidate of candidates) {
    try {
      const info = await stat(candidate)
      if (info.isFile()) return candidate
    } catch {
      // try next
    }
  }
  return null
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost')
    // Mirror trailingSlash: true — redirect `/names` to `/names/`.
    if (!url.pathname.endsWith('/') && !path.extname(url.pathname)) {
      res.writeHead(308, { Location: `${url.pathname}/${url.search}` })
      res.end()
      return
    }
    const file = await resolveFile(url.pathname)
    const status = file ? 200 : 404
    const servePath = file ?? path.join(root, '404.html')
    const ext = path.extname(servePath)
    const headers = { 'Content-Type': MIME[ext] ?? 'application/octet-stream' }
    if (url.pathname.startsWith('/_next/static/')) headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    else headers['Cache-Control'] = 'no-cache'
    if (url.pathname === '/sw.js') headers['Service-Worker-Allowed'] = '/'
    res.writeHead(status, headers)
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    const stream = createReadStream(servePath)
    stream.on('error', () => res.destroy())
    res.on('close', () => stream.destroy())
    stream.pipe(res)
  } catch (error) {
    res.writeHead(500)
    res.end(String(error))
  }
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') console.error(`Port ${port} is in use. Try: npm start -- --port 4173`)
  else console.error(error)
  process.exit(1)
})

server.listen(port, host, () => {
  console.log(`Serving out/ at http://localhost:${port}`)
})
