import type { Task, TaskStatus } from '../shared/types.ts'

export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SecondarySortKey = Exclude<SortKey, 'original'> | 'none'
export type SortDirection = 'asc' | 'desc'

export interface SortSettings {
  primary: SortKey
  primaryDirection: SortDirection
  secondary: SecondarySortKey
  secondaryDirection: SortDirection
}

const statusOrder: Record<TaskStatus, number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
}

function compareStrings(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0
}

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function compareByKey(left: Task, right: Task, key: Exclude<SortKey, 'original'>) {
  switch (key) {
    case 'title':
      return compareStrings(normalizeText(left.title), normalizeText(right.title))
    case 'assignee':
      return compareStrings(normalizeText(left.assignee), normalizeText(right.assignee))
    case 'status':
      return statusOrder[left.status] - statusOrder[right.status]
    case 'dueDate':
      // API dates are valid YYYY-MM-DD strings, whose lexical order is chronological.
      return compareStrings(left.dueDate, right.dueDate)
  }
}

function withDirection(result: number, direction: SortDirection) {
  return direction === 'desc' ? -result : result
}

export function sortTasks(tasks: Task[], settings: SortSettings): Task[] {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      // Original order is an explicit mode and ignores every other control.
      if (settings.primary === 'original') return left.index - right.index

      const primaryResult = withDirection(
        compareByKey(left.task, right.task, settings.primary),
        settings.primaryDirection,
      )
      if (primaryResult !== 0) return primaryResult

      if (settings.secondary !== 'none') {
        const secondaryResult = withDirection(
          compareByKey(left.task, right.task, settings.secondary),
          settings.secondaryDirection,
        )
        if (secondaryResult !== 0) return secondaryResult
      }

      return left.index - right.index
    })
    .map(({ task }) => task)
}
