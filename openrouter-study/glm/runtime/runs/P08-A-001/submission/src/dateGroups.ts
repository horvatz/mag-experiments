import type { Task } from "../shared/types.ts"

export const REFERENCE_DATE = "2026-09-21"
export type DateGroup = "overdue" | "today" | "week" | "later" | "done"
export type DateGroupView = DateGroup | "all"

const datePattern = /^\d{4}-\d{2}-\d{2}$/

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function daysInMonth(year: number, month: number) {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  if (month === 4 || month === 6 || month === 9 || month === 11) return 30
  return 31
}

export function isValidDate(value: string) {
  if (!datePattern.test(value)) return false
  const [year, month, day] = value.split("-").map(Number)
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)
}

function daysFromCivilDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  const shiftedYear = year - (month <= 2 ? 1 : 0)
  const era = Math.floor(shiftedYear / 400)
  const yearOfEra = shiftedYear - era * 400
  const shiftedMonth = month + (month > 2 ? -3 : 9)
  const dayOfYear = Math.floor((153 * shiftedMonth + 2) / 5) + day - 1
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear
  return era * 146097 + dayOfEra
}

export function calendarDayDifference(start: string, end: string) {
  return daysFromCivilDate(end) - daysFromCivilDate(start)
}

export function getDateGroup(task: Task, referenceDate: string): DateGroup {
  if (task.status === "done") return "done"
  const difference = calendarDayDifference(referenceDate, task.dueDate)
  if (difference < 0) return "overdue"
  if (difference === 0) return "today"
  return difference <= 7 ? "week" : "later"
}

export function getDateCounts(tasks: Task[], referenceDate: string): Record<DateGroup, number> {
  const counts: Record<DateGroup, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[getDateGroup(task, referenceDate)] += 1
  return counts
}

export function filterDateGroup(tasks: Task[], referenceDate: string, group: DateGroupView) {
  if (group === "all") return tasks
  return tasks.filter((task) => getDateGroup(task, referenceDate) === group)
}
