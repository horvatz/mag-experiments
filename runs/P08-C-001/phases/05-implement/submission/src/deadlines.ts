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

export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const timestamp = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
}

function calendarDay(value: string) {
  // Explicit UTC midnight represents a calendar day, without local time or DST.
  return Date.parse(`${value}T00:00:00Z`) / 86_400_000
}

export function deadlineGroup(task: Task, reference: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  const days = calendarDay(task.dueDate) - calendarDay(reference)
  if (days < 0) return 'overdue'
  if (days === 0) return 'today'
  if (days <= 7) return 'week'
  return 'later'
}

export function deadlineOverview(tasks: readonly Task[], reference: string, filter: DeadlineFilter) {
  const counts: Record<DeadlineGroup, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  const visible: Task[] = []
  for (const task of tasks) {
    const group = deadlineGroup(task, reference)
    counts[group] += 1
    if (filter === 'all' || filter === group) visible.push(task)
  }
  return { counts, visible }
}
