import type { Task, TaskStatus } from '../shared/types.ts'

export type SortKey = 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDirection = 'asc' | 'desc'
export interface SortSettings {
  primaryKey: SortKey | 'original'
  primaryDirection: SortDirection
  secondaryKey: SortKey | 'none'
  secondaryDirection: SortDirection
}

export const DEFAULT_SORT: Readonly<SortSettings> = {
  primaryKey: 'original',
  primaryDirection: 'asc',
  secondaryKey: 'none',
  secondaryDirection: 'asc',
}

const statusOrder: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function valueFor(task: Task, key: SortKey): string | number {
  if (key === 'status') return statusOrder[task.status]
  // Valid, fixed-width YYYY-MM-DD values compare chronologically as strings.
  if (key === 'dueDate') return task.dueDate
  return normalize(task[key])
}

function compare(left: string | number, right: string | number, direction: SortDirection) {
  const result = left < right ? -1 : left > right ? 1 : 0
  return direction === 'asc' ? result : -result
}

export function sortTasks(tasks: readonly Task[], settings: Readonly<SortSettings>): Task[] {
  const { primaryKey, primaryDirection, secondaryKey, secondaryDirection } = settings
  if (primaryKey === 'original') return [...tasks]

  return tasks.map((task, index) => ({
    task,
    index,
    primary: valueFor(task, primaryKey),
    secondary: secondaryKey === 'none' ? 0 : valueFor(task, secondaryKey),
  })).sort((left, right) =>
    compare(left.primary, right.primary, primaryDirection)
    || compare(left.secondary, right.secondary, secondaryDirection)
    // Original indices always ascend, independently of either selected direction.
    || left.index - right.index,
  ).map(({ task }) => task)
}
