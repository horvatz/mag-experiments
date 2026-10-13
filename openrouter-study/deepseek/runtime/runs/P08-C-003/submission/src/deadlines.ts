import type { Task } from '../shared/types.ts'

export const DEFAULT_REFERENCE_DATE = '2026-09-21'
export type DeadlineGroup = 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DeadlineView = 'all' | DeadlineGroup
export const DEADLINE_GROUPS: DeadlineGroup[] = ['overdue', 'today', 'week', 'later', 'done']
export const DEADLINE_VIEWS: DeadlineView[] = ['all', ...DEADLINE_GROUPS]

const DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/

export function isCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const [year, month, day] = value.split("-").map(Number)
  if (month < 1 || month > 12 || day < 1) return false
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function dayNumber(value: string): number {
  const [year, month, day] = value.split("-").map(Number)
  return Math.round(Date.UTC(year, month - 1, day) / 86400000)
}

export function daysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from)
}

export function deadlineGroup(task: Task, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  const diff = daysBetween(referenceDate, task.dueDate)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 7) return 'week'
  return 'later'
}

export function deadlineCounts(tasks: Task[], referenceDate: string): Record<DeadlineGroup, number> {
  const counts: Record<DeadlineGroup, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[deadlineGroup(task, referenceDate)] += 1
  return counts
}

export function filterByDeadline(tasks: Task[], referenceDate: string, view: DeadlineView): Task[] {
  if (view === 'all') return tasks
  return tasks.filter((task) => deadlineGroup(task, referenceDate) === view)
}
