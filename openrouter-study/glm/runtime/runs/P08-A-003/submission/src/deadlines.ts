import type { Task } from '../shared/types.ts'

export const DEFAULT_REFERENCE_DATE = '2026-09-21'

export type DeadlineGroup = 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DeadlineView = 'all' | DeadlineGroup

export type DeadlineCounts = Record<DeadlineGroup, number>

const datePattern = /^\d{4}-\d{2}-\d{2}$/

function parseDateParts(value: string) {
  if (!datePattern.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null
  return { date, year, month, day }
}

export function isValidDateString(value: string) {
  return parseDateParts(value) !== null
}

export function addCalendarDays(value: string, days: number) {
  const parsed = parseDateParts(value)
  if (!parsed) throw new Error('Neveljaven datum YYYY-MM-DD.')
  parsed.date.setUTCDate(parsed.date.getUTCDate() + days)
  const year = String(parsed.date.getUTCFullYear()).padStart(4, '0')
  const month = String(parsed.date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(parsed.date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDeadlineGroup(task: Task, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  if (!isValidDateString(task.dueDate) || !isValidDateString(referenceDate)) return 'later'
  if (task.dueDate < referenceDate) return 'overdue'
  if (task.dueDate === referenceDate) return 'today'
  if (task.dueDate <= addCalendarDays(referenceDate, 7)) return 'week'
  return 'later'
}

export function filterTasksByDeadline(tasks: Task[], referenceDate: string, view: DeadlineView) {
  if (view === 'all') return tasks
  return tasks.filter((task) => getDeadlineGroup(task, referenceDate) === view)
}

export function getDeadlineCounts(tasks: Task[], referenceDate: string): DeadlineCounts {
  const counts: DeadlineCounts = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[getDeadlineGroup(task, referenceDate)] += 1
  return counts
}
