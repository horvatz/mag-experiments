import { useCallback, useEffect, useState } from 'react'
import { favoritesKey, parseFavorites, readFavorites, writeFavorites } from './favorites.ts'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())
  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    try {
      setFavorites(readFavorites())
      setStorageError(false)
    } catch {
      setFavorites(new Set())
      setStorageError(true)
    }
  }, [])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== favoritesKey) return
      setFavorites(parseFavorites(event.newValue))
      setStorageError(false)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    const next = new Set(favorites)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setFavorites(next)
    try {
      writeFavorites(next)
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [favorites])

  const clearProjectFavorites = useCallback((ids: string[]) => {
    const next = new Set(favorites)
    for (const id of ids) next.delete(id)
    setFavorites(next)
    try {
      writeFavorites(next)
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [favorites])

  return { favorites, storageError, toggleFavorite, clearProjectFavorites }
}
