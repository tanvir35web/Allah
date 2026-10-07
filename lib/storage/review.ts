import type { ReviewItem } from '@/lib/types'
import { getDB } from './db'

export async function getAllReviewItems(): Promise<ReviewItem[]> {
  const db = await getDB()
  return db.getAll('reviewItems')
}

export { recordNameReview } from './progress'
