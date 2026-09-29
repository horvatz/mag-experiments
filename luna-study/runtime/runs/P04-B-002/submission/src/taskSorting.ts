import type { Task } from '../shared/types.ts'

export type TaskSortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondarySortKey = Exclude<TaskSortKey, 'original'> | 'none'
export type SortDirection = 'asc' | 'desc'

export interface TaskSortSettings {
  primary: TaskSortKey
  primaryDirection: SortDirection
  secondary: SecondarySortKey
  secondaryDirection: SortDirection
}

export const DEFAULT_TASK_SORT: TaskSortSettings = {
  primary: 'original',
  primaryDirection: 'asc',
  secondary: 'none',
  secondaryDirection: 'asc',
}

const statusRank = { todo: 0, in_progress: 1, done: 2 } as const

function compareStrings(left: string, right: string) {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function compareByKey(left: Task, right: Task, key: Exclude<TaskSortKey, 'original'>) {
  switch (key) {
    case 'title': return compareStrings(normalize(left.title), normalize(right.title))
    case 'assignee': return compareStrings(normalize(left.assignee), normalize(right.assignee))
    case 'status': return statusRank[left.status] - statusRank[right.status]
    case 'dueDate': return compareStrings(left.dueDate, right.dueDate)
  }
}

function applyDirection(result: number, direction: SortDirection) {
  return direction === 'desc' ? -result : result
}

export function sortTasks(tasks: Task[], settings: TaskSortSettings): Task[] {
  if (settings.primary === 'original') return tasks
  const primaryKey = settings.primary
  const secondaryKey = settings.secondary

  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const primary = applyDirection(compareByKey(left.task, right.task, primaryKey), settings.primaryDirection)
      if (primary !== 0) return primary

      if (secondaryKey !== 'none') {
        const secondary = applyDirection(compareByKey(left.task, right.task, secondaryKey), settings.secondaryDirection)
        if (secondary !== 0) return secondary
      }

      return left.index - right.index
    })
    .map(({ task }) => task)
}
