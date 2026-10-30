
import type { Task } from '../shared/types.ts'

const STORAGE_KEY = 'folio:favorites:v1'

function getFavorites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (parsed.version !== 1 || !Array.isArray(parsed.ids)) return []
    return Array.from(new Set(parsed.ids)).sort()
  } catch {
    return []
  }
}

function setFavorites(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ids }))
    return true
  } catch {
    return false
  }
}

export { getFavorites, setFavorites }
