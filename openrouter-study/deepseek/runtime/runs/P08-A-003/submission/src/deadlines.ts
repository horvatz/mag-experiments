import type { Task } from '../shared/types.ts'

export const DEFAULT_REFERENCE_DATE = '2026-09-21'

export type DeadlineGroup = 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DeadlineFilter = 'all' | DeadlineGroup

export const DEADLINE_GROUPS: { key: DeadlineGroup; label: string }[] = [
  { key: 'overdue', label: 'Zapadlo' },
  { key: 'today', label: 'Danes' },
  { key: 'week', label: 'Naslednjih 7 dni' },
  { key: 'later', label: 'Pozneje' },
  { key: 'done', label: 'Končano' },
]

const DATE_PATTERN = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/

export function isValidCalendarDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number)
  const result = new Date(Date.UTC(year, month - 1, day + days))
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${result.getUTCFullYear()}-${pad(result.getUTCMonth() + 1)}-${pad(result.getUTCDate())}`
}

export function deadlineGroup(task: Pick<Task, 'status' | 'dueDate'>, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  if (task.dueDate < referenceDate) return 'overdue'
  if (task.dueDate === referenceDate) return 'today'
  if (task.dueDate <= addDays(referenceDate, 7)) return 'week'
  return 'later'
}
