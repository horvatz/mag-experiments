import type { Task } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDirection = 'asc' | 'desc'

export interface SortSettings {
  primaryKey: SortKey
  primaryDirection: SortDirection
  secondaryKey: Exclude<SortKey, 'original'> | 'none'
  secondaryDirection: SortDirection
}

const statusRank = { todo: 0, in_progress: 1, done: 2 } as const

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function compareKey(left: Task, right: Task, key: Exclude<SortKey, 'original'>): number {
  switch (key) {
    case 'title':
      return compareStrings(normalize(left.title), normalize(right.title))
    case 'assignee':
      return compareStrings(normalize(left.assignee), normalize(right.assignee))
    case 'status':
      return statusRank[left.status] - statusRank[right.status]
    case 'dueDate':
      // Valid ISO calendar dates sort lexically in chronological order.
      return compareStrings(left.dueDate, right.dueDate)
  }
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function direction(value: number, sortDirection: SortDirection): number {
  return sortDirection === 'desc' ? -value : value
}

export function sortTasks(tasks: readonly Task[], settings: SortSettings): Task[] {
  const primaryKey = settings.primaryKey
  if (primaryKey === 'original') return [...tasks]

  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const primary = direction(compareKey(left.task, right.task, primaryKey), settings.primaryDirection)
      if (primary !== 0) return primary

      if (settings.secondaryKey !== 'none') {
        const secondary = direction(compareKey(left.task, right.task, settings.secondaryKey), settings.secondaryDirection)
        if (secondary !== 0) return secondary
      }

      return left.index - right.index
    })
    .map(({ task }) => task)
}
