import { useCallback, useEffect, useState } from 'react'

const favoritesKey = 'folio:favorites:v1'

function normalizeIds(ids: string[]) {
  return [...new Set(ids.filter((id): id is string => typeof id === 'string'))].sort((first, second) => {
    if (first < second) return -1
    if (first > second) return 1
    return 0
  })
}

function parseFavorites(value: string | null) {
  if (value === null) return []
  const parsed = JSON.parse(value) as { version?: unknown; ids?: unknown }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed) || parsed.version !== 1 || !Array.isArray(parsed.ids)) return []
  if (parsed.ids.some((id) => typeof id !== 'string')) return []
  return normalizeIds(parsed.ids)
}

function readFavorites() {
  let value: string | null
  try {
    value = window.localStorage.getItem(favoritesKey)
  } catch {
    return { ids: [], available: false }
  }
  try {
    return { ids: parseFavorites(value), available: true }
  } catch {
    return { ids: [], available: true }
  }
}

export function useFavorites() {
  const [initial] = useState(readFavorites)
  const [favorites, setFavorites] = useState(initial.ids)
  const [storageAvailable, setStorageAvailable] = useState(initial.available)

  const persist = useCallback((ids: string[]) => {
    const next = normalizeIds(ids)
    try {
      window.localStorage.setItem(favoritesKey, JSON.stringify({ version: 1, ids: next }))
      setStorageAvailable(true)
    } catch {
      setStorageAvailable(false)
    }
    return next
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    const next = persist(favorites.includes(id) ? favorites.filter((entry) => entry !== id) : [...favorites, id])
    setFavorites(next)
  }, [favorites, persist])

  const removeProjectFavorites = useCallback((projectTaskIds: string[]) => {
    const removed = new Set(projectTaskIds)
    const next = persist(favorites.filter((id) => !removed.has(id)))
    setFavorites(next)
  }, [favorites, persist])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== favoritesKey) return
      const next = readFavorites()
      setFavorites(next.ids)
      setStorageAvailable(next.available)
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return { favorites, storageAvailable, toggleFavorite, removeProjectFavorites }
}
