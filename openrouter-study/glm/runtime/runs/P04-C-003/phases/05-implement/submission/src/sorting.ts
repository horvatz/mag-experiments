import type { Task } from '../shared/types.ts'

export type SortKey = 'title' | 'assignee' | 'status' | 'dueDate'
export type PrimarySortKey = 'original' | SortKey
export type SecondarySortKey = 'none' | SortKey
export type SortDirection = 'asc' | 'desc'
export interface SortingState {
  primary: PrimarySortKey
  primaryDirection: SortDirection
  secondary: SecondarySortKey
  secondaryDirection: SortDirection
}

export const defaultSorting: SortingState = {
  primary: 'original',
  primaryDirection: 'asc',
  secondary: 'none',
  secondaryDirection: 'asc',
}

const statusOrder = { todo: 0, in_progress: 1, done: 2 } as const

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()
}

function compareText(left: string, right: string) {
  const first = normalizeText(left)
  const second = normalizeText(right)
  if (first === second) return 0
  return first < second ? -1 : 1
}

function compareValues(left: Task, right: Task, key: SortKey) {
  if (key === 'title') return compareText(left.title, right.title)
  if (key === 'assignee') return compareText(left.assignee, right.assignee)
  if (key === 'status') return statusOrder[left.status] - statusOrder[right.status]
  if (left.dueDate === right.dueDate) return 0
  return left.dueDate < right.dueDate ? -1 : 1
}

export function sortTasks(tasks: Task[], sorting: SortingState): Task[] {
  const primary = sorting.primary
  if (primary === 'original') return [...tasks]
  const direction = (result: number, ascending: SortDirection) => (
    ascending === 'asc' ? result : -result
  )
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const primaryResult = direction(compareValues(left.task, right.task, primary), sorting.primaryDirection)
      if (primaryResult !== 0) return primaryResult
      if (sorting.secondary !== 'none') {
        const secondary = direction(compareValues(left.task, right.task, sorting.secondary), sorting.secondaryDirection)
        if (secondary !== 0) return secondary
      }
      return left.index - right.index
    })
    .map(({ task }) => task)
}
