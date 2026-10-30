import { loadFavorites, saveFavorites, type FavoritesState } from "./favorites.ts"
import type { Project } from "../shared/types.ts"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Map<string, boolean>>(new Map())
  
  const projectIdKey = "folio:favorites:v1"
  
  useEffect(() => {
    let mounted = true
    try {
      if (mounted) {
        const raw = localStorage.getItem(projectIdKey)
        if (raw) {
          const parsed = JSON.parse(raw) as FavoritesState
          if (parsed.version === 1 && Array.isArray(parsed.ids)) {
            setFavorites(new Set(parsed.ids))
          }
        }
      }
    } catch (e) {
      console.error("Failed to load favorites:", e)
    }
    return () => { mounted = false }
  }, [])
  
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === projectIdKey && e.newValue !== null) {
        const raw = e.newValue
        try {
          const parsed = JSON.parse(raw) as FavoritesState
          if (parsed.version === 1 && Array.isArray(parsed.ids)) {
            const newIds = new Set(parsed.ids)
            if (favorites.size !== newIds.size || [...newIds].some((id) => !favorites.has(id))) {
              setFavorites(newIds)
            }
          }
        } catch {
          // Invalid, keep existing
        }
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [favorites])
  
  const toggle = (taskId: string) => {
    const current = Array.from(favorites)
    const idx = current.indexOf(taskId)
    const newSet = idx >= 0 ? new Set(current.filter((_, i) => i !== idx)) : new Set([...current, taskId])
    setFavoriteIds(new Set(newSet))
    saveFavorites(Array.from(newSet))
  }
  
  const removeProjectFavorites = (project: Project) => {
    const newIds = new Set(favorites)
    newIds.delete(project.id)
    setFavoriteIds(new Set(Array.from(newIds)))
  }
  
  return { favorites: Array.from(favoriteIds.keys()), toggle, removeProjectFavorites, projectIdKey }
}
