import type { Task } from '../shared/types.ts'

export type TaskKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondaryKey = 'none' | TaskKey
export type Direction = 'asc' | 'desc'
export type SortSettings = {
  primaryKey: TaskKey
  primaryDirection: Direction
  secondaryKey: SecondaryKey
  secondaryDirection: Direction
}

export const defaultSettings: SortSettings = {
  primaryKey: 'original',
  primaryDirection: 'asc',
  secondaryKey: 'none',
  secondaryDirection: 'asc',
}

export function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()
}

const statusOrder: Record<Task['status'], number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
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
  if (leftYear < rightYear) return -1
  if (leftYear > rightYear) return 1
  if (leftMonth < rightMonth) return -1
  if (leftMonth > rightMonth) return 1
  if (leftDay < rightDay) return -1
  if (leftDay > rightDay) return 1
  return 0
}

function compareKey(task: Task, other: Task, key: TaskKey) {
  if (key === 'original') return 0
  if (key === 'title') return compareText(task.title, other.title)
  if (key === 'assignee') return compareText(task.assignee, other.assignee)
  if (key === 'status') return statusOrder[task.status] - statusOrder[other.status]
  return compareDate(task.dueDate, other.dueDate)
}

export function sortTasks(tasks: Task[], settings: SortSettings) {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const primary = compareKey(left.task, right.task, settings.primaryKey)
      const directedPrimary = settings.primaryDirection === 'desc' ? -primary : primary
      if (settings.primaryKey !== 'original' && directedPrimary !== 0) return directedPrimary
      if (settings.primaryKey === 'original') return left.index - right.index

      const secondary = settings.secondaryKey === 'none' ? 0 : compareKey(left.task, right.task, settings.secondaryKey)
      const directedSecondary = settings.secondaryDirection === 'desc' ? -secondary : secondary
      if (directedSecondary !== 0) return directedSecondary
      return left.index - right.index
    })
    .map((entry) => entry.task)
}
