import { useState } from 'react'
import type { Task } from '../shared/types.ts'
import type { FeatureContext, FeatureModel } from './feature-types.ts'
import { normalise, compare } from './feature-utils.ts'
const keys = ['title', 'assignee', 'status', 'dueDate'] as const
type Key = typeof keys[number]
const statusOrder = { todo: 0, in_progress: 1, done: 2 }
const value = (task: Task, key: Key) => key === 'status' ? statusOrder[task.status] : key === 'dueDate' ? task.dueDate : normalise(task[key])

export function useTaskFeature({ tasks }: FeatureContext): FeatureModel {
  const [primary, setPrimary] = useState<Key | 'original'>('original'), [secondary, setSecondary] = useState<Key | 'none'>('none')
  const [direction, setDirection] = useState('asc'), [secondDirection, setSecondDirection] = useState('asc')
  const items = primary === 'original' ? tasks : tasks.map((task, index) => ({ task, index })).sort((a, b) => {
    const first = compare(value(a.task, primary), value(b.task, primary)) * (direction === 'asc' ? 1 : -1)
    const second = secondary === 'none' ? 0 : compare(value(a.task, secondary), value(b.task, secondary)) * (secondDirection === 'asc' ? 1 : -1)
    return first || second || a.index - b.index
  }).map(entry => entry.task)
  return { items, controls: <div className="feature-controls">
    <label>Primarni ključ<select value={primary} onChange={e => setPrimary(e.target.value as Key | 'original')}><option value="original">Izvorno</option>{keys.map(key => <option key={key} value={key}>{key}</option>)}</select></label>
    <label>Primarna smer<select value={direction} onChange={e => setDirection(e.target.value)}><option value="asc">Naraščajoče</option><option value="desc">Padajoče</option></select></label>
    <label>Sekundarni ključ<select value={secondary} onChange={e => setSecondary(e.target.value as Key | 'none')}><option value="none">Brez</option>{keys.map(key => <option key={key} value={key}>{key}</option>)}</select></label>
    <label>Sekundarna smer<select value={secondDirection} onChange={e => setSecondDirection(e.target.value)}><option value="asc">Naraščajoče</option><option value="desc">Padajoče</option></select></label>
    <button type="button" onClick={() => { setPrimary('original'); setDirection('asc'); setSecondary('none'); setSecondDirection('asc') }}>Izvorni vrstni red</button>
  </div> }
}
