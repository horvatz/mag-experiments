import { useEffect, useRef, useState } from 'react'

const storageKey = 'folio:favorites:v1'

function decodeFavorites(raw: string | null): Set<string> {
  if (raw === null) return new Set()
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)
      && 'version' in value && value.version === 1
      && 'ids' in value && Array.isArray(value.ids)
      && value.ids.every((id: unknown) => typeof id === 'string')) {
      return new Set(value.ids as string[])
    }
  } catch { /* Invalid content is an empty selection, not a storage failure. */ }
  return new Set()
}

function readFavorites() {
  try {
    return { ids: decodeFavorites(window.localStorage.getItem(storageKey)), unavailable: false }
  } catch {
    return { ids: new Set<string>(), unavailable: true }
  }
}

export function useFavorites() {
  const [state, setState] = useState(readFavorites)
  const currentIds = useRef(state.ids)

  useEffect(() => {
    function synchronize(event: StorageEvent) {
      if (event.key !== storageKey) return
      const ids = decodeFavorites(event.newValue)
      currentIds.current = ids
      setState((previous) => ({ ...previous, ids }))
    }
    window.addEventListener('storage', synchronize)
    return () => window.removeEventListener('storage', synchronize)
  }, [])

  function save(ids: Set<string>) {
    currentIds.current = ids
    setState((previous) => ({ ...previous, ids }))
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ids: [...ids].sort() }))
    } catch {
      setState((previous) => ({ ...previous, unavailable: true }))
    }
  }

  function toggleFavorite(id: string) {
    const ids = new Set(currentIds.current)
    if (ids.has(id)) ids.delete(id)
    else ids.add(id)
    save(ids)
  }

  function clearFavorites(projectIds: string[]) {
    const ids = new Set(currentIds.current)
    for (const id of projectIds) ids.delete(id)
    save(ids)
  }

  return { favoriteIds: state.ids, storageUnavailable: state.unavailable, toggleFavorite, clearFavorites }
}
