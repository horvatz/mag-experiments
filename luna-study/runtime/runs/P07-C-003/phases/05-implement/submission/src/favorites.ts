export const FAVORITES_STORAGE_KEY = 'folio:favorites:v1'

export function parseFavorites(raw: string | null): Set<string> {
  if (raw === null) return new Set()
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return new Set()
    const record = value as { version?: unknown; ids?: unknown }
    if (record.version !== 1 || !Array.isArray(record.ids) || !record.ids.every((id) => typeof id === 'string')) return new Set()
    return new Set(record.ids)
  } catch {
    return new Set()
  }
}

export function serializeFavorites(ids: Iterable<string>): string {
  return JSON.stringify({ version: 1, ids: [...new Set(ids)].sort() })
}

export function readFavorites(): { ids: Set<string>; unavailable: boolean } {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(FAVORITES_STORAGE_KEY)), unavailable: false }
  } catch {
    return { ids: new Set(), unavailable: true }
  }
}
