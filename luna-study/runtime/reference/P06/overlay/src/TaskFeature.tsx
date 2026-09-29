import { useState } from 'react'
import type { Task } from '../shared/types.ts'
import type { FeatureContext, FeatureModel } from './feature-types.ts'
const columns = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const
const quote = (text: string) => '"' + text.replaceAll('"', '""') + '"'
const safe = (text: string) => /^[ \t\r\n]*[=+\-@]/.test(text) ? "'" + text : text

export function useTaskFeature({ tasks, project }: FeatureContext): FeatureModel {
  const [selected, setSelected] = useState<Set<keyof Task>>(() => new Set(columns)), [separator, setSeparator] = useState(';'), [filter, setFilter] = useState('all')
  const fields = columns.filter(column => selected.has(column)), rows = tasks.filter(task => filter === 'all' || task.status === filter)
  const download = () => {
    if (!fields.length || !rows.length) return
    const lines = [fields.map(quote).join(separator), ...rows.map(task => fields.map(field => quote(safe(task[field]))).join(separator))]
    const text = '\uFEFF' + lines.join('\r\n') + '\r\n'
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })), link = document.createElement('a')
    link.href = url; link.download = `folio-${project.id}.csv`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 0)
  }
  return { items: tasks, controls: <div className="feature-controls">
    <fieldset><legend>Kolone izvoza</legend>{columns.map(column => <label className="feature-check" key={column}><input type="checkbox" aria-label={`Stolpec ${column}`} checked={selected.has(column)} onChange={() => setSelected(previous => { const next = new Set(previous); if (next.has(column)) next.delete(column); else next.add(column); return next })} />{column}</label>)}</fieldset>
    <label>Ločilo CSV<select value={separator} onChange={e => setSeparator(e.target.value)}><option value=";">Podpičje</option><option value=",">Vejica</option></select></label>
    <label>Filter izvoza<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Vsa stanja</option><option value="todo">Pripravljeno</option><option value="in_progress">V delu</option><option value="done">Končano</option></select></label>
    <button type="button" disabled={!fields.length || !rows.length} onClick={download}>Izvozi CSV</button>
  </div> }
}
