import { useEffect, useState } from 'react'

export const FAVORITES_KEY = 'folio:favorites:v1'

function normalize(ids: string[]) {
  return [...new Set(ids)].sort()
}

function parseFavorites(value: string | null): string[] {
  if (value === null) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null) return []
    const record = parsed as { version?: unknown; ids?: unknown }
    if (record.version !== 1 || !Array.isArray(record.ids) || !record.ids.every((id) => typeof id === 'string')) return []
    return normalize(record.ids)
  } catch {
    return []
  }
}

function loadFavorites(): { ids: string[]; storageUnavailable: boolean } {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(FAVORITES_KEY)), storageUnavailable: false }
  } catch {
    return { ids: [], storageUnavailable: true }
  }
}

export function useFavorites() {
  const [initial] = useState(loadFavorites)
  const [ids, setIds] = useState(initial.ids)
  const [readUnavailable] = useState(initial.storageUnavailable)
  const [writeUnavailable, setWriteUnavailable] = useState(false)

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== FAVORITES_KEY) return
      setIds(parseFavorites(event.newValue))
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const save = (next: string[]) => {
    const normalized = normalize(next)
    setIds(normalized)
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify({ version: 1, ids: normalized }))
      setWriteUnavailable(false)
    } catch {
      setWriteUnavailable(true)
    }
  }

  const toggle = (id: string) => {
    save(ids.includes(id) ? ids.filter((favoriteId) => favoriteId !== id) : [...ids, id])
  }

  const removeProject = (projectIds: string[]) => {
    const remove = new Set(projectIds)
    save(ids.filter((id) => !remove.has(id)))
  }

  return { ids, toggle, removeProject, storageUnavailable: readUnavailable || writeUnavailable }
}
