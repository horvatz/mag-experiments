import type { Task, TaskStatus } from '../shared/types.ts'

export type SortKey = 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDirection = 'asc' | 'desc'
export interface TaskSort {
  primary: SortKey | 'original'
  primaryDirection: SortDirection
  secondary: SortKey | 'none'
  secondaryDirection: SortDirection
}

export const defaultTaskSort: TaskSort = {
  primary: 'original',
  primaryDirection: 'asc',
  secondary: 'none',
  secondaryDirection: 'asc',
}

const statusOrder: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function compareKey(a: Task, b: Task, key: SortKey, direction: SortDirection) {
  // Fixed-width valid YYYY-MM-DD strings have the same lexical and calendar order.
  const left = key === 'status' ? statusOrder[a.status] : key === 'dueDate' ? a.dueDate : normalize(a[key])
  const right = key === 'status' ? statusOrder[b.status] : key === 'dueDate' ? b.dueDate : normalize(b[key])
  const comparison = left < right ? -1 : left > right ? 1 : 0
  return direction === 'desc' ? -comparison : comparison
}

export function sortTasks(tasks: readonly Task[], sort: TaskSort): Task[] {
  const primary = sort.primary
  if (primary === 'original') return [...tasks]
  return tasks.map((task, index) => ({ task, index })).sort((a, b) => {
    const comparison = compareKey(a.task, b.task, primary, sort.primaryDirection)
    const secondary = comparison === 0 && sort.secondary !== 'none'
      ? compareKey(a.task, b.task, sort.secondary, sort.secondaryDirection)
      : 0
    return comparison || secondary || a.index - b.index
  }).map(({ task }) => task)
}
