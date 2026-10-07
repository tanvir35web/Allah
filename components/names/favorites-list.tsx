'use client'

import { Star } from 'lucide-react'
import { useMemo } from 'react'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingState } from '@/components/common/loading-state'
import { useAppData } from '@/components/providers/app-data-provider'
import { ButtonLink } from '@/components/ui/button'
import { allahNames } from '@/lib/storage/names'
import { NameList } from './name-list'

export function FavoritesList() {
  const { ready, favorites } = useAppData()
  const names = useMemo(() => {
    const set = new Set(favorites)
    return allahNames.filter((name) => set.has(name.id))
  }, [favorites])

  if (!ready) return <LoadingState rows={3} />
  if (names.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No favorites yet"
        description="Tap ☆ on any Name to save it here."
        action={<ButtonLink href="/names/">Browse Names</ButtonLink>}
      />
    )
  }
  return (
    <div className="space-y-4">
      <p className="px-1 text-sm text-muted-foreground">
        {names.length} saved {names.length === 1 ? 'Name' : 'Names'}
      </p>
      <NameList names={names} showControls={false} />
    </div>
  )
}
