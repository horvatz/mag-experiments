import type { Task, TaskStatus } from '../shared/types.ts'

export type TaskSortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type TaskSortDirection = 'asc' | 'desc'
export type TaskSecondaryKey = 'none' | Exclude<TaskSortKey, 'original'>

export interface TaskSortOptions {
  primaryKey: TaskSortKey
  primaryDirection: TaskSortDirection
  secondaryKey: TaskSecondaryKey
  secondaryDirection: TaskSortDirection
}

const statusOrder: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 }

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function compareText(left: string, right: string) {
  const a = normalizeText(left)
  const b = normalizeText(right)
  return a < b ? -1 : a > b ? 1 : 0
}

function compareKey(left: Task, right: Task, key: Exclude<TaskSortKey, 'original'>) {
  switch (key) {
    case 'title': return compareText(left.title, right.title)
    case 'assignee': return compareText(left.assignee, right.assignee)
    case 'status': return statusOrder[left.status] - statusOrder[right.status]
    case 'dueDate': return left.dueDate < right.dueDate ? -1 : left.dueDate > right.dueDate ? 1 : 0
  }
}

function directionSign(direction: TaskSortDirection) {
  return direction === 'asc' ? 1 : -1
}

export function sortTasks(tasks: Task[], options: TaskSortOptions): Task[] {
  if (options.primaryKey === 'original') return [...tasks]
  const primaryKey = options.primaryKey

  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const primary = compareKey(left.task, right.task, primaryKey) * directionSign(options.primaryDirection)
      if (primary !== 0) return primary

      if (options.secondaryKey !== 'none') {
        const secondary = compareKey(left.task, right.task, options.secondaryKey) * directionSign(options.secondaryDirection)
        if (secondary !== 0) return secondary
      }

      return left.index - right.index
    })
    .map(({ task }) => task)
}
