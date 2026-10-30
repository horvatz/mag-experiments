export interface FavoritesState { version: 1; ids: string[]; }

export function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem("folio:favorites:v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoritesState;
    if (parsed.version !== 1 || !Array.isArray(parsed.ids)) return [];
    return [...new Set(parsed.ids)];
  } catch { return []; }
}

export function saveFavorites(ids: string[]): void {
  try {
    localStorage.setItem("folio:favorites:v1", JSON.stringify({ version: 1, ids }));
  } catch {}
}