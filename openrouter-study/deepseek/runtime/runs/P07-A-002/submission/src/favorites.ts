import { useCallback, useEffect, useRef, useState } from 'react'

export const FAVORITES_KEY = 'folio:favorites:v1'

export interface FavoritesState {
  ids: string[]
  error: boolean
}

export function normalizeFavorites(ids: string[]): string[] {
  return [...new Set(ids)].sort()
}

export function parseFavorites(raw: string | null): string[] {
  if (raw === null) return []
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return []
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return []
  const record = value as Record<string, unknown>
  if (record.version !== 1 || !Array.isArray(record.ids)) return []
  if (!record.ids.every((id): id is string => typeof id === 'string')) return []
  return normalizeFavorites(record.ids)
}

function readStored(): FavoritesState {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(FAVORITES_KEY)), error: false }
  } catch {
    return { ids: [], error: true }
  }
}

function writeStored(ids: string[]): boolean {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify({ version: 1, ids: normalizeFavorites(ids) }))
    return true
  } catch {
    return false
  }
}

export function useFavorites() {
  const [state, setState] = useState<FavoritesState>(readStored)
  const latest = useRef(state)
  latest.current = state

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_KEY) return
      setState((previous) => ({ ids: parseFavorites(event.newValue), error: previous.error }))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggle = useCallback((id: string) => {
    const previous = latest.current
    const next = previous.ids.includes(id) ? previous.ids.filter((value) => value !== id) : [...previous.ids, id]
    const ids = normalizeFavorites(next)
    const result = { ids, error: previous.error || !writeStored(ids) }
    latest.current = result
    setState(result)
  }, [])

  const removeProject = useCallback((taskIds: string[]) => {
    const previous = latest.current
    const remove = new Set(taskIds)
    const ids = previous.ids.filter((id) => !remove.has(id))
    const result = { ids, error: previous.error || !writeStored(ids) }
    latest.current = result
    setState(result)
  }, [])

  return { ids: state.ids, error: state.error, toggle, removeProject }
}
