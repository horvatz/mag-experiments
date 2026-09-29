import { Star } from 'lucide-react'

export function FavoriteButton({ id, selected, onToggle }: { id: string; selected: boolean; onToggle: (id: string) => void }) {
  return <button type="button" className="favorite-button" aria-label={`Priljubljeno opravilo ${id}`} aria-pressed={selected} onClick={() => onToggle(id)}>
    <Star size={16} strokeWidth={1.6} aria-hidden="true" />
  </button>
}
