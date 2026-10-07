import type { FavoriteRecord } from '@/lib/types'
import { getDB } from './db'

export async function getAllFavorites(): Promise<FavoriteRecord[]> {
  const db = await getDB()
  return db.getAll('favorites')
}

export async function isFavorite(nameId: number): Promise<boolean> {
  const db = await getDB()
  return (await db.getKey('favorites', nameId)) !== undefined
}

/** Toggles a favorite and returns the new state. */
export async function toggleFavorite(nameId: number, now: Date = new Date()): Promise<boolean> {
  const db = await getDB()
  const tx = db.transaction('favorites', 'readwrite')
  const exists = (await tx.store.getKey(nameId)) !== undefined
  if (exists) await tx.store.delete(nameId)
  else await tx.store.put({ nameId, createdAt: now.toISOString() })
  await tx.done
  return !exists
}
