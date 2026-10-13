import { AlertCircle, Calendar, Circle, CircleCheck, CircleDashed, RotateCw } from 'lucide-react'
import type { Task, TaskStatus } from '../shared/types.ts'

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

export function ReferencniDatum({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="control-group">
      <label htmlFor="ref-date">Referenčni datum</label>
      <input
        type="date"
        id="ref-date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        defaultValue="2026-09-21"
      />
    </div>
  )
}

export function PogledRokov({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { value: "all", label: "Vse" },
    { value: "overdue", label: "Zapadlo" },
    { value: "today", label: "Danes" },
    { value: "week", label: "Naslednjih 7 dni" },
    { value: "later", label: "Pozneje" },
    { value: "done", label: "Končano" },
  ]
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Pogled rokov">
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

