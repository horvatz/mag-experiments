import type { Task } from '../shared/types.ts'

export const DEFAULT_REFERENCE_DATE = '2026-09-21'

export type DueGroup = 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DueView = 'all' | DueGroup

export const dueViewOptions: { value: DueView; label: string }[] = [
  { value: 'all', label: 'Vsi roki' },
  { value: 'overdue', label: 'Zapadlo' },
  { value: 'today', label: 'Danes' },
  { value: 'week', label: 'Naslednjih 7 dni' },
  { value: 'later', label: 'Pozneje' },
  { value: 'done', label: 'Končano' },
]

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function daysInMonth(year: number, month: number) {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return lengths[month - 1]
}

export function calendarDateParts(value: string) {
  const match = datePattern.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null
  return { year, month, day }
}

export function isCalendarDate(value: string) {
  return calendarDateParts(value) !== null
}

export function compareDates(left: string, right: string) {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

export function addDays(value: string, amount: number) {
  const parts = calendarDateParts(value)
  if (!parts) return value
  const { year, month, day } = parts
  const totalDays = day + amount
  let currentYear = year
  let currentMonth = month
  let currentDay = totalDays

  while (currentDay > daysInMonth(currentYear, currentMonth)) {
    currentDay -= daysInMonth(currentYear, currentMonth)
    currentMonth += 1
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear += 1
    }
  }

  while (currentDay < 1) {
    currentMonth -= 1
    if (currentMonth < 1) {
      currentMonth = 12
      currentYear -= 1
    }
    currentDay += daysInMonth(currentYear, currentMonth)
  }

  return [currentYear, currentMonth, currentDay]
    .map((part) => String(part).padStart(2, '0'))
    .join('-')
}

export function taskDueGroup(task: Task, referenceDate: string): DueGroup {
  if (task.status === 'done') return 'done'
  if (compareDates(task.dueDate, referenceDate) < 0) return 'overdue'
  if (compareDates(task.dueDate, referenceDate) === 0) return 'today'
  return compareDates(task.dueDate, addDays(referenceDate, 7)) <= 0 ? 'week' : 'later'
}
