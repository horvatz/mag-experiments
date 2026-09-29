import type { Task } from '../shared/types.ts'

export type TaskSortKey = 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDirection = 'asc' | 'desc'
export interface SortSettings {
  primary: TaskSortKey | 'original'
  primaryDirection: SortDirection
  secondary: TaskSortKey | 'none'
  secondaryDirection: SortDirection
}

export const defaultSortSettings: Readonly<SortSettings> = {
  primary: 'original',
  primaryDirection: 'asc',
  secondary: 'none',
  secondaryDirection: 'asc',
}

const statusOrder = { todo: 0, in_progress: 1, done: 2 }
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function compareKey(a: Task, b: Task, key: TaskSortKey, direction: SortDirection) {
  // Canonical YYYY-MM-DD strings have the same lexical and chronological order.
  const left = key === 'status' ? statusOrder[a.status] : key === 'dueDate' ? a.dueDate : normalize(a[key])
  const right = key === 'status' ? statusOrder[b.status] : key === 'dueDate' ? b.dueDate : normalize(b[key])
  const result = left < right ? -1 : left > right ? 1 : 0
  return direction === 'desc' ? -result : result
}

export function sortTasks(tasks: readonly Task[], settings: SortSettings): Task[] {
  const { primary, primaryDirection, secondary, secondaryDirection } = settings
  if (primary === 'original') return [...tasks]

  return tasks.map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const first = compareKey(a.task, b.task, primary, primaryDirection)
      const second = first === 0 && secondary !== 'none'
        ? compareKey(a.task, b.task, secondary, secondaryDirection)
        : 0
      // Original indices resolve ties independently of either direction.
      return first || second || a.index - b.index
    })
    .map(({ task }) => task)
}
