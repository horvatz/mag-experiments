import { useEffect, useState } from 'react'

const storageKey = 'folio:favorites:v1'

type FavoriteState = { ids: Set<string>; storageUnavailable: boolean }

function parseIds(value: string | null): Set<string> {
  if (value === null) return new Set()
  try {
    const stored: unknown = JSON.parse(value)
    if (typeof stored !== 'object' || stored === null || !('version' in stored) || stored.version !== 1 || !('ids' in stored) || !Array.isArray(stored.ids) || !stored.ids.every((id) => typeof id === 'string')) return new Set()
    return new Set(stored.ids)
  } catch {
    return new Set()
  }
}

function readState(): FavoriteState {
  try {
    return { ids: parseIds(window.localStorage.getItem(storageKey)), storageUnavailable: false }
  } catch {
    return { ids: new Set(), storageUnavailable: true }
  }
}

function writeState(ids: Set<string>): FavoriteState {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ids: [...ids].sort() }))
    return { ids, storageUnavailable: false }
  } catch {
    return { ids, storageUnavailable: true }
  }
}

export function useFavorites() {
  const [state, setState] = useState(readState)

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      setState((current) => ({ ...current, ids: parseIds(event.newValue) }))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggle = (id: string) => {
    const ids = new Set(state.ids)
    if (ids.has(id)) ids.delete(id)
    else ids.add(id)
    setState(writeState(ids))
  }

  const remove = (projectIds: string[]) => {
    const ids = new Set(state.ids)
    for (const id of projectIds) ids.delete(id)
    setState(writeState(ids))
  }

  return { ids: state.ids, storageUnavailable: state.storageUnavailable, toggle, remove }
}
