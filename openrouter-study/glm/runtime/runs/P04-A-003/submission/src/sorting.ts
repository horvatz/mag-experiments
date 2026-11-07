import type { Task } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondarySortKey = 'none' | Exclude<SortKey, 'original'>
export type SortDirection = 'asc' | 'desc'

export interface SortSettings {
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

const statusOrder = { todo: 0, in_progress: 1, done: 2 }
const directionFactor = { asc: 1, desc: -1 }

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()
}

function compareText(left: string, right: string) {
  const normalizedLeft = normalizeText(left)
  const normalizedRight = normalizeText(right)

  if (normalizedLeft < normalizedRight) return -1
  if (normalizedLeft > normalizedRight) return 1
  return 0
}

function compareKey(left: Task, right: Task, key: SortKey) {
  if (key === 'original') return 0
  if (key === 'status') return statusOrder[left.status] - statusOrder[right.status]
  if (key === 'dueDate') {
    if (left.dueDate < right.dueDate) return -1
    if (left.dueDate > right.dueDate) return 1
    return 0
  }

  return compareText(left[key], right[key])
}

export function sortTasks(tasks: Task[], settings: SortSettings) {
  if (settings.primaryKey === 'original') return tasks

  return tasks
    .map((task, originalIndex) => ({ task, originalIndex }))
    .sort((left, right) => {
      const primary = directionFactor[settings.primaryDirection] * compareKey(left.task, right.task, settings.primaryKey)
      if (primary !== 0) return primary

      if (settings.secondaryKey !== 'none') {
        const secondary = directionFactor[settings.secondaryDirection] * compareKey(left.task, right.task, settings.secondaryKey)
        if (secondary !== 0) return secondary
      }

      return left.originalIndex - right.originalIndex
    })
    .map((entry) => entry.task)
}
