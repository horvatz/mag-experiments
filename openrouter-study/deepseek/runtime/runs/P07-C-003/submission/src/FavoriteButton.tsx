import { Star } from 'lucide-react'
import { toggleFavorite, useFavorites } from './favorites.ts'

export function FavoriteButton({ taskId }: { taskId: string }) {
  const { ids } = useFavorites()
  const active = ids.has(taskId)
  return <button
    type="button"
    className="favorite-button"
    aria-pressed={active}
    aria-label={'Priljubljeno opravilo ' + taskId}
    onClick={() => toggleFavorite(taskId)}
  >
    <Star size={15} strokeWidth={1.6} aria-hidden="true" />
  </button>
}
