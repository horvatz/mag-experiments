import type { Task, TaskStatus } from '../shared/types.ts'

export type PrimaryKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondaryKey = 'none' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDirection = 'asc' | 'desc'

export interface SortSettings {
  primary: PrimaryKey
  primaryDirection: SortDirection
  secondary: SecondaryKey
  secondaryDirection: SortDirection
}

export const defaultSortSettings: SortSettings = {
  primary: 'original',
  primaryDirection: 'asc',
  secondary: 'none',
  secondaryDirection: 'asc',
}

export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

const statusRank: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }

type ComparableKey = Exclude<PrimaryKey, 'original'>

function compareKey(left: Task, right: Task, key: ComparableKey): number {
  if (key === 'title' || key === 'assignee') {
    const a = normalizeText(left[key])
    const b = normalizeText(right[key])
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }
  if (key === 'status') return Math.sign(statusRank[left.status] - statusRank[right.status])
  if (left.dueDate < right.dueDate) return -1
  if (left.dueDate > right.dueDate) return 1
  return 0
}

const directed = (result: number, direction: SortDirection) => (direction === 'desc' ? -result : result)

// Sorting is a pure projection: the input array and its tasks are never changed.
export function sortTasks(tasks: Task[], settings: SortSettings): Task[] {
  if (settings.primary === 'original') return [...tasks]
  const { primary, primaryDirection, secondary, secondaryDirection } = settings
  const decorated = tasks.map((task, index) => ({ task, index }))
  decorated.sort((left, right) => {
    const primaryResult = compareKey(left.task, right.task, primary)
    if (primaryResult !== 0) return directed(primaryResult, primaryDirection)
    if (secondary !== 'none') {
      const secondaryResult = compareKey(left.task, right.task, secondary)
      if (secondaryResult !== 0) return directed(secondaryResult, secondaryDirection)
    }
    return left.index - right.index
  })
  return decorated.map((entry) => entry.task)
}
