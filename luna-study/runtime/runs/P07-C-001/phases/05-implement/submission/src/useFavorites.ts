import { useCallback, useEffect, useRef, useState } from 'react'

const storageKey = 'folio:favorites:v1'

type FavoriteState = { ids: string[]; storageUnavailable: boolean }

function uniqueSorted(ids: Iterable<string>) {
  return [...new Set(ids)].sort()
}

function parseFavorites(value: string | null) {
  if (value === null) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null || !('version' in parsed) || parsed.version !== 1 || !('ids' in parsed) || !Array.isArray(parsed.ids) || parsed.ids.some((id) => typeof id !== 'string')) return []
    return uniqueSorted(parsed.ids)
  } catch {
    return []
  }
}

function readInitialState(): FavoriteState {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(storageKey)), storageUnavailable: false }
  } catch {
    return { ids: [], storageUnavailable: true }
  }
}

function serialize(ids: string[]) {
  return JSON.stringify({ version: 1, ids: uniqueSorted(ids) })
}

export function useFavorites() {
  const [state, setState] = useState(readInitialState)
  const stateRef = useRef(state)

  const publish = useCallback((next: FavoriteState) => {
    stateRef.current = next
    setState(next)
  }, [])

  const save = useCallback((ids: string[]) => {
    const canonicalIds = uniqueSorted(ids)
    let unavailable = stateRef.current.storageUnavailable
    try {
      window.localStorage.setItem(storageKey, serialize(canonicalIds))
    } catch {
      unavailable = true
    }
    publish({ ids: canonicalIds, storageUnavailable: unavailable })
  }, [publish])

  const toggleFavorite = useCallback((id: string) => {
    const next = new Set(stateRef.current.ids)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    save([...next])
  }, [save])

  const removeFavorites = useCallback((idsToRemove: Iterable<string>) => {
    const removed = new Set(idsToRemove)
    save(stateRef.current.ids.filter((id) => !removed.has(id)))
  }, [save])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      publish({
        ids: parseFavorites(event.newValue),
        storageUnavailable: stateRef.current.storageUnavailable,
      })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [publish])

  return {
    favoriteIds: state.ids,
    favorites: new Set(state.ids),
    storageUnavailable: state.storageUnavailable,
    toggleFavorite,
    removeFavorites,
  }
}
