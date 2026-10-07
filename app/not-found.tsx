import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { PageShell } from '@/components/layout/page-shell'
import { ButtonLink } from '@/components/ui/button'

export default function NotFound() {
  return (
    <PageShell title="Not found" variant="compact" backHref="/" backLabel="Home">
      <EmptyState
        icon={Compass}
        title="This page doesn’t exist"
        description="The page may have moved. Everything you need is a tap away."
        action={<ButtonLink href="/">Go home</ButtonLink>}
      />
    </PageShell>
  )
}
