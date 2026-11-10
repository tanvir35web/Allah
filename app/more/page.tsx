import type { Metadata } from 'next'
import { ArabicText } from '@/components/common/localized-text'
import { PageShell } from '@/components/layout/page-shell'
import { MoreMenu } from '@/components/navigation/more-menu'
import { ConnectionStatus } from '@/components/pwa/connection-status'

export const metadata: Metadata = { title: 'More' }

export default function MorePage() {
  return (
    <PageShell title="More" maxWidth="narrow">
      <MoreMenu />

      <footer className="mt-10 flex flex-col items-center gap-4 text-center">
        <figure>
          <blockquote>
            <ArabicText className="block text-2xl leading-[1.9] text-primary">
              وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا
            </ArabicText>
            <p className="mt-1 text-sm text-muted-foreground">
              “And to Allah belong the best names, so invoke Him by them.”
            </p>
          </blockquote>
          <figcaption className="mt-1 text-xs text-muted-foreground/80">Al-Aʿraf 7:180</figcaption>
        </figure>
        <ConnectionStatus />
      </footer>
    </PageShell>
  )
}
