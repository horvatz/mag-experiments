import { useEffect, useState } from 'react'

export const FAVORITES_STORAGE_KEY = 'folio:favorites:v1'

function parseFavorites(value: string | null): Set<string> {
  if (value === null) return new Set()

  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || !('ids' in parsed)) return new Set()
    const record = parsed as { version?: unknown; ids?: unknown }
    if (record.version !== 1 || !Array.isArray(record.ids) || !record.ids.every((id) => typeof id === 'string')) return new Set()
    return new Set(record.ids)
  } catch {
    return new Set()
  }
}

function serializeFavorites(ids: ReadonlySet<string>): string {
  return JSON.stringify({ version: 1, ids: [...ids].sort() })
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set())
  const [storageUnavailable, setStorageUnavailable] = useState(false)

  useEffect(() => {
    try {
      setFavoriteIds(parseFavorites(window.localStorage.getItem(FAVORITES_STORAGE_KEY)))
    } catch {
      setStorageUnavailable(true)
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === FAVORITES_STORAGE_KEY) setFavoriteIds(parseFavorites(event.newValue))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const save = (next: Set<string>) => {
    setFavoriteIds(next)
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites(next))
      setStorageUnavailable(false)
    } catch {
      setStorageUnavailable(true)
    }
  }

  const toggleFavorite = (id: string) => {
    const next = new Set(favoriteIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    save(next)
  }

  const removeProjectFavorites = (taskIds: ReadonlySet<string>) => {
    const next = new Set(favoriteIds)
    for (const id of taskIds) next.delete(id)
    save(next)
  }

  return { favoriteIds, storageUnavailable, toggleFavorite, removeProjectFavorites }
}
