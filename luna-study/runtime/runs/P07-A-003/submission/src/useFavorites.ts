import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'folio:favorites:v1'

function parseFavorites(value: string | null): Set<string> {
  if (value === null) return new Set()
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return new Set()
    const record = parsed as { version?: unknown; ids?: unknown }
    if (record.version !== 1 || !Array.isArray(record.ids) || !record.ids.every((id) => typeof id === 'string')) return new Set()
    return new Set(record.ids)
  } catch {
    return new Set()
  }
}

function readFavorites() {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(STORAGE_KEY)), error: false }
  } catch {
    return { ids: new Set<string>(), error: true }
  }
}

export function useFavorites() {
  const [initial] = useState(readFavorites)
  const [favorites, setFavorites] = useState(initial.ids)
  const [storageUnavailable, setStorageUnavailable] = useState(initial.error)

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      setFavorites(parseFavorites(event.newValue))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const replace = useCallback((next: Set<string>) => {
    setFavorites(next)
    try {
      const ids = [...next].sort()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ids }))
      setStorageUnavailable(false)
    } catch {
      setStorageUnavailable(true)
    }
  }, [])

  const toggle = useCallback((id: string) => {
    const next = new Set(favorites)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    replace(next)
  }, [favorites, replace])

  const remove = useCallback((ids: string[]) => {
    const next = new Set(favorites)
    ids.forEach((id) => next.delete(id))
    if (next.size !== favorites.size) replace(next)
  }, [favorites, replace])

  return { favorites, toggle, remove, storageUnavailable }
}
