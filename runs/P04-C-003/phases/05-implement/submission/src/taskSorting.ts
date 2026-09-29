import type { Task } from '../shared/types.ts'

export type SortKey = 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDirection = 'asc' | 'desc'
export interface SortSettings {
  primary: SortKey | 'original'
  primaryDirection: SortDirection
  secondary: SortKey | 'none'
  secondaryDirection: SortDirection
}

export const defaultSortSettings: SortSettings = {
  primary: 'original', primaryDirection: 'asc', secondary: 'none', secondaryDirection: 'asc',
}

const statusRank = { todo: 0, in_progress: 1, done: 2 }
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const compare = (a: string | number, b: string | number) => a < b ? -1 : a > b ? 1 : 0

function compareKey(a: Task, b: Task, key: SortKey, direction: SortDirection) {
  const value = key === 'status'
    ? compare(statusRank[a.status], statusRank[b.status])
    : key === 'dueDate'
      ? compare(a.dueDate, b.dueDate)
      : compare(normalize(a[key]), normalize(b[key]))
  return direction === 'asc' ? value : -value
}

export function sortTasks(tasks: readonly Task[], settings: SortSettings): Task[] {
  const { primary, primaryDirection, secondary, secondaryDirection } = settings
  if (primary === 'original') return [...tasks]
  return tasks.map((task, index) => ({ task, index }))
    .sort((a, b) => compareKey(a.task, b.task, primary, primaryDirection)
      || (secondary === 'none' ? 0 : compareKey(a.task, b.task, secondary, secondaryDirection))
      || a.index - b.index)
    .map(({ task }) => task)
}
