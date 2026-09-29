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

const statusRank: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function compare(a: Task, b: Task, key: SortKey) {
  if (key === 'status') return statusRank[a.status] - statusRank[b.status]
  const left = key === 'dueDate' ? a[key] : normalize(a[key])
  const right = key === 'dueDate' ? b[key] : normalize(b[key])
  return left < right ? -1 : left > right ? 1 : 0
}

export function sortTasks(tasks: readonly Task[], settings: TaskSort): Task[] {
  const { primary, primaryDirection, secondary, secondaryDirection } = settings
  if (primary === 'original') return [...tasks]

  // Only key comparisons change direction; original indices always break ties ascending.
  return tasks.map((task, index) => ({ task, index })).sort((a, b) => {
    const first = compare(a.task, b.task, primary) * (primaryDirection === 'asc' ? 1 : -1)
    if (first !== 0) return first
    const second = secondary === 'none' ? 0 : compare(a.task, b.task, secondary) * (secondaryDirection === 'asc' ? 1 : -1)
    return second || a.index - b.index
  }).map(({ task }) => task)
}
