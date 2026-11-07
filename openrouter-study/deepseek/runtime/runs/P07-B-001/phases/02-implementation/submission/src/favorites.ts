export const FAVORITES_KEY = 'folio:favorites:v1'

function isRecord(value: unknown): value is { version: unknown; ids: unknown } {
  return typeof value === 'object' && value !== null
}

/** Validira in normalizira shranjeni zapis; neveljaven zapis pomeni prazno množico. */
export function parseFavorites(raw: string | null): Set<string> {
  if (raw === null) return new Set()
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return new Set()
  }
  if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.ids)) return new Set()
  const ids = new Set<string>()
  for (const entry of parsed.ids) {
    if (typeof entry !== 'string') return new Set()
    ids.add(entry)
  }
  return ids
}

/** Zapise množico kot {version:1, ids:[...]}; ID-ji so enkratni nizi, urejeni po UTF-16. */
export function serializeFavorites(ids: Set<string>): string {
  return JSON.stringify({ version: 1, ids: [...ids].sort() })
}

/** Prebere shrambo; ob izjemi vrne prazno množico in oznako napake. */
export function loadFavorites(): { favorites: Set<string>; storageError: boolean } {
  try {
    return { favorites: parseFavorites(window.localStorage.getItem(FAVORITES_KEY)), storageError: false }
  } catch {
    return { favorites: new Set(), storageError: true }
  }
}

/** Zapiše shrambo; vrne true ob uspehu, false ob izjemi. */
export function saveFavorites(ids: Set<string>): boolean {
  try {
    window.localStorage.setItem(FAVORITES_KEY, serializeFavorites(ids))
    return true
  } catch {
    return false
  }
}
