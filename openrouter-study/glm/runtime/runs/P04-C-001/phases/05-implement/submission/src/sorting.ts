import type { Task } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SortOrder = 'asc' | 'desc'
export type SortSecondaryKey = 'none' | Exclude<SortKey, 'original'>
export type SortSettings = {
  primaryKey: SortKey
  primaryOrder: SortOrder
  secondaryKey: SortSecondaryKey
  secondaryOrder: SortOrder
}

export const defaultSortSettings: SortSettings = {
  primaryKey: 'original',
  primaryOrder: 'asc',
  secondaryKey: 'none',
  secondaryOrder: 'asc',
}

const statusOrder = { todo: 0, in_progress: 1, done: 2 } as const

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, "")
    .toLowerCase()
}

function compareStrings(left: string, right: string) {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

function compareTaskValues(left: Task, right: Task, key: SortKey) {
  if (key === 'original') return 0
  if (key === 'status') return statusOrder[left.status] - statusOrder[right.status]
  if (key === 'dueDate') return compareStrings(left.dueDate, right.dueDate)
  return compareStrings(normalize(left[key]), normalize(right[key]))
}

export function sortTasks(tasks: Task[], settings: SortSettings) {
  const { primaryKey, primaryOrder, secondaryKey, secondaryOrder } = settings
  if (primaryKey === 'original') return [...tasks]

  const direction = primaryOrder === 'desc' ? -1 : 1
  const secondaryDirection = secondaryOrder === 'desc' ? -1 : 1
  const useSecondary = secondaryKey !== 'none' && secondaryKey !== primaryKey

  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const primary = direction * compareTaskValues(left.task, right.task, primaryKey)
      if (primary !== 0 || !useSecondary) return primary
      const secondary = secondaryDirection * compareTaskValues(left.task, right.task, secondaryKey)
      return secondary !== 0 ? secondary : left.index - right.index
    })
    .map((entry) => entry.task)
}
