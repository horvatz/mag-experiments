import type { Task, TaskStatus } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondaryKey = 'none' | Exclude<SortKey, 'original'>
export type Direction = 'asc' | 'desc'

export interface SortState {
  primary: SortKey
  primaryDirection: Direction
  secondary: SecondaryKey
  secondaryDirection: Direction
}

export const defaultSortState: SortState = {
  primary: 'original',
  primaryDirection: 'asc',
  secondary: 'none',
  secondaryDirection: 'asc',
}

const statusRank: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }

export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function compareKey(key: SortKey, left: Task, right: Task): number {
  if (key === 'title' || key === 'assignee') {
    const a = normalize(left[key])
    const b = normalize(right[key])
    return a < b ? -1 : a > b ? 1 : 0
  }
  if (key === 'status') return statusRank[left.status] - statusRank[right.status]
  if (key === 'dueDate') return left.dueDate < right.dueDate ? -1 : left.dueDate > right.dueDate ? 1 : 0
  return 0
}

const factor = (direction: Direction) => (direction === 'desc' ? -1 : 1)

export function sortTasks(tasks: Task[], state: SortState): Task[] {
  if (state.primary === 'original') return [...tasks]
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const primary = factor(state.primaryDirection) * compareKey(state.primary, left.task, right.task)
      if (primary !== 0) return primary
      if (state.secondary !== 'none') {
        const secondary = factor(state.secondaryDirection) * compareKey(state.secondary, left.task, right.task)
        if (secondary !== 0) return secondary
      }
      return left.index - right.index
    })
    .map((entry) => entry.task)
}
