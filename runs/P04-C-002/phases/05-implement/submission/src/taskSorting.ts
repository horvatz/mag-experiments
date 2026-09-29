import type { Task } from '../shared/types.ts'

export type SortKey = 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDirection = 'asc' | 'desc'
export interface SortSettings {
  primary: 'original' | SortKey
  primaryDirection: SortDirection
  secondary: 'none' | SortKey
  secondaryDirection: SortDirection
}

export const defaultSortSettings: Readonly<SortSettings> = {
  primary: 'original', primaryDirection: 'asc', secondary: 'none', secondaryDirection: 'asc',
}

const statusOrder = { todo: 0, in_progress: 1, done: 2 }
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const compare = (a: string | number, b: string | number) => a < b ? -1 : a > b ? 1 : 0
const direction = (value: SortDirection) => value === 'asc' ? 1 : -1

function compareKey(a: Task, b: Task, key: SortKey) {
  if (key === 'status') return compare(statusOrder[a.status], statusOrder[b.status])
  if (key === 'dueDate') return compare(a.dueDate, b.dueDate)
  return compare(normalize(a[key]), normalize(b[key]))
}

export function sortTasks(tasks: readonly Task[], settings: SortSettings): Task[] {
  const { primary, primaryDirection, secondary, secondaryDirection } = settings
  if (primary === 'original') return [...tasks]

  return tasks.map((task, index) => ({ task, index })).sort((a, b) => {
    const first = direction(primaryDirection) * compareKey(a.task, b.task, primary)
    if (first !== 0) return first
    if (secondary !== 'none') {
      const second = direction(secondaryDirection) * compareKey(a.task, b.task, secondary)
      if (second !== 0) return second
    }
    // The input position stays ascending even when either key is descending.
    return a.index - b.index
  }).map(({ task }) => task)
}
