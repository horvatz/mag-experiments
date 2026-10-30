import { AlertCircle, Circle, CircleCheck, CircleDashed, RotateCw } from 'lucide-react'
import type { TaskStatus } from '../shared/types.ts'

export function StatusIcon({ status, size = 14 }: { status: TaskStatus; size?: number }) {
  const Icon = { todo: Circle, in_progress: CircleDashed, done: CircleCheck }[status]
  return <Icon className={`status-symbol status-symbol-${status}`} size={size} strokeWidth={1.6} aria-hidden="true" />
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const labels = { todo: 'Pripravljeno', in_progress: 'V delu', done: 'Končano' }
  return <span className={`status-badge status-${status}`}><StatusIcon status={status} size={12} />{labels[status]}</span>
}

export function Avatar({ name }: { name: string }) {
  return <span className="avatar" aria-hidden="true">{name.split(' ').map((part) => part[0]).join('')}</span>
}

export function Loading({ label = 'Nalaganje podatkov …' }: { label?: string }) {
  return <div className="state-message" role="status"><span className="spinner" aria-hidden="true" /><p>{label}</p></div>
}

export function LoadError({ message, retry }: { message: string; retry: () => void }) {
  return <div className="state-message error-state" role="alert">
    <AlertCircle size={24} aria-hidden="true" />
    <h3>Podatki niso na voljo</h3><p>{message}</p>
    <button className="button" onClick={retry}><RotateCw size={15} aria-hidden="true" />Poskusi znova</button>
  </div>
}
import { Star } from "lucide-react"

export function FavoriteButton({ onClick, checked, ariaLabel }: { onClick: () => void; checked: boolean; ariaLabel: string }) {
  return <button type="button" title={ariaLabel} onClick={onClick} aria-pressed={checked} className="favorite-button">
    <Star size={14} strokeWidth={1.6} className={checked ? "filled" : ""} aria-hidden="true" />
  </button>
}

export function FavoritesCount({ count, totalCount }: { count: number; totalCount: number }) {
  return <span role="status" aria-label={`Priljubljeno: ${count} od ${totalCount}`} className="favorites-count">Priljubljeno: {count} od {totalCount}</span>
}

export function RemoveProjectFavorites({ onRemove, disabled }: { onRemove: () => void; disabled: boolean }) {
  return <button type="button" disabled={disabled} onClick={onRemove} className="remove-favorites-button" aria-label="Odstrani priljubljene tega projekta">Odstrani priljubljene tega projekta</button>
}

export function ShowFavoritesOnly({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return <input type="checkbox" checked={checked} onChange={onChange} id="show-favorites-only" className="show-favorites-only-checkbox" aria-label="Prikaži le priljubljena" />
}
// Import new components
