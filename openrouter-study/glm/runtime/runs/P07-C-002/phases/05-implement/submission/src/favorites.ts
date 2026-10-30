import { useCallback, useEffect, useState } from 'react'

export const FAVORITES_STORAGE_KEY = 'folio:favorites:v1'
const STORAGE_ERROR = 'Shramba za priljubljena opravila trenutno ni dosegljiva.'

interface FavoritesPayload {
  version: unknown
  ids: unknown
}

interface FavoritesState {
  favoriteIds: string[]
  storageError: string | null
}

function isFavoritesPayload(value: unknown): value is FavoritesPayload {
  return typeof value === 'object' && value !== null && 'version' in value && 'ids' in value
}

export function parseFavoriteIds(raw: string | null): string[] {
  if (raw === null) return []
  const value: unknown = JSON.parse(raw)
  if (!isFavoritesPayload(value) || value.version !== 1 || !Array.isArray(value.ids)) return []
  if (value.ids.some((id) => typeof id !== 'string')) return []
  return [...new Set(value.ids)].sort()
}

export function serializeFavoriteIds(ids: readonly string[]): string {
  return JSON.stringify({ version: 1, ids: [...new Set(ids)].sort() })
}

function readFavorites(): FavoritesState {
  try {
    return {
      favoriteIds: parseFavoriteIds(window.localStorage.getItem(FAVORITES_STORAGE_KEY)),
      storageError: null,
    }
  } catch {
    return { favoriteIds: [], storageError: STORAGE_ERROR }
  }
}

export function useFavorites() {
  const [state, setState] = useState<FavoritesState>(readFavorites)

  const persist = useCallback((favoriteIds: string[]) => {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavoriteIds(favoriteIds))
      setState({ favoriteIds, storageError: null })
    } catch {
      setState({ favoriteIds, storageError: STORAGE_ERROR })
    }
  }, [])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_STORAGE_KEY) return
      try {
        setState({ favoriteIds: parseFavoriteIds(event.newValue), storageError: null })
      } catch {
        setState({ favoriteIds: [], storageError: STORAGE_ERROR })
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    const favoriteIds = state.favoriteIds.includes(id)
      ? state.favoriteIds.filter((favoriteId) => favoriteId !== id)
      : [...state.favoriteIds, id]
    persist(favoriteIds)
  }, [persist, state.favoriteIds])

  const removeFavorites = useCallback((ids: readonly string[]) => {
    const removed = new Set(ids)
    persist(state.favoriteIds.filter((favoriteId) => !removed.has(favoriteId)))
  }, [persist, state.favoriteIds])

  return {
    favoriteIds: state.favoriteIds,
    storageError: state.storageError,
    toggleFavorite,
    removeFavorites,
  }
}
