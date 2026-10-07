import type { Metadata } from 'next'
import { ArabicText } from '@/components/common/localized-text'
import { PageShell } from '@/components/layout/page-shell'
import { MoreMenu } from '@/components/navigation/more-menu'

export const metadata: Metadata = { title: 'More' }

export default function MorePage() {
  return (
    <PageShell title="More">
      <MoreMenu />
      <figure className="mt-10 px-4 text-center">
        <blockquote>
          <ArabicText className="block text-2xl leading-[1.9]">وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا</ArabicText>
          <p className="mt-2 text-sm text-muted-foreground">
            “And to Allah belong the best names, so invoke Him by them.”
          </p>
        </blockquote>
        <figcaption className="mt-1 text-xs text-muted-foreground">Al-Aʿraf 7:180</figcaption>
      </figure>
    </PageShell>
  )
}
