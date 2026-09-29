import type { Task, TaskStatus } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondarySortKey = Exclude<SortKey, 'original'> | 'none'
export type SortDirection = 'asc' | 'desc'

export interface TaskSortSettings {
  primaryKey: SortKey
  primaryDirection: SortDirection
  secondaryKey: SecondarySortKey
  secondaryDirection: SortDirection
}

export const DEFAULT_SORT_SETTINGS: TaskSortSettings = {
  primaryKey: 'original',
  primaryDirection: 'asc',
  secondaryKey: 'none',
  secondaryDirection: 'asc',
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function normalizedText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

const statusOrder: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }

function compareKey(a: Task, b: Task, key: Exclude<SortKey, 'original'>): number {
  switch (key) {
    case 'title': return compareText(normalizedText(a.title), normalizedText(b.title))
    case 'assignee': return compareText(normalizedText(a.assignee), normalizedText(b.assignee))
    case 'status': return statusOrder[a.status] - statusOrder[b.status]
    case 'dueDate': return compareText(a.dueDate, b.dueDate)
  }
}

const directionSign = (direction: SortDirection) => direction === 'asc' ? 1 : -1

export function sortTasks<T extends Task>(tasks: readonly T[], settings: TaskSortSettings): T[] {
  const primaryKey = settings.primaryKey
  if (primaryKey === 'original') return [...tasks]

  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const primary = compareKey(a.task, b.task, primaryKey) * directionSign(settings.primaryDirection)
      if (primary !== 0) return primary

      if (settings.secondaryKey !== 'none') {
        const secondary = compareKey(a.task, b.task, settings.secondaryKey) * directionSign(settings.secondaryDirection)
        if (secondary !== 0) return secondary
      }

      return a.index - b.index
    })
    .map(({ task }) => task)
}
