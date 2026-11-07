import type { Task } from '../shared/types.ts'

export type DueGroup = 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DueFilter = 'all' | DueGroup

export const REFERENCE_DATE = '2026-09-21'
export const DEFAULT_FILTER: DueFilter = 'all'
export const DUE_GROUP_ORDER: DueGroup[] = ['overdue', 'today', 'week', 'later', 'done']

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function isCalendarDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1) return false
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
}

// Calendar-day arithmetic in UTC, so time zones and daylight saving never apply.
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + days))
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`
}

export function dueGroup(task: Task, referenceDate: string): DueGroup {
  if (task.status === 'done') return 'done'
  if (!isCalendarDate(task.dueDate)) return 'later'
  if (task.dueDate < referenceDate) return 'overdue'
  if (task.dueDate === referenceDate) return 'today'
  return task.dueDate <= addDays(referenceDate, 7) ? 'week' : 'later'
}

export function countDueGroups(tasks: Task[], referenceDate: string): Record<DueGroup, number> {
  const counts: Record<DueGroup, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[dueGroup(task, referenceDate)] += 1
  return counts
}

export function filterTasks(tasks: Task[], referenceDate: string, filter: DueFilter): Task[] {
  return filter === 'all' ? tasks : tasks.filter((task) => dueGroup(task, referenceDate) === filter)
}
