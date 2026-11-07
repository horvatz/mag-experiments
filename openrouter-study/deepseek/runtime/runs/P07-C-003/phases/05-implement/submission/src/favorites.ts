import { useSyncExternalStore } from 'react'

export const FAVORITES_KEY = 'folio:favorites:v1'

export interface FavoritesState {
  ids: Set<string>
  storageError: boolean
}

export function parseFavorites(raw: string | null): Set<string> | null {
  if (raw === null) return null
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  const record = value as { version?: unknown; ids?: unknown }
  if (record.version !== 1 || !Array.isArray(record.ids)) return null
  const ids = new Set<string>()
  for (const entry of record.ids) {
    if (typeof entry !== 'string') return null
    ids.add(entry)
  }
  return ids
}

function readStored(): FavoritesState {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(FAVORITES_KEY)) ?? new Set(), storageError: false }
  } catch {
    return { ids: new Set(), storageError: true }
  }
}

let state: FavoritesState = readStored()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function setState(next: FavoritesState) {
  state = next
  emit()
}

function persist(ids: Set<string>): boolean {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify({ version: 1, ids: [...ids].sort() }))
    return true
  } catch {
    return false
  }
}

function commit(ids: Set<string>) {
  const written = persist(ids)
  setState({ ids, storageError: state.storageError || !written })
}

export function toggleFavorite(id: string) {
  const ids = new Set(state.ids)
  if (ids.has(id)) ids.delete(id)
  else ids.add(id)
  commit(ids)
}

export function removeProjectFavorites(projectIds: Iterable<string>) {
  const ids = new Set(state.ids)
  for (const id of projectIds) ids.delete(id)
  commit(ids)
}

function subscribeFavorites(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getFavorites(): FavoritesState {
  return state
}

export function useFavorites(): FavoritesState {
  return useSyncExternalStore(subscribeFavorites, getFavorites)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== FAVORITES_KEY) return
    setState({ ids: parseFavorites(event.newValue) ?? new Set(), storageError: state.storageError })
  })
}
