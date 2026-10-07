import type { Metadata } from 'next'
import { ArabicText } from '@/components/common/localized-text'
import { PageShell } from '@/components/layout/page-shell'
import { Card, SectionTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'About',
  description: 'About the 99 Names of Allah app: sources, privacy and offline use.',
}

const APP_VERSION = '1.0.0'

export default function AboutPage() {
  return (
    <PageShell title="About" variant="compact" backHref="/more/" backLabel="More">
      <div className="space-y-6">
        <Card className="pattern-stars overflow-hidden p-6 text-center">
          <ArabicText className="block text-5xl leading-[1.8]">الْأَسْمَاءُ الْحُسْنَىٰ</ArabicText>
          <h2 className="mt-2 text-xl font-semibold">99 Names of Allah</h2>
          <p className="mt-1 text-sm text-muted-foreground">Learn, Remember & Reflect · v{APP_VERSION}</p>
        </Card>

        <section className="space-y-3" aria-labelledby="about-purpose">
          <SectionTitle id="about-purpose">Purpose</SectionTitle>
          <Card className="space-y-3 p-5 text-[0.95rem] leading-relaxed">
            <p>
              This app helps you learn the Beautiful Names of Allah, understand their meanings in English and Bangla, and
              keep them in your heart through short daily practice.
            </p>
            <p className="text-muted-foreground">
              The Prophet ﷺ said: “Allah has ninety-nine names, one hundred less one; whoever enumerates them will enter
              Paradise.” (Sahih al-Bukhari 2736, Sahih Muslim 2677)
            </p>
          </Card>
        </section>

        <section className="space-y-3" aria-labelledby="about-sources">
          <SectionTitle id="about-sources">About the list and meanings</SectionTitle>
          <Card className="space-y-3 p-5 text-[0.95rem] leading-relaxed">
            <p>
              The order follows the widely known list narrated in Jamiʿ at-Tirmidhi (3507). Scholars note that this
              list is a later compilation and that Allah’s Names are not limited to ninety-nine.
            </p>
            <p className="text-muted-foreground">
              The English and Bangla meanings are short, common renderings meant for learning. No translation can fully
              convey a Divine Name; please consult qualified scholars and trusted works for deeper study.
            </p>
          </Card>
        </section>

        <section className="space-y-3" aria-labelledby="about-privacy">
          <SectionTitle id="about-privacy">Privacy & offline use</SectionTitle>
          <Card className="space-y-3 p-5 text-[0.95rem] leading-relaxed">
            <p>
              There is no account, no analytics and no tracking. Your progress, favorites, quiz history and settings are
              stored only on this device (IndexedDB) and never leave it.
            </p>
            <p className="text-muted-foreground">
              After the first visit the whole app is saved for offline use. Clearing Safari website data or deleting
              the Home Screen app removes your local progress.
            </p>
          </Card>
        </section>
      </div>
    </PageShell>
  )
}
