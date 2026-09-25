import { Star } from 'lucide-react'

export function FavoriteButton({ id, pressed, onToggle }: { id: string; pressed: boolean; onToggle: (id: string) => void }) {
  return <button type="button" className="favorite-button" aria-label={`Priljubljeno opravilo ${id}`} aria-pressed={pressed} title={pressed ? 'Odstrani iz priljubljenih' : 'Dodaj med priljubljena'} onClick={() => onToggle(id)}>
    <Star size={17} strokeWidth={1.6} fill={pressed ? 'currentColor' : 'none'} aria-hidden="true" />
  </button>
}
