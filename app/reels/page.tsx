import type { Metadata } from 'next'
import { NameReels } from '@/components/reels/name-reels'

export const metadata: Metadata = {
  title: 'Reels',
  description: 'Swipe through the 99 Names of Allah, one Name per screen.',
}

export default function ReelsPage() {
  return <NameReels />
}
