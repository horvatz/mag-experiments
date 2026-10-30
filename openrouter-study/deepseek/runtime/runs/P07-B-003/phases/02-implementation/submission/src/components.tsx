import { AlertCircle, Circle, CircleCheck, CircleDashed, RotateCw, Star } from 'lucide-react'
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

export function FavoriteButton({ id, pressed, onToggle }: { id: string; pressed: boolean; onToggle: (id: string) => void }) {
  return <button
    type="button"
    className="favorite-button"
    aria-pressed={pressed}
    aria-label={`Priljubljeno opravilo ${id}`}
    onClick={() => onToggle(id)}
  ><Star size={15} strokeWidth={1.6} aria-hidden="true" /></button>
}

export function StorageWarning() {
  return <div className="storage-warning" role="alert">
    <AlertCircle size={18} aria-hidden="true" />
    <span>Lokalna shramba ni na voljo. Priljubljena opravila bodo ostala le v tem pogledu.</span>
  </div>
}
