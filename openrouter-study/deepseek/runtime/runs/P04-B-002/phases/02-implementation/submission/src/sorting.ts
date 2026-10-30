import type { Task } from '../shared/types.ts'

export type SortKey = 'title' | 'assignee' | 'status' | 'dueDate'
export type PrimaryKey = 'original' | SortKey
export type SecondaryKey = 'none' | SortKey
export type SortDirection = 'asc' | 'desc'

export type SortControls = {
  primaryKey: PrimaryKey
  primaryDirection: SortDirection
  secondaryKey: SecondaryKey
  secondaryDirection: SortDirection
}

export const defaultSortControls: SortControls = {
  primaryKey: 'original',
  primaryDirection: 'asc',
  secondaryKey: 'none',
  secondaryDirection: 'asc',
}

const statusRank = { todo: 0, in_progress: 1, done: 2 } as const

export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function compareKey(key: SortKey, a: Task, b: Task): number {
  if (key === 'title' || key === 'assignee') {
    const left = normalize(a[key])
    const right = normalize(b[key])
    return left < right ? -1 : left > right ? 1 : 0
  }
  if (key === 'status') return statusRank[a.status] - statusRank[b.status]
  return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0
}

function applyDirection(direction: SortDirection, value: number): number {
  return direction === 'asc' ? value : -value
}

export function sortTasks(tasks: Task[], controls: SortControls): Task[] {
  if (controls.primaryKey === 'original') return tasks.slice()
  const indexed = tasks.map((task, index) => ({ task, index }))
  indexed.sort((left, right) => {
    const primary = applyDirection(controls.primaryDirection, compareKey(controls.primaryKey as SortKey, left.task, right.task))
    if (primary !== 0) return primary
    if (controls.secondaryKey !== 'none') {
      const secondary = applyDirection(controls.secondaryDirection, compareKey(controls.secondaryKey, left.task, right.task))
      if (secondary !== 0) return secondary
    }
    return left.index - right.index
  })
  return indexed.map((entry) => entry.task)
}
