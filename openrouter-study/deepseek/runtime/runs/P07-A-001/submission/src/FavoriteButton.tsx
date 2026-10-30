import { Star } from 'lucide-react'

export function FavoriteButton({ taskId, active, onToggle }: { taskId: string; active: boolean; onToggle: (id: string) => void }) {
  return <button
    type="button"
    className={`favorite-button ${active ? 'is-favorite' : ''}`}
    aria-pressed={active}
    aria-label={`Priljubljeno opravilo ${taskId}`}
    onClick={() => onToggle(taskId)}
  >
    <Star size={15} strokeWidth={1.7} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
  </button>
}
