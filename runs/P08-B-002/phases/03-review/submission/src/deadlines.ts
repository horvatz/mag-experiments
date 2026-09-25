import type { Task } from '../shared/types.ts'

export const initialReferenceDate = '2026-09-21'
export const deadlineGroups = [
  { key: 'overdue', label: 'Zapadlo' },
  { key: 'today', label: 'Danes' },
  { key: 'week', label: 'Naslednjih 7 dni' },
  { key: 'later', label: 'Pozneje' },
  { key: 'done', label: 'Končano' },
] as const
export type DeadlineGroup = typeof deadlineGroups[number]['key']
export type DeadlineFilter = 'all' | DeadlineGroup

// UTC midnight gives a calendar-day ordinal without local-time or DST changes.
function calendarDay(value: string) {
  return Date.parse(`${value}T00:00:00Z`) / 86_400_000
}

export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function deadlineGroup(task: Task, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  const difference = calendarDay(task.dueDate) - calendarDay(referenceDate)
  if (difference < 0) return 'overdue'
  if (difference === 0) return 'today'
  return difference <= 7 ? 'week' : 'later'
}
