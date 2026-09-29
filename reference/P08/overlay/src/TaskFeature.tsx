import { useState } from 'react'
import type { Task } from '../shared/types.ts'
import type { FeatureContext, FeatureModel } from './feature-types.ts'
const labels = { overdue: 'Zapadlo', today: 'Danes', week: 'Naslednjih 7 dni', later: 'Pozneje', done: 'Končano' }
type Bucket = keyof typeof labels
function bucket(task: Task, anchor: string): Bucket {
  if (task.status === 'done') return 'done'
  if (task.dueDate < anchor) return 'overdue'
  if (task.dueDate === anchor) return 'today'
  const last = new Date(Date.parse(anchor + 'T00:00:00Z') + 7 * 86400000).toISOString().slice(0, 10)
  return task.dueDate <= last ? 'week' : 'later'
}

export function useTaskFeature({ tasks }: FeatureContext): FeatureModel {
  const [draft, setDraft] = useState('2026-09-21'), [anchor, setAnchor] = useState('2026-09-21'), [filter, setFilter] = useState<Bucket | 'all'>('all')
  const counts = Object.fromEntries(Object.keys(labels).map(key => [key, tasks.filter(task => bucket(task, anchor) === key).length]))
  const items = tasks.filter(task => filter === 'all' || bucket(task, anchor) === filter)
  return { items, emptyMessage: 'Ni opravil v izbrani skupini.', controls: <div className="feature-controls">
    <label>Referenčni datum<input type="date" value={draft} onChange={e => { const next = e.target.value; setDraft(next); if (next) setAnchor(next) }} /></label>
    <label>Pogled rokov<select value={filter} onChange={e => setFilter(e.target.value as Bucket | 'all')}><option value="all">Vsi roki</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    {Object.entries(labels).map(([key, label]) => <div className="feature-count" key={key}><span>{label}</span><strong aria-label={`Število rokov ${key}`}>{counts[key]}</strong></div>)}
    {!draft && <p role="alert">Vnesi veljaven referenčni datum.</p>}
  </div> }
}
