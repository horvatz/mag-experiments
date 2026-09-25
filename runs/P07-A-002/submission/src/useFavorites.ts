import { useEffect, useRef, useState } from 'react'

const storageKey = 'folio:favorites:v1'

function parseFavorites(value: string | null): Set<string> {
  try {
    const record: unknown = value === null ? null : JSON.parse(value)
    if (typeof record === 'object' && record !== null &&
      'version' in record && record.version === 1 &&
      'ids' in record && Array.isArray(record.ids) &&
      record.ids.every((id: unknown) => typeof id === 'string')) {
      return new Set(record.ids)
    }
  } catch { /* Invalid JSON is an empty selection, not a storage failure. */ }
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
  // Keep consecutive actions and storage events current without putting writes
  // inside a React state updater (which StrictMode may call more than once).
  const current = useRef(state)

  useEffect(() => {
    const synchronize = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      current.current = { ...current.current, ids: parseFavorites(event.newValue) }
      setState(current.current)
    }
    window.addEventListener('storage', synchronize)
    return () => window.removeEventListener('storage', synchronize)
  }, [])

  function save(ids: Set<string>) {
    let unavailable = current.current.unavailable
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ids: [...ids].sort() }))
    } catch {
      unavailable = true
    }
    current.current = { ids, unavailable }
    setState(current.current)
  }

  function toggle(id: string) {
    const ids = new Set(current.current.ids)
    if (ids.has(id)) ids.delete(id)
    else ids.add(id)
    save(ids)
  }

  function remove(idsToRemove: string[]) {
    const ids = new Set(current.current.ids)
    for (const id of idsToRemove) ids.delete(id)
    save(ids)
  }

  return { ids: state.ids, unavailable: state.unavailable, toggle, remove }
}
