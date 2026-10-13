import type { Task } from '../shared/types.ts'

export type DueDateGroup = 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DueDateFilter = DueDateGroup | 'all'

export const dueGroups: DueDateGroup[] = ['overdue', 'today', 'week', 'later', 'done']

export const dueGroupLabels: Record<DueDateGroup, string> = {
  overdue: 'Zapadlo',
  today: 'Danes',
  week: 'Naslednjih 7 dni',
  later: 'Pozneje',
  done: 'Končano',
}

export const dueFilterOptions: { value: DueDateFilter; label: string }[] = [
  { value: 'all', label: 'Vsi roki' },
  ...dueGroups.map((group) => ({ value: group, label: dueGroupLabels[group] })),
]

const dateString = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseDate(value: string): string | null {
  const match = dateString.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1) return null

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
  return day <= daysInMonth ? value : null
}

function daysFromCivilDate(year: number, month: number, day: number): number {
  const adjustedYear = year - (month <= 2 ? 1 : 0)
  const era = Math.floor(adjustedYear / 400)
  const yearOfEra = adjustedYear - era * 400
  const monthIndex = month <= 2 ? month + 9 : month - 3
  const dayOfYear = Math.floor((153 * monthIndex + 2) / 5) + day - 1
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear
  return era * 146097 + dayOfEra - 719468
}

function civilDateFromDays(days: number): { year: number; month: number; day: number } {
  const daysSinceEpoch = days + 719468
  const era = Math.floor(daysSinceEpoch / 146097)
  const dayOfEra = daysSinceEpoch - era * 146097
  const yearOfEra = Math.floor((dayOfEra - dayOfEra / 1460 + dayOfEra / 36524 - dayOfEra / 146096) / 365)
  const year = yearOfEra + era * 400
  const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100))
  const monthIndex = Math.floor((5 * dayOfYear + 2) / 153)
  const day = dayOfYear - Math.floor((153 * monthIndex + 2) / 5) + 1
  const month = monthIndex < 10 ? monthIndex + 3 : monthIndex - 9
  return { year: year + (month <= 2 ? 1 : 0), month, day }
}

export function addDays(date: string, amount: number): string {
  const parsed = parseDate(date)
  if (!parsed) throw new Error('Neveljaven koledarski datum.')

  const match = dateString.exec(parsed)!
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const result = civilDateFromDays(daysFromCivilDate(year, month, day) + amount)
  return `${String(result.year).padStart(4, '0')}-${String(result.month).padStart(2, '0')}-${String(result.day).padStart(2, '0')}`
}

export function getDueDateGroup(task: Task, referenceDate: string): DueDateGroup {
  if (task.status === 'done') return 'done'

  const dueDate = parseDate(task.dueDate)
  const reference = parseDate(referenceDate)
  if (!dueDate || !reference) return 'later'

  if (dueDate < reference) return 'overdue'
  if (dueDate === reference) return 'today'
  if (dueDate <= addDays(reference, 7)) return 'week'
  return 'later'
}

export function getDueDateCounts(tasks: Task[], referenceDate: string): Record<DueDateGroup, number> {
  return tasks.reduce<Record<DueDateGroup, number>>(
    (counts, task) => {
      counts[getDueDateGroup(task, referenceDate)] += 1
      return counts
    },
    { overdue: 0, today: 0, week: 0, later: 0, done: 0 },
  )
}

export function filterTasksByDueDate(tasks: Task[], filter: DueDateFilter, referenceDate: string): Task[] {
  if (filter === 'all') return tasks
  return tasks.filter((task) => getDueDateGroup(task, referenceDate) === filter)
}
