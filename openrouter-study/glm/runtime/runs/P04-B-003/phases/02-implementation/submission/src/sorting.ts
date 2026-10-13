import type { Task, TaskStatus } from '../shared/types.ts'

export type PrimaryKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondaryKey = 'none' | 'title' | 'assignee' | 'status' | 'dueDate'
export type Direction = 'asc' | 'desc'

export interface SortState {
  primary: PrimaryKey
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

const statusOrder: Record<TaskStatus, number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
}

export function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()
}

function compareText(left: string, right: string) {
  const normalizedLeft = normalizeText(left)
  const normalizedRight = normalizeText(right)
  if (normalizedLeft < normalizedRight) return -1
  if (normalizedLeft > normalizedRight) return 1
  return 0
}

function compareDate(left: string, right: string) {
  const [leftYear, leftMonth, leftDay] = left.split('-').map(Number)
  const [rightYear, rightMonth, rightDay] = right.split('-').map(Number)
  if (leftYear !== rightYear) return leftYear - rightYear
  if (leftMonth !== rightMonth) return leftMonth - rightMonth
  return leftDay - rightDay
}

function compareField(task: Task, otherTask: Task, key: 'title' | 'assignee' | 'status' | 'dueDate') {
  if (key === 'status') return statusOrder[task.status] - statusOrder[otherTask.status]
  if (key === 'dueDate') return compareDate(task.dueDate, otherTask.dueDate)
  return compareText(task[key], otherTask[key])
}

function reverse(result: number, direction: Direction) {
  return direction === 'desc' ? -result : result
}

export function sortTasks(tasks: Task[], state: SortState) {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      if (state.primary === 'original') return left.index - right.index

      const primaryResult = reverse(compareField(left.task, right.task, state.primary), state.primaryDirection)
      if (primaryResult !== 0) return primaryResult

      if (state.secondary !== 'none') {
        const secondaryResult = reverse(compareField(left.task, right.task, state.secondary), state.secondaryDirection)
        if (secondaryResult !== 0) return secondaryResult
      }

      return left.index - right.index
    })
    .map((entry) => entry.task)
}
