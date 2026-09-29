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
  const current = useRef(state)

  useEffect(() => {
    const synchronize = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      const next = { ...current.current, ids: decodeFavorites(event.newValue) }
      current.current = next
      setState(next)
    }
    window.addEventListener('storage', synchronize)
    return () => window.removeEventListener('storage', synchronize)
  }, [])

  // Only explicit user actions persist; reading and storage events never write back.
  function commit(ids: Set<string>) {
    const next = { ...current.current, ids }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ids: [...ids].sort() }))
    } catch {
      next.unavailable = true
    }
    current.current = next
    setState(next)
  }

  function toggle(id: string) {
    const ids = new Set(current.current.ids)
    if (ids.has(id)) ids.delete(id)
    else ids.add(id)
    commit(ids)
  }

  function remove(idsToRemove: string[]) {
    const ids = new Set(current.current.ids)
    for (const id of idsToRemove) ids.delete(id)
    commit(ids)
  }

  return { ids: state.ids, unavailable: state.unavailable, toggle, remove }
}
