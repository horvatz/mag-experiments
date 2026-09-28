import type { Task } from '../shared/types.ts'

export const deadlineGroups = ['overdue', 'today', 'week', 'later', 'done'] as const
export type DeadlineGroup = typeof deadlineGroups[number]
export type DeadlineFilter = 'all' | DeadlineGroup

export function isCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3])
  if (year < 1 || month < 1 || month > 12) return false
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const monthLengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return day >= 1 && day <= monthLengths[month - 1]
}

export function addCalendarDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number)
  const shifted = new Date(0)
  shifted.setUTCHours(0, 0, 0, 0)
  shifted.setUTCFullYear(year, month - 1, day + days)
  return `${String(shifted.getUTCFullYear()).padStart(4, '0')}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`
}

export function deadlineGroup(task: Task, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  if (task.dueDate < referenceDate) return 'overdue'
  if (task.dueDate === referenceDate) return 'today'
  if (task.dueDate <= addCalendarDays(referenceDate, 7)) return 'week'
  return 'later'
}

export function filterByDeadline(tasks: Task[], referenceDate: string, filter: DeadlineFilter) {
  return filter === 'all' ? tasks : tasks.filter((task) => deadlineGroup(task, referenceDate) === filter)
}

export function countDeadlineGroups(tasks: Task[], referenceDate: string): Record<DeadlineGroup, number> {
  const counts: Record<DeadlineGroup, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[deadlineGroup(task, referenceDate)]++
  return counts
}
