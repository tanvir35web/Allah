import type { Metadata, Viewport } from 'next'
import { Amiri, Hind_Siliguri, Plus_Jakarta_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { AppDataProvider } from '@/components/providers/app-data-provider'
import { ServiceWorkerRegistrar } from '@/components/pwa/service-worker-registrar'
import { SPLASH_SCREENS } from '@/lib/pwa'
import { THEME_COLORS, themeInitScript } from '@/lib/theme'
import './globals.css'

// Fonts are downloaded at build time and self-hosted, so they work offline.
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' })
const amiri = Amiri({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-amiri', display: 'swap' })
const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '600'],
  variable: '--font-hind-siliguri',
  display: 'swap',
})
// DigitalKhatt IndoPak (SIL OFL 1.1, see app/fonts/), for the surah reader.
const indopak = localFont({
  src: './fonts/digitalkhatt-indopak.woff2',
  variable: '--font-indopak',
  display: 'swap',
  preload: false,
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const TITLE = '99 Names of Allah — Learn, Remember & Reflect'
const DESCRIPTION =
  'Learn and memorise the 99 Names of Allah (Asma ul Husna) with meanings in English and Bangla, daily practice, quizzes and gentle review. Free, private and offline.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · 99 Names of Allah' },
  description: DESCRIPTION,
  applicationName: '99 Names',
  keywords: ['99 Names of Allah', 'Asma ul Husna', 'Asmaul Husna', 'আল্লাহর ৯৯ নাম', 'Islam', 'learn', 'quiz'],
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    title: '99 Names',
    statusBarStyle: 'black-translucent',
    startupImage: SPLASH_SCREENS.flatMap(({ width, height, ratio }) =>
      (['light', 'dark'] as const).map((scheme) => ({
        url: `/splash/splash-${width * ratio}x${height * ratio}${scheme === 'dark' ? '-dark' : ''}.png`,
        media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait) and (prefers-color-scheme: ${scheme})`,
      })),
    ),
  },
  // Older iOS versions only read the apple-prefixed tag.
  other: { 'apple-mobile-web-app-capable': 'yes' },
  openGraph: {
    type: 'website',
    siteName: '99 Names of Allah',
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: '99 Names of Allah' }],
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/icons/icon-512.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${jakarta.variable} ${amiri.variable} ${hindSiliguri.variable} ${indopak.variable}`}
    >
      <head>
        {/* Applies the saved theme before first paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-[calc(env(safe-area-inset-top)+0.5rem)] focus:left-4 focus:z-50 focus:rounded-xl focus:bg-card focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to content
        </a>
        <AppDataProvider>
          {children}
          <BottomNav />
        </AppDataProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
