export const favoritesKey = 'folio:favorites:v1'

export function parseFavorites(value: string | null): Set<string> {
  if (value === null) return new Set()
  try {
    const parsed: unknown = JSON.parse(value)
    if (!isFavoritesPayload(parsed)) return new Set()
    return new Set(parsed.ids)
  } catch {
    return new Set()
  }
}

export function serializeFavorites(ids: Iterable<string>): string {
  return JSON.stringify({ version: 1, ids: [...new Set(ids)].sort() })
}

export function readFavorites(): Set<string> {
  return parseFavorites(window.localStorage.getItem(favoritesKey))
}

export function writeFavorites(ids: Iterable<string>): void {
  window.localStorage.setItem(favoritesKey, serializeFavorites(ids))
}

function isFavoritesPayload(value: unknown): value is { version: 1; ids: string[] } {
  if (typeof value !== 'object' || value === null) return false
  if (!('version' in value) || !('ids' in value)) return false
  return value.version === 1 && Array.isArray(value.ids) && value.ids.every(id => typeof id === 'string')
}
