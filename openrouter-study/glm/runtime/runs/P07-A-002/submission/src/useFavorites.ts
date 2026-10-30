import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'folio:favorites:v1'

type FavoritesState = {
  ids: string[]
  storageError: boolean
}

function uniqueSorted(ids: string[]) {
  return [...new Set(ids)].sort()
}

export function parseFavorites(value: string | null): string[] {
  if (value === null) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    return []
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return []
  const keys = Object.keys(parsed)
  if (keys.length !== 2 || !keys.includes('version') || !keys.includes('ids')) return []
  const record = parsed as { version?: unknown; ids?: unknown }
  if (record.version !== 1 || !Array.isArray(record.ids)) return []
  if (record.ids.some((id) => typeof id !== 'string')) return []
  return uniqueSorted(record.ids)
}

function readFavorites(): FavoritesState {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(STORAGE_KEY)), storageError: false }
  } catch {
    return { ids: [], storageError: true }
  }
}

function persistFavorites(ids: string[]): FavoritesState {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ids }))
    return { ids, storageError: false }
  } catch {
    return { ids, storageError: true }
  }
}

export function useFavorites() {
  const [state, setState] = useState<FavoritesState>(readFavorites)

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      setState({ ids: parseFavorites(event.newValue), storageError: false })
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((ids: string[]) => {
    setState(persistFavorites(ids))
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    update(state.ids.includes(id) ? state.ids.filter((entry) => entry !== id) : uniqueSorted([...state.ids, id]))
  }, [state.ids, update])

  const removeFavorites = useCallback((idsToRemove: string[]) => {
    const remove = new Set(idsToRemove)
    update(state.ids.filter((id) => !remove.has(id)))
  }, [state.ids, update])

  return { ...state, toggleFavorite, removeFavorites }
}
