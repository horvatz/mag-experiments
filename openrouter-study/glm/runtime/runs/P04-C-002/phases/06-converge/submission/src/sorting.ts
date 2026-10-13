import type { Task } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondarySortKey = 'none' | Exclude<SortKey, 'original'>
export type SortDirection = 'asc' | 'desc'

export interface SortingState {
  primary: SortKey
  primaryDirection: SortDirection
  secondary: SecondarySortKey
  secondaryDirection: SortDirection
}

export const defaultSortingState: SortingState = {
  primary: 'original',
  primaryDirection: 'asc',
  secondary: 'none',
  secondaryDirection: 'asc',
}

const statusOrder: Record<Task['status'], number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
}

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()
}

function compareValues(key: Exclude<SecondarySortKey, 'none'>, left: Task, right: Task) {
  if (key === 'title' || key === 'assignee') {
    const leftValue = normalizeText(left[key])
    const rightValue = normalizeText(right[key])
    return leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0
  }
  if (key === 'status') return statusOrder[left.status] - statusOrder[right.status]
  const [leftYear, leftMonth, leftDay] = left.dueDate.split('-')
  const [rightYear, rightMonth, rightDay] = right.dueDate.split('-')
  if (leftYear !== rightYear) return leftYear < rightYear ? -1 : 1
  if (leftMonth !== rightMonth) return leftMonth < rightMonth ? -1 : 1
  if (leftDay !== rightDay) return leftDay < rightDay ? -1 : 1
  return 0
}

function directedResult(result: number, direction: SortDirection) {
  return result * (direction === 'desc' ? -1 : 1)
}

export function sortTasks(tasks: Task[], state: SortingState): Task[] {
  if (state.primary === 'original') return [...tasks]
  const primary = state.primary as Exclude<SortKey, 'original'>
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const primaryResult = directedResult(compareValues(primary, left.task, right.task), state.primaryDirection)
      if (primaryResult !== 0) return primaryResult
      if (state.secondary !== 'none') {
        const secondary = directedResult(compareValues(state.secondary, left.task, right.task), state.secondaryDirection)
        if (secondary !== 0) return secondary
      }
      return left.index - right.index
    })
    .map(entry => entry.task)
}
