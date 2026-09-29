import { useEffect, useRef, useState } from 'react'

const storageKey = 'folio:favorites:v1'

function parseFavorites(raw: string | null): Set<string> {
  try {
    const value: unknown = raw === null ? null : JSON.parse(raw)
    if (typeof value === 'object' && value !== null &&
      'version' in value && value.version === 1 &&
      'ids' in value && Array.isArray(value.ids) &&
      value.ids.every((id: unknown) => typeof id === 'string')) {
      return new Set(value.ids)
    }
  } catch {
    // Invalid data is empty in memory; reading never repairs storage.
  }
  return new Set()
}

function readFavorites() {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(storageKey)), unavailable: false }
  } catch {
    return { ids: new Set<string>(), unavailable: true }
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

  function save(ids: Set<string>) {
    currentIds.current = ids
    let unavailable = false
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ids: [...ids].sort() }))
    } catch {
      unavailable = true
    }
    // A successful write does not prove that a previously denied read works.
    setState((previous) => ({ ids, unavailable: previous.unavailable || unavailable }))
  }

  function toggle(id: string) {
    const ids = new Set(currentIds.current)
    if (ids.has(id)) ids.delete(id)
    else ids.add(id)
    save(ids)
  }

  function removeProject(projectIds: string[]) {
    const ids = new Set(currentIds.current)
    for (const id of projectIds) ids.delete(id)
    save(ids)
  }

  return { ids: state.ids, unavailable: state.unavailable, toggle, removeProject }
}
