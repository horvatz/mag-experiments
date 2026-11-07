import { useCallback, useEffect, useRef, useState } from 'react'

export const FAVORITES_KEY = 'folio:favorites:v1'

export function parseFavorites(raw: string | null): Set<string> {
  if (raw === null) return new Set()
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return new Set()
  }
  if (typeof value !== 'object' || value === null) return new Set()
  const record = value as { version?: unknown; ids?: unknown }
  if (record.version !== 1 || !Array.isArray(record.ids)) return new Set()
  if (!record.ids.every((id) => typeof id === 'string')) return new Set()
  return new Set(record.ids as string[])
}

export function serializeFavorites(ids: ReadonlySet<string>): string {
  // Default string sort compares UTF-16 code units; ids are stored once each.
  return JSON.stringify({ version: 1, ids: [...ids].sort() })
}

function readFavorites(): { ids: Set<string>; error: boolean } {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(FAVORITES_KEY)), error: false }
  } catch {
    return { ids: new Set(), error: true }
  }
}

function writeFavorites(ids: ReadonlySet<string>): boolean {
  try {
    window.localStorage.setItem(FAVORITES_KEY, serializeFavorites(ids))
    return true
  } catch {
    return false
  }
}

export interface Favorites {
  ids: Set<string>
  storageError: boolean
  toggle: (id: string) => void
  removeProjectFavorites: (taskIds: string[]) => void
}

export function useFavorites(): Favorites {
  const [state, setState] = useState(readFavorites)
  const idsRef = useRef(state.ids)

  useEffect(() => {
    idsRef.current = state.ids
  }, [state.ids])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_KEY) return
      const ids = parseFavorites(event.newValue)
      idsRef.current = ids
      setState((previous) => ({ ids, error: previous.error }))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const apply = useCallback((next: Set<string>) => {
    idsRef.current = next
    setState((previous) => ({ ids: next, error: previous.error }))
    if (!writeFavorites(next)) setState((previous) => ({ ...previous, error: true }))
  }, [])

  const toggle = useCallback((id: string) => {
    const next = new Set(idsRef.current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    apply(next)
  }, [apply])

  const removeProjectFavorites = useCallback((taskIds: string[]) => {
    const next = new Set(idsRef.current)
    for (const id of taskIds) next.delete(id)
    apply(next)
  }, [apply])

  return { ids: state.ids, storageError: state.error, toggle, removeProjectFavorites }
}
