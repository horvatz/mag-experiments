export const FAVORITES_KEY = "folio:favorites:v1"

export function parseFavorites(value: string | null): string[] | null {
  if (value === null) return null
  let data: unknown
  try {
    data = JSON.parse(value)
  } catch {
    return null
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null
  const record = data as { version?: unknown; ids?: unknown }
  if (record.version !== 1 || !Array.isArray(record.ids)) return null
  const ids: string[] = []
  for (const id of record.ids) {
    if (typeof id !== "string") return null
    if (!ids.includes(id)) ids.push(id)
  }
  return ids
}

export function serializeFavorites(ids: Iterable<string>): string {
  const unique = [...new Set(ids)].sort()
  return JSON.stringify({ version: 1, ids: unique })
}
