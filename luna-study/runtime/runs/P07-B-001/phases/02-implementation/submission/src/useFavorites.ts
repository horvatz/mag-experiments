import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'folio:favorites:v1'

function parseFavorites(value: string | null): Set<string> {
  if (value === null) return new Set()
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null) return new Set()
    const record = parsed as { version?: unknown; ids?: unknown }
    if (record.version !== 1 || !Array.isArray(record.ids) || record.ids.some((id) => typeof id !== 'string')) return new Set()
    return new Set(record.ids)
  } catch {
    return new Set()
  }
}

function loadFavorites() {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(STORAGE_KEY)), error: null }
  } catch {
    return { ids: new Set<string>(), error: 'Opozorilo: shramba priljubljenih ni dostopna. Izbor je trenutno shranjen v pomnilniku.' }
  }
}

export function useFavorites() {
  const [initial] = useState(loadFavorites)
  const [favorites, setFavorites] = useState(initial.ids)
  const [storageError, setStorageError] = useState<string | null>(initial.error)
  const favoritesRef = useRef(initial.ids)

  const update = useCallback((ids: Set<string>, persist: boolean) => {
    favoritesRef.current = ids
    setFavorites(ids)
    if (!persist) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ids: [...ids].sort() }))
      setStorageError(null)
    } catch {
      setStorageError('Opozorilo: shramba priljubljenih ni dostopna. Izbor je trenutno shranjen v pomnilniku.')
    }
  }, [])

  const toggle = useCallback((id: string) => {
    const next = new Set(favoritesRef.current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    update(next, true)
  }, [update])

  const remove = useCallback((ids: Set<string>) => {
    const next = new Set([...favoritesRef.current].filter((id) => !ids.has(id)))
    update(next, true)
  }, [update])

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return
      update(parseFavorites(event.newValue), false)
      setStorageError(null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [update])

  return { favorites, storageError, toggle, remove }
}
