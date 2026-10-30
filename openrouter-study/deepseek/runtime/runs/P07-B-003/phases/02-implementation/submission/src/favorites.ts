import { useCallback, useEffect, useRef, useState } from 'react'

export const FAVORITES_KEY = 'folio:favorites:v1'

export function parseFavoritesValue(raw: string | null): Set<string> {
  if (raw === null) return new Set()
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return new Set()
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return new Set()
  const record = parsed as { version?: unknown; ids?: unknown }
  if (record.version !== 1) return new Set()
  if (!Array.isArray(record.ids)) return new Set()
  if (record.ids.some((id) => typeof id !== 'string')) return new Set()
  return new Set(record.ids as string[])
}

export function serializeFavorites(ids: Set<string>): string {
  return JSON.stringify({ version: 1, ids: [...ids].sort() })
}

export type FavoritesStore = {
  ids: Set<string>
  storageError: boolean
  toggle: (id: string) => void
  remove: (ids: Iterable<string>) => void
}

function readStoredFavorites(): { ids: Set<string>; storageError: boolean } {
  try {
    return { ids: parseFavoritesValue(window.localStorage.getItem(FAVORITES_KEY)), storageError: false }
  } catch {
    return { ids: new Set(), storageError: true }
  }
}

export function useFavorites(): FavoritesStore {
  const [state, setState] = useState(readStoredFavorites)
  const pendingWrite = useRef(false)

  useEffect(() => {
    if (!pendingWrite.current) return
    pendingWrite.current = false
    try {
      window.localStorage.setItem(FAVORITES_KEY, serializeFavorites(state.ids))
    } catch {
      setState((current) => ({ ...current, storageError: true }))
    }
  }, [state.ids])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_KEY) return
      pendingWrite.current = false
      setState((current) => ({ ids: parseFavoritesValue(event.newValue), storageError: current.storageError }))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const change = useCallback((mutate: (ids: Set<string>) => void) => {
    pendingWrite.current = true
    setState((current) => {
      const ids = new Set(current.ids)
      mutate(ids)
      return { ...current, ids }
    })
  }, [])

  const toggle = useCallback((id: string) => {
    change((ids) => {
      if (ids.has(id)) ids.delete(id)
      else ids.add(id)
    })
  }, [change])

  const remove = useCallback((values: Iterable<string>) => {
    change((ids) => {
      for (const id of values) ids.delete(id)
    })
  }, [change])

  return { ids: state.ids, storageError: state.storageError, toggle, remove }
}
