import type { Task } from '../shared/types.ts'

export const INITIAL_REFERENCE_DATE = '2026-09-21'
export const deadlineGroups = [
  { key: 'overdue', label: 'Zapadlo' },
  { key: 'today', label: 'Danes' },
  { key: 'week', label: 'Naslednjih 7 dni' },
  { key: 'later', label: 'Pozneje' },
  { key: 'done', label: 'Končano' },
] as const
export type DeadlineGroup = typeof deadlineGroups[number]['key']
export type DeadlineFilter = 'all' | DeadlineGroup

// UTC midnight represents a calendar day without local timezone or DST effects.
function calendarDay(value: string): number {
  return Date.parse(`${value}T00:00:00.000Z`) / 86_400_000
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const timestamp = calendarDay(value) * 86_400_000
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
}

export function deadlineGroup(task: Task, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  const days = calendarDay(task.dueDate) - calendarDay(referenceDate)
  if (days < 0) return 'overdue'
  if (days === 0) return 'today'
  return days <= 7 ? 'week' : 'later'
}

export function deadlineCounts(tasks: Task[], referenceDate: string): Record<DeadlineGroup, number> {
  const counts = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[deadlineGroup(task, referenceDate)] += 1
  return counts
}
