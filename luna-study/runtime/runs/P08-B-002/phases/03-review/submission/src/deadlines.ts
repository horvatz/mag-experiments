import type { Task } from '../shared/types.ts'

export const DEADLINE_GROUPS = ['overdue', 'today', 'week', 'later', 'done'] as const

export type DeadlineGroup = typeof DEADLINE_GROUPS[number]
export type DeadlineFilter = 'all' | DeadlineGroup

export const DEADLINE_LABELS: Record<DeadlineGroup, string> = {
  overdue: 'Zapadlo',
  today: 'Danes',
  week: 'Naslednjih 7 dni',
  later: 'Pozneje',
  done: 'Končano',
}

export function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12) return false
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return day >= 1 && day <= daysInMonth[month - 1]
}

export function addCalendarDays(value: string, days: number): string {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day + days)
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0'))
    .join('-')
}

export function getDeadlineGroup(task: Task, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  if (task.dueDate < referenceDate) return 'overdue'
  if (task.dueDate === referenceDate) return 'today'
  if (task.dueDate <= addCalendarDays(referenceDate, 7)) return 'week'
  return 'later'
}
