import { useCallback, useEffect, useState } from "react"

const FAVORITES_STORAGE_KEY = "folio:favorites:v1"

function parseFavorites(value: string | null): string[] {
  if (value === null) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    return []
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return []
  const record = parsed as { version?: unknown; ids?: unknown }
  if (record.version !== 1 || !Array.isArray(record.ids)) return []
  return [...new Set(record.ids.filter((id): id is string => typeof id === "string"))].sort()
}

function serializeFavorites(ids: readonly string[]): string {
  return JSON.stringify({ version: 1, ids: [...ids].sort() })
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    try {
      setFavorites(parseFavorites(window.localStorage.getItem(FAVORITES_STORAGE_KEY)))
      setStorageError(false)
    } catch {
      setFavorites([])
      setStorageError(true)
    }
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_STORAGE_KEY) return
      setFavorites(parseFavorites(event.newValue))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const commit = useCallback((ids: readonly string[]) => {
    setFavorites([...ids])
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites(ids))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [])

  const toggleFavorite = useCallback((taskId: string) => {
    const next = new Set(favorites)
    if (next.has(taskId)) next.delete(taskId)
    else next.add(taskId)
    commit([...next])
  }, [commit, favorites])

  const removeFavorites = useCallback((taskIds: readonly string[]) => {
    const removed = new Set(taskIds)
    commit(favorites.filter((taskId) => !removed.has(taskId)))
  }, [commit, favorites])

  return { favoriteIds: new Set(favorites), removeFavorites, storageError, toggleFavorite }
}
