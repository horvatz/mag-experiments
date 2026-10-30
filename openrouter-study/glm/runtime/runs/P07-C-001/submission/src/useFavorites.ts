import { useCallback, useEffect, useState } from 'react'

const FAVORITES_KEY = 'folio:favorites:v1'

function parseFavorites(value: string | null): Set<string> {
  if (value === null) return new Set()
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return new Set()
    const record = parsed as { version?: unknown; ids?: unknown }
    if (record.version !== 1 || !Array.isArray(record.ids)) return new Set()
    if (record.ids.some((id) => typeof id !== 'string')) return new Set()
    return new Set(record.ids)
  } catch {
    return new Set()
  }
}

function serializeFavorites(favorites: Set<string>): string {
  return JSON.stringify({ version: 1, ids: [...favorites].sort() })
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set())
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setFavoriteIds(parseFavorites(window.localStorage.getItem(FAVORITES_KEY)))
    } catch {
      setStorageError('shramba priljubljenih opravil ni dostopna.')
    }
  }, [])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_KEY) return
      setFavoriteIds(parseFavorites(event.newValue))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const persist = useCallback((nextFavorites: Set<string>) => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, serializeFavorites(nextFavorites))
      setStorageError(null)
    } catch {
      setStorageError('shramba priljubljenih opravil ni dostopna.')
    }
  }, [])

  const toggleFavorite = useCallback((taskId: string) => {
    const nextFavorites = new Set(favoriteIds)
    if (nextFavorites.has(taskId)) {
      nextFavorites.delete(taskId)
    } else {
      nextFavorites.add(taskId)
    }
    setFavoriteIds(nextFavorites)
    persist(nextFavorites)
  }, [favoriteIds, persist])

  const removeProjectFavorites = useCallback((taskIds: string[]) => {
    if (taskIds.length === 0) return
    const nextFavorites = new Set(favoriteIds)
    for (const taskId of taskIds) {
      nextFavorites.delete(taskId)
    }
    setFavoriteIds(nextFavorites)
    persist(nextFavorites)
  }, [favoriteIds, persist])

  return { favoriteIds, storageError, toggleFavorite, removeProjectFavorites }
}
