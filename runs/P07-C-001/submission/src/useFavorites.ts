import { useEffect, useRef, useState } from 'react'

const storageKey = 'folio:favorites:v1'

type FavoritesState = { ids: Set<string>; storageUnavailable: boolean }

function decodeFavorites(raw: string | null): Set<string> {
  try {
    const value: unknown = raw === null ? null : JSON.parse(raw)
    if (typeof value !== 'object' || value === null || !('version' in value) || value.version !== 1 ||
      !('ids' in value) || !Array.isArray(value.ids) || !value.ids.every((id: unknown) => typeof id === 'string')) {
      return new Set()
    }
    return new Set(value.ids as string[])
  } catch {
    return new Set()
  }
}

function readFavorites(): FavoritesState {
  try {
    return { ids: decodeFavorites(window.localStorage.getItem(storageKey)), storageUnavailable: false }
  } catch {
    return { ids: new Set(), storageUnavailable: true }
  }
}

export function useFavorites() {
  const [state, setState] = useState(readFavorites)
  // Event handlers share the latest published value, including back-to-back events.
  const latest = useRef(state)

  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      const next = { ...latest.current, ids: decodeFavorites(event.newValue) }
      latest.current = next
      setState(next)
    }
    window.addEventListener('storage', receive)
    return () => window.removeEventListener('storage', receive)
  }, [])

  function update(ids: Set<string>) {
    let storageUnavailable = latest.current.storageUnavailable
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ids: [...ids].sort() }))
    } catch {
      storageUnavailable = true
    }
    const next = { ids, storageUnavailable }
    latest.current = next
    setState(next)
  }

  function toggle(id: string) {
    const ids = new Set(latest.current.ids)
    if (ids.has(id)) ids.delete(id)
    else ids.add(id)
    update(ids)
  }

  function remove(projectIds: string[]) {
    const ids = new Set(latest.current.ids)
    for (const id of projectIds) ids.delete(id)
    update(ids)
  }

  return { ids: state.ids, storageUnavailable: state.storageUnavailable, toggle, remove }
}
