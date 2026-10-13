import { useState } from 'react'
import type { Task } from '../shared/types.ts'
import type { FeatureContext, FeatureModel } from './feature-types.ts'
type History = { current: Task[]; undo: Task[][]; redo: Task[][] }
const same = (a: Task[], b: Task[]) => a.length === b.length && a.every((task, index) => task.id === b[index].id)

export function useTaskFeature({ tasks }: FeatureContext): FeatureModel {
  const [state, setState] = useState<History>(() => ({ current: tasks, undo: [], redo: [] }))
  const move = (id: string, delta: number) => setState(previous => {
    const from = previous.current.findIndex(task => task.id === id), to = from + delta
    if (from < 0 || to < 0 || to >= previous.current.length) return previous
    const next = [...previous.current]; [next[from], next[to]] = [next[to], next[from]]
    return { current: next, undo: [...previous.undo, previous.current].slice(-20), redo: [] }
  })
  return { items: state.current, controls: <div className="feature-controls">
    <button type="button" disabled={!state.undo.length} onClick={() => setState(previous => !previous.undo.length ? previous : { current: previous.undo.at(-1)!, undo: previous.undo.slice(0, -1), redo: [...previous.redo, previous.current] })}>Razveljavi premik</button>
    <button type="button" disabled={!state.redo.length} onClick={() => setState(previous => !previous.redo.length ? previous : { current: previous.redo.at(-1)!, redo: previous.redo.slice(0, -1), undo: [...previous.undo, previous.current].slice(-20) })}>Ponovi premik</button>
    <button type="button" disabled={same(state.current, tasks)} onClick={() => setState(previous => same(previous.current, tasks) ? previous : { current: tasks, undo: [...previous.undo, previous.current].slice(-20), redo: [] })}>Začetni vrstni red</button>
    <p role="status" aria-label="Zgodovina vrstnega reda">Razveljavitve: {state.undo.length}. Ponovitve: {state.redo.length}.</p>
  </div>, renderExtra: task => {
    const index = state.current.findIndex(entry => entry.id === task.id)
    return <div className="feature-row-actions"><span aria-label={`Mesto opravila ${task.id}`}>{index + 1}</span><button type="button" aria-label={`Premakni ${task.id} gor`} disabled={index === 0} onClick={() => move(task.id, -1)}>↑</button><button type="button" aria-label={`Premakni ${task.id} dol`} disabled={index === state.current.length - 1} onClick={() => move(task.id, 1)}>↓</button></div>
  } }
}
