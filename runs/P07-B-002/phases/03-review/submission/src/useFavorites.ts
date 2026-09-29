import { useEffect, useRef, useState } from 'react'

const storageKey = 'folio:favorites:v1'

function decodeFavorites(raw: string | null): Set<string> {
  try {
    const value: unknown = raw === null ? null : JSON.parse(raw)
    if (typeof value !== 'object' || value === null || !('version' in value) || value.version !== 1 || !('ids' in value) || !Array.isArray(value.ids) || !value.ids.every((id: unknown) => typeof id === 'string')) return new Set()
    return new Set(value.ids as string[])
  } catch {
    return new Set()
  }
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
  const current = useRef(state.ids)

  useEffect(() => {
    function synchronize(event: StorageEvent) {
      if (event.key !== storageKey) return
      const ids = decodeFavorites(event.newValue)
      current.current = ids
      setState((previous) => ({ ...previous, ids }))
    }
    window.addEventListener('storage', synchronize)
    return () => window.removeEventListener('storage', synchronize)
  }, [])

  function commit(ids: Set<string>) {
    current.current = ids
    let unavailable = false
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ids: [...ids].sort() }))
    } catch {
      unavailable = true
    }
    setState((previous) => ({ ids, unavailable: previous.unavailable || unavailable }))
  }

  function toggle(id: string) {
    const ids = new Set(current.current)
    if (ids.has(id)) ids.delete(id)
    else ids.add(id)
    commit(ids)
  }

  function remove(idsToRemove: string[]) {
    const ids = new Set(current.current)
    for (const id of idsToRemove) ids.delete(id)
    commit(ids)
  }

  return { ids: state.ids, unavailable: state.unavailable, toggle, remove }
}
