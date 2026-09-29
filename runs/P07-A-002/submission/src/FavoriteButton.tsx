import { Star } from 'lucide-react'

export function FavoriteButton({ id, pressed, onToggle }: { id: string; pressed: boolean; onToggle: (id: string) => void }) {
  return <button
    type="button"
    className="favorite-button"
    aria-label={`Priljubljeno opravilo ${id}`}
    aria-pressed={pressed}
    onClick={() => onToggle(id)}
  ><Star size={17} strokeWidth={1.6} aria-hidden="true" /></button>
}
