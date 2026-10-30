export const FAVORITES_KEY = 'folio:favorites:v1'

export function normalizeFavorites(ids: readonly string[]): string[] {
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
  if (typeof value !== 'object' || value === null) return []
  const record = value as { version?: unknown; ids?: unknown }
  if (record.version !== 1 || !Array.isArray(record.ids)) return []
  if (!record.ids.every((id): id is string => typeof id === 'string')) return []
  return normalizeFavorites(record.ids)
}

export function serializeFavorites(ids: readonly string[]): string {
  return JSON.stringify({ version: 1, ids: normalizeFavorites(ids) })
}
