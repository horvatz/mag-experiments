import { useEffect, useRef, useState } from 'react'
import type { FeatureContext, FeatureModel } from './feature-types.ts'
const key = 'folio:favorites:v1'
type Stored = { ids: Set<string>; error: boolean }
function parse(text: string | null): Set<string> {
  try { const value: unknown = text ? JSON.parse(text) : null
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('ids' in value) || !Array.isArray(value.ids) || !value.ids.every(id => typeof id === 'string')) return new Set()
    return new Set(value.ids as string[])
  } catch { return new Set() }
}
let memory: Stored | undefined
function load(): Stored {
  if (memory?.error) return memory
  try { return { ids: parse(localStorage.getItem(key)), error: false } }
  catch { return memory ?? { ids: new Set(), error: true } }
}

export function useTaskFeature({ tasks }: FeatureContext): FeatureModel {
  const [stored, setStored] = useState(load), [only, setOnly] = useState(false)
  const current = useRef(stored)
  useEffect(() => {
    const listener = (event: StorageEvent) => { if (event.key !== key) return; const next = { ids: parse(event.newValue), error: false }; memory = next; current.current = next; setStored(next) }
    window.addEventListener('storage', listener); return () => window.removeEventListener('storage', listener)
  }, [])
  const commit = (ids: Set<string>) => {
    let error: boolean
    try { localStorage.setItem(key, JSON.stringify({ version: 1, ids: [...ids].sort() })); error = false } catch { error = true }
    const next = { ids, error }; memory = next; current.current = next; setStored(next)
  }
  const count = tasks.filter(task => stored.ids.has(task.id)).length
  const items = only ? tasks.filter(task => stored.ids.has(task.id)) : tasks
  return { items, emptyMessage: 'Ni priljubljenih opravil.', controls: <div className="feature-controls">
    <label className="feature-check"><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} />Prikaži le priljubljena</label>
    <button type="button" disabled={!count} onClick={() => { const ids = new Set(current.current.ids); for (const task of tasks) ids.delete(task.id); commit(ids) }}>Odstrani priljubljene tega projekta</button>
    <p role="status" aria-label="Število priljubljenih">Priljubljeno: {count} od {tasks.length}.</p>
    {stored.error && <p role="alert">Trajna shramba ni dostopna. Spremembe veljajo do osvežitve strani.</p>}
  </div>, renderExtra: task => <div className="feature-row-actions"><button type="button" aria-label={`Priljubljeno opravilo ${task.id}`} aria-pressed={stored.ids.has(task.id)} onClick={() => { const ids = new Set(current.current.ids); if (ids.has(task.id)) ids.delete(task.id); else ids.add(task.id); commit(ids) }}>{stored.ids.has(task.id) ? '★' : '☆'} Priljubljeno</button></div> }
}
