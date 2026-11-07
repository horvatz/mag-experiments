import { Star } from 'lucide-react'

export function FavoriteButton({ taskId, pressed, onToggle, className }: {
  taskId: string
  pressed: boolean
  onToggle: (id: string) => void
  className?: string
}) {
  return <button
    type="button"
    className={className ? `favorite-button ${className}` : 'favorite-button'}
    aria-pressed={pressed}
    aria-label={`Priljubljeno opravilo ${taskId}`}
    title={pressed ? 'Odstrani iz priljubljenih' : 'Dodaj med priljubljene'}
    onClick={() => onToggle(taskId)}
  >
    <Star size={15} strokeWidth={1.7} fill={pressed ? 'currentColor' : 'none'} aria-hidden="true" />
  </button>
}
