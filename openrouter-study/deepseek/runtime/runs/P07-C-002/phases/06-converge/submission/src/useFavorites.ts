import { useCallback, useEffect, useRef, useState } from "react"
import { FAVORITES_KEY, parseFavorites, serializeFavorites } from "./favorites.ts"

export interface Favorites {
  ids: Set<string>
  toggle: (id: string) => void
  removeForProject: (projectTaskIds: Iterable<string>) => void
  storageError: boolean
}

export function useFavorites(): Favorites {
  const initial = useRef<{ ids: Set<string>; error: boolean } | null>(null)
  if (initial.current === null) {
    try {
      initial.current = { ids: new Set(parseFavorites(window.localStorage.getItem(FAVORITES_KEY)) ?? []), error: false }
    } catch {
      initial.current = { ids: new Set(), error: true }
    }
  }
  const [ids, setIds] = useState<Set<string>>(initial.current.ids)
  const [storageError, setStorageError] = useState(initial.current.error)
  const idsRef = useRef(ids)

  const persist = useCallback((next: Set<string>) => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, serializeFavorites(next))
    } catch {
      setStorageError(true)
    }
  }, [])

  const commit = useCallback((next: Set<string>, write: boolean) => {
    idsRef.current = next
    setIds(next)
    if (write) persist(next)
  }, [persist])

  const toggle = useCallback((id: string) => {
    const next = new Set(idsRef.current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    commit(next, true)
  }, [commit])

  const removeForProject = useCallback((projectTaskIds: Iterable<string>) => {
    const next = new Set(idsRef.current)
    for (const id of projectTaskIds) next.delete(id)
    commit(next, true)
  }, [commit])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_KEY) return
      commit(new Set(parseFavorites(event.newValue) ?? []), false)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [commit])

  return { ids, toggle, removeForProject, storageError }
}
