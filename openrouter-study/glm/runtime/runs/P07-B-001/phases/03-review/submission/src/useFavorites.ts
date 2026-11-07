import { useCallback, useEffect, useState } from 'react'

const FAVORITES_KEY = 'folio:favorites:v1'
const STORAGE_ERROR = 'Shramba je nedostopna. Priljubljena so ohranjena samo v tem zavihku.'

function normalizeIds(ids: unknown) {
  if (!Array.isArray(ids)) return []
  return Array.from(new Set(ids.filter((id): id is string => typeof id === 'string'))).sort()
}

function parseFavorites(value: string | null) {
  if (value === null) return []
  const parsed: unknown = JSON.parse(value)
  if (typeof parsed !== 'object' || parsed === null) return []
  const candidate = parsed as { version?: unknown; ids?: unknown }
  return candidate.version === 1 ? normalizeIds(candidate.ids) : []
}

function readFavorites() {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(FAVORITES_KEY)), error: null as string | null }
  } catch {
    return { ids: [] as string[], error: STORAGE_ERROR }
  }
}

export function useFavorites() {
  const [initial] = useState(readFavorites)
  const [favorites, setFavorites] = useState(initial.ids)
  const [storageError, setStorageError] = useState(initial.error)

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_KEY) return
      try {
      setFavorites(parseFavorites(event.newValue))
      setStorageError(null)
    } catch {
      setFavorites([])
      setStorageError(STORAGE_ERROR)
    }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const writeFavorites = useCallback((next: string[]) => {
    const normalized = Array.from(new Set(next)).sort()
    setFavorites(normalized)
    setStorageError(null)
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify({ version: 1, ids: normalized }))
    } catch {
      setStorageError(STORAGE_ERROR)
    }
  }, [])

  const toggleFavorite = useCallback((taskId: string) => {
    writeFavorites(favorites.includes(taskId) ? favorites.filter(id => id !== taskId) : [...favorites, taskId])
  }, [favorites, writeFavorites])

  const removeFavorites = useCallback((taskIds: string[]) => {
    const removed = new Set(taskIds)
    writeFavorites(favorites.filter(id => !removed.has(id)))
  }, [favorites, writeFavorites])

  return { favorites, storageError, toggleFavorite, removeFavorites }
}
