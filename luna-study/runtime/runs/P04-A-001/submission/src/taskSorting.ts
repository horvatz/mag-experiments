import type { Task } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondarySortKey = Exclude<SortKey, 'original'> | 'none'
export type SortDirection = 'asc' | 'desc'

export type TaskSortSettings = {
  primaryKey: SortKey
  primaryDirection: SortDirection
  secondaryKey: SecondarySortKey
  secondaryDirection: SortDirection
}

export const defaultTaskSortSettings: TaskSortSettings = {
  primaryKey: 'original',
  primaryDirection: 'asc',
  secondaryKey: 'none',
  secondaryDirection: 'asc',
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function compareStrings(left: string, right: string) {
  const a = normalize(left)
  const b = normalize(right)
  return a < b ? -1 : a > b ? 1 : 0
}

const statusOrder = { todo: 0, in_progress: 1, done: 2 } as const

function compareByKey(key: Exclude<SortKey, 'original'>, left: Task, right: Task) {
  switch (key) {
    case 'title': return compareStrings(left.title, right.title)
    case 'assignee': return compareStrings(left.assignee, right.assignee)
    case 'status': return statusOrder[left.status] - statusOrder[right.status]
    case 'dueDate': return compareStrings(left.dueDate, right.dueDate)
  }
}

function directionMultiplier(direction: SortDirection) {
  return direction === 'asc' ? 1 : -1
}

export function sortTasks(tasks: Task[], settings: TaskSortSettings): Task[] {
  const primaryKey = settings.primaryKey
  if (primaryKey === 'original') return tasks.slice()

  const primaryDirection = directionMultiplier(settings.primaryDirection)
  const secondaryDirection = directionMultiplier(settings.secondaryDirection)
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const primary = compareByKey(primaryKey, left.task, right.task) * primaryDirection
      if (primary !== 0) return primary
      if (settings.secondaryKey !== 'none') {
        const secondary = compareByKey(settings.secondaryKey, left.task, right.task) * secondaryDirection
        if (secondary !== 0) return secondary
      }
      return left.index - right.index
    })
    .map(({ task }) => task)
}
