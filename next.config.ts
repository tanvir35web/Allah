import type { NextConfig } from 'next'

/**
 * The app is fully client-side, so it is exported as static files.
 * Every route (including all 99 /names/[id] pages) is prerendered at build
 * time, which lets the service worker precache the entire app for offline use.
 */
const nextConfig: NextConfig = {
  output: 'export',
  // Emit `/names/1/index.html` so any static host can serve clean URLs.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
}

export default nextConfig
