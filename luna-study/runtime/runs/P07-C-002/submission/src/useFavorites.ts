import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'folio:favorites:v1'

type FavoriteState = { ids: string[]; storageError: boolean }

function uniqueSorted(ids: Iterable<string>) {
  return [...new Set(ids)].sort()
}

export function decodeFavorites(raw: string | null) {
  if (raw === null) return []
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return []
    const record = value as { version?: unknown; ids?: unknown }
    if (record.version !== 1 || !Array.isArray(record.ids) || !record.ids.every((id) => typeof id === 'string')) return []
    return uniqueSorted(record.ids)
  } catch {
    return []
  }
}

function readFavorites(): FavoriteState {
  try {
    return { ids: decodeFavorites(window.localStorage.getItem(STORAGE_KEY)), storageError: false }
  } catch {
    return { ids: [], storageError: true }
  }
}

export function useFavorites() {
  const [state, setState] = useState(readFavorites)
  const idsRef = useRef(state.ids)

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      const ids = decodeFavorites(event.newValue)
      idsRef.current = ids
      setState((current) => ({ ...current, ids }))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const commit = useCallback((ids: string[]) => {
    const next = uniqueSorted(ids)
    idsRef.current = next
    setState((current) => ({ ...current, ids: next }))
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ids: next }))
    } catch {
      setState((current) => ({ ...current, storageError: true }))
    }
  }, [])

  const toggle = useCallback((id: string) => {
    const next = new Set(idsRef.current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    commit([...next])
  }, [commit])

  const remove = useCallback((idsToRemove: Iterable<string>) => {
    const excluded = new Set(idsToRemove)
    commit(idsRef.current.filter((id) => !excluded.has(id)))
  }, [commit])

  return { favoriteIds: state.ids, storageError: state.storageError, toggleFavorite: toggle, removeFavorites: remove }
}
