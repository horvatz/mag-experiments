import { useEffect, useState } from 'react'

const storageKey = 'folio:favorites:v1'

function parseFavorites(raw: string | null): Set<string> {
  try {
    const value: unknown = raw === null ? null : JSON.parse(raw)
    if (typeof value !== 'object' || value === null || !('version' in value) || value.version !== 1 || !('ids' in value) || !Array.isArray(value.ids) || !value.ids.every((id: unknown) => typeof id === 'string')) return new Set()
    return new Set(value.ids as string[])
  } catch {
    return new Set()
  }
}

export function useFavorites() {
  const [state, setState] = useState(() => {
    try {
      return { ids: parseFavorites(window.localStorage.getItem(storageKey)), storageUnavailable: false }
    } catch {
      return { ids: new Set<string>(), storageUnavailable: true }
    }
  })

  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      const ids = parseFavorites(event.newValue)
      setState((previous) => ({ ...previous, ids }))
    }
    window.addEventListener('storage', receive)
    return () => window.removeEventListener('storage', receive)
  }, [])

  function save(ids: Set<string>) {
    let storageUnavailable = state.storageUnavailable
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ids: [...ids].sort() }))
    } catch {
      storageUnavailable = true
    }
    setState({ ids, storageUnavailable })
  }

  function toggle(id: string) {
    const ids = new Set(state.ids)
    if (ids.has(id)) ids.delete(id)
    else ids.add(id)
    save(ids)
  }

  function remove(projectIds: string[]) {
    const ids = new Set(state.ids)
    for (const id of projectIds) ids.delete(id)
    save(ids)
  }

  return { favorites: state.ids, storageUnavailable: state.storageUnavailable, toggle, remove }
}
