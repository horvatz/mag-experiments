import type { Task } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondarySortKey = Exclude<SortKey, 'original'> | 'none'
export type SortDirection = 'asc' | 'desc'

export type SortSettings = {
  primaryKey: SortKey
  primaryDirection: SortDirection
  secondaryKey: SecondarySortKey
  secondaryDirection: SortDirection
}

export const DEFAULT_SORT_SETTINGS: SortSettings = {
  primaryKey: 'original',
  primaryDirection: 'asc',
  secondaryKey: 'none',
  secondaryDirection: 'asc',
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function compareKey(left: Task, right: Task, key: Exclude<SortKey, 'original'>): number {
  switch (key) {
    case 'title':
      return compareStrings(normalizeText(left.title), normalizeText(right.title))
    case 'assignee':
      return compareStrings(normalizeText(left.assignee), normalizeText(right.assignee))
    case 'status': {
      const rank = { todo: 0, in_progress: 1, done: 2 }
      return rank[left.status] - rank[right.status]
    }
    case 'dueDate':
      // Valid YYYY-MM-DD strings have the same lexical and chronological order.
      return compareStrings(left.dueDate, right.dueDate)
  }
}

function withDirection(result: number, direction: SortDirection): number {
  return direction === 'desc' ? -result : result
}

export function sortTasks(tasks: readonly Task[], settings: SortSettings): Task[] {
  if (settings.primaryKey === 'original') return [...tasks]

  const primaryKey = settings.primaryKey
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const primary = withDirection(compareKey(left.task, right.task, primaryKey), settings.primaryDirection)
      if (primary !== 0) return primary

      if (settings.secondaryKey !== 'none') {
        const secondary = withDirection(compareKey(left.task, right.task, settings.secondaryKey), settings.secondaryDirection)
        if (secondary !== 0) return secondary
      }

      return left.index - right.index
    })
    .map(({ task }) => task)
}
