export const FAVORITES_STORAGE_KEY = 'folio:favorites:v1'

export function parseFavorites(value: string | null): string[] {
  if (value === null) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return []
    const record = parsed as { version?: unknown; ids?: unknown }
    if (record.version !== 1 || !Array.isArray(record.ids) || !record.ids.every((id) => typeof id === 'string')) return []
    return [...new Set(record.ids)]
  } catch {
    return []
  }
}

export function serializeFavorites(ids: Iterable<string>): string {
  return JSON.stringify({ version: 1, ids: [...new Set(ids)].sort() })
}

export function readFavorites(): { ids: string[]; unavailable: boolean } {
  try {
    const value = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    return { ids: parseFavorites(value), unavailable: false }
  } catch {
    return { ids: [], unavailable: true }
  }
}
