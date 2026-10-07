import { DEFAULT_SETTINGS, type AppSettings } from '@/lib/types'
import { getDB } from './db'

const SETTINGS_ID = 'app' as const

/** Reads settings, filling in defaults for any keys added in newer versions. */
export async function getSettings(): Promise<AppSettings> {
  const db = await getDB()
  const record = await db.get('settings', SETTINGS_ID)
  if (!record) return { ...DEFAULT_SETTINGS }
  const { id: _id, ...settings } = record
  void _id
  return { ...DEFAULT_SETTINGS, ...settings }
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const db = await getDB()
  const tx = db.transaction('settings', 'readwrite')
  const current = await tx.store.get(SETTINGS_ID)
  const next: AppSettings = { ...DEFAULT_SETTINGS, ...current, ...patch }
  await tx.store.put({ ...next, id: SETTINGS_ID })
  await tx.done
  return next
}
