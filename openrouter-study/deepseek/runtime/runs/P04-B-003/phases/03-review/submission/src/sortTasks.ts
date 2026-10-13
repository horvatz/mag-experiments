import type { Task } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondarySortKey = 'none' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDirection = 'asc' | 'desc'

export type SortSettings = {
  primaryKey: SortKey
  primaryDirection: SortDirection
  secondaryKey: SecondarySortKey
  secondaryDirection: SortDirection
}

export const defaultSortSettings: SortSettings = {
  primaryKey: 'original',
  primaryDirection: 'asc',
  secondaryKey: 'none',
  secondaryDirection: 'asc',
}

const statusRank: Record<Task['status'], number> = { todo: 0, in_progress: 1, done: 2 }

export function normalizeSortText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function sortValue(task: Task, key: Exclude<SecondarySortKey, 'none'>): string | number {
  switch (key) {
    case 'title': return normalizeSortText(task.title)
    case 'assignee': return normalizeSortText(task.assignee)
    case 'status': return statusRank[task.status]
    case 'dueDate': return task.dueDate
  }
}

function compareValues(a: string | number, b: string | number): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function directionFactor(direction: SortDirection): number {
  return direction === 'desc' ? -1 : 1
}

export function compareTasks(a: Task, b: Task, settings: SortSettings): number {
  if (settings.primaryKey !== 'original') {
    const primary = directionFactor(settings.primaryDirection)
      * compareValues(sortValue(a, settings.primaryKey), sortValue(b, settings.primaryKey))
    if (primary !== 0) return primary
  }
  if (settings.secondaryKey !== 'none') {
    const secondary = directionFactor(settings.secondaryDirection)
      * compareValues(sortValue(a, settings.secondaryKey), sortValue(b, settings.secondaryKey))
    if (secondary !== 0) return secondary
  }
  return 0
}

export function sortTasks(tasks: Task[], settings: SortSettings): Task[] {
  if (settings.primaryKey === 'original') return [...tasks]
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => compareTasks(a.task, b.task, settings) || a.index - b.index)
    .map((entry) => entry.task)
}
