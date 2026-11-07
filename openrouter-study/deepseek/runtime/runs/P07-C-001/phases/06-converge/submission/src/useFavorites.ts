import { useCallback, useSyncExternalStore } from 'react'
import { FAVORITES_KEY, normalizeFavorites, parseFavorites, serializeFavorites } from './favorites.ts'

export type FavoritesState = { ids: string[]; storageError: boolean }

const listeners = new Set<() => void>()
let state: FavoritesState = { ids: [], storageError: false }
let initialized = false

function emit() {
  for (const listener of listeners) listener()
}

function ensureInitialized() {
  if (initialized) return
  initialized = true
  try {
    state = { ids: parseFavorites(window.localStorage.getItem(FAVORITES_KEY)), storageError: false }
  } catch {
    state = { ids: [], storageError: true }
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): FavoritesState {
  ensureInitialized()
  return state
}

function persist(ids: readonly string[]) {
  const next = normalizeFavorites(ids)
  try {
    window.localStorage.setItem(FAVORITES_KEY, serializeFavorites(next))
    state = { ids: next, storageError: false }
  } catch {
    state = { ids: next, storageError: true }
  }
  emit()
}

function handleStorage(event: StorageEvent) {
  if (event.key !== FAVORITES_KEY) return
  ensureInitialized()
  const ids = event.newValue === null ? [] : parseFavorites(event.newValue)
  state = { ids, storageError: false }
  emit()
}

window.addEventListener('storage', handleStorage)

export function toggleFavorite(id: string) {
  ensureInitialized()
  persist(state.ids.includes(id) ? state.ids.filter((entry) => entry !== id) : [...state.ids, id])
}

export function removeFavoritesFor(taskIds: readonly string[]) {
  ensureInitialized()
  const remove = new Set(taskIds)
  persist(state.ids.filter((id) => !remove.has(id)))
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot)
  const toggle = useCallback((id: string) => toggleFavorite(id), [])
  const removeForProject = useCallback((taskIds: readonly string[]) => removeFavoritesFor(taskIds), [])
  return { ids: favorites.ids, storageError: favorites.storageError, toggle, removeForProject }
}
