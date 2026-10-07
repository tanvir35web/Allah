import { ALL_STORES, clearStores } from './db'
import { getAllFavorites } from './favorites'
import { getAllProgress } from './progress'
import { getQuizResults } from './quiz'
import { getAllReviewItems } from './review'
import { getSettings } from './settings'
import { getAllActivity } from './streak'

export * from './db'
export * from './favorites'
export * from './progress'
export * from './quiz'
export { getAllReviewItems } from './review'
export * from './settings'
export * from './streak'

/** Loads everything the UI needs in one go (the dataset is small). */
export async function loadAllData() {
  const [progress, favorites, quizResults, activities, reviewItems, settings] = await Promise.all([
    getAllProgress(),
    getAllFavorites(),
    getQuizResults(),
    getAllActivity(),
    getAllReviewItems(),
    getSettings(),
  ])
  return { progress, favorites, quizResults, activities, reviewItems, settings }
}

/** Deletes every record in every store (settings included). */
export async function clearAllData(): Promise<void> {
  await clearStores(ALL_STORES)
}
