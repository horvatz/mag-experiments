import { useSyncExternalStore } from 'react'

export const FAVORITES_KEY = 'folio:favorites:v1'

export type FavoritesState = {
  ids: ReadonlySet<string>
  storageError: boolean
}

let state: FavoritesState = { ids: new Set<string>(), storageError: false }
let initialized = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

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
  const ids = new Set<string>()
  for (const id of record.ids) {
    if (typeof id !== 'string') return new Set()
    ids.add(id)
  }
  return ids
}

export function serializeFavorites(ids: Iterable<string>): string {
  return JSON.stringify({ version: 1, ids: [...new Set(ids)].sort() })
}

function readFavorites(): FavoritesState {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(FAVORITES_KEY)), storageError: false }
  } catch {
    return { ids: new Set<string>(), storageError: true }
  }
}

function ensureInitialized() {
  if (initialized) return
  initialized = true
  state = readFavorites()
}

function commit(next: Set<string>) {
  state = { ids: next, storageError: state.storageError }
  try {
    window.localStorage.setItem(FAVORITES_KEY, serializeFavorites(next))
  } catch {
    state = { ids: next, storageError: true }
  }
  emit()
}

export function toggleFavorite(id: string) {
  ensureInitialized()
  const next = new Set(state.ids)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  commit(next)
}

export function removeFavorites(idsToRemove: Iterable<string>) {
  ensureInitialized()
  const next = new Set(state.ids)
  for (const id of idsToRemove) next.delete(id)
  commit(next)
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key !== FAVORITES_KEY) return
  ensureInitialized()
  state = { ids: parseFavorites(event.newValue), storageError: state.storageError }
  emit()
}

function subscribe(listener: () => void) {
  ensureInitialized()
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', handleStorageEvent)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', handleStorageEvent)
  }
}

function getSnapshot(): FavoritesState {
  ensureInitialized()
  return state
}

export function useFavorites(): FavoritesState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
