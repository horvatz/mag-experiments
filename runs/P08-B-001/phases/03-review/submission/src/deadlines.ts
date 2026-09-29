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

// Midnight UTC represents a civil day without local timezone or DST offsets.
function calendarDay(value: string) {
  return Date.parse(`${value}T00:00:00.000Z`) / 86_400_000
}

export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const day = calendarDay(value)
  return Number.isFinite(day) && new Date(day * 86_400_000).toISOString().slice(0, 10) === value
}

export function deadlineGroup(task: Task, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  const difference = calendarDay(task.dueDate) - calendarDay(referenceDate)
  if (difference < 0) return 'overdue'
  if (difference === 0) return 'today'
  if (difference <= 7) return 'week'
  return 'later'
}
