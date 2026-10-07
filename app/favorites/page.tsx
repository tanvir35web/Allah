import type { Metadata } from 'next'
import { PageShell } from '@/components/layout/page-shell'
import { FavoritesList } from '@/components/names/favorites-list'

export const metadata: Metadata = { title: 'Favorites' }

export default function FavoritesPage() {
  return (
    <PageShell title="Favorites" variant="compact" backHref="/more/" backLabel="More">
      <FavoritesList />
    </PageShell>
  )
}
