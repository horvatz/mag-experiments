import { useSyncExternalStore } from "react"

export const FAVORITES_KEY = "folio:favorites:v1"

export type FavoritesState = { ids: readonly string[]; storageError: boolean }

export function parseFavorites(raw: string | null): string[] {
  if (raw === null) return []
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return []
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return []
  const record = value as Record<string, unknown>
  if (record.version !== 1 || !Array.isArray(record.ids)) return []
  if (!record.ids.every((id) => typeof id === "string")) return []
  return [...new Set(record.ids as string[])]
}

function readStorage(): FavoritesState {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(FAVORITES_KEY)), storageError: false }
  } catch {
    return { ids: [], storageError: true }
  }
}

let state: FavoritesState = readStorage()
const listeners = new Set<() => void>()

function setState(next: FavoritesState) {
  state = next
  for (const listener of listeners) listener()
}

export function subscribeFavorites(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function getFavoritesState(): FavoritesState {
  return state
}

function commit(ids: Iterable<string>) {
  const sorted = [...new Set(ids)].sort()
  let storageError: boolean
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify({ version: 1, ids: sorted }))
    storageError = false
  } catch {
    storageError = true
  }
  setState({ ids: sorted, storageError })
}

export function toggleFavorite(id: string) {
  const ids = new Set(state.ids)
  if (ids.has(id)) ids.delete(id)
  else ids.add(id)
  commit(ids)
}

export function removeFavoritesFor(projectTaskIds: readonly string[]) {
  const removed = new Set(projectTaskIds)
  commit(state.ids.filter((id) => !removed.has(id)))
}

function syncFromEvent(newValue: string | null) {
  setState({ ids: parseFavorites(newValue), storageError: state.storageError })
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === FAVORITES_KEY || event.key === null) {
      syncFromEvent(event.key === null ? null : event.newValue)
    }
  })
}

export function useFavorites(): FavoritesState {
  return useSyncExternalStore(subscribeFavorites, getFavoritesState)
}
