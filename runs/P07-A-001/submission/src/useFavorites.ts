import { useEffect, useRef, useState } from 'react'

const storageKey = 'folio:favorites:v1'

function parseFavorites(value: string | null): Set<string> {
  try {
    const record: unknown = value === null ? null : JSON.parse(value)
    if (typeof record !== 'object' || record === null || !('version' in record) || record.version !== 1 || !('ids' in record) || !Array.isArray(record.ids) || !record.ids.every((id): id is string => typeof id === 'string')) {
      return new Set()
    }
    return new Set(record.ids)
  } catch {
    return new Set()
  }
}

function readFavorites() {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(storageKey)), storageUnavailable: false }
  } catch {
    return { ids: new Set<string>(), storageUnavailable: true }
  }
}

export function useFavorites() {
  const [state, setState] = useState(readFavorites)
  const currentIds = useRef(state.ids)

  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      const ids = parseFavorites(event.newValue)
      currentIds.current = ids
      setState((previous) => ({ ...previous, ids }))
    }
    window.addEventListener('storage', receive)
    return () => window.removeEventListener('storage', receive)
  }, [])

  // Persist only explicit user changes, never initialization or storage events.
  // The ref also keeps consecutive actions in sync before React renders again.
  const commit = (ids: Set<string>) => {
    currentIds.current = ids
    let storageUnavailable = false
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ids: [...ids].sort() }))
    } catch {
      storageUnavailable = true
    }
    setState((previous) => ({ ids, storageUnavailable: previous.storageUnavailable || storageUnavailable }))
  }

  const toggle = (id: string) => {
    const ids = new Set(currentIds.current)
    if (ids.has(id)) ids.delete(id)
    else ids.add(id)
    commit(ids)
  }

  const remove = (projectIds: string[]) => {
    const ids = new Set(currentIds.current)
    for (const id of projectIds) ids.delete(id)
    commit(ids)
  }

  return { ids: state.ids as ReadonlySet<string>, storageUnavailable: state.storageUnavailable, toggle, remove }
}
