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
export type DeadlineCounts = Record<DeadlineGroup, number>

// Gregorian day number: no device clock, local time, or DST participates.
export function calendarDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > monthDays[month - 1]) return null
  const previousYear = year - 1
  const beforeYear = 365 * previousYear + Math.floor(previousYear / 4) - Math.floor(previousYear / 100) + Math.floor(previousYear / 400)
  return beforeYear + monthDays.slice(0, month - 1).reduce((sum, days) => sum + days, 0) + day
}

function deadlineGroup(task: Task, referenceDay: number): DeadlineGroup {
  if (task.status === 'done') return 'done'
  // The public API guarantees valid YYYY-MM-DD task dates.
  const daysUntilDue = calendarDay(task.dueDate)! - referenceDay
  if (daysUntilDue < 0) return 'overdue'
  if (daysUntilDue === 0) return 'today'
  if (daysUntilDue <= 7) return 'week'
  return 'later'
}

export function deadlineOverview(tasks: Task[], referenceDay: number, filter: DeadlineFilter) {
  const counts: DeadlineCounts = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  const visibleTasks: Task[] = []
  for (const task of tasks) {
    const group = deadlineGroup(task, referenceDay)
    counts[group] += 1
    if (filter === 'all' || group === filter) visibleTasks.push(task)
  }
  return { counts, visibleTasks }
}
