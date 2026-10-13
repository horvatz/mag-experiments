import type { Task } from '../shared/types.ts'

export const REFERENCE_DATE = '2026-09-21'
export const WEEK_LENGTH = 7

export type DeadlineGroup = 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DeadlineFilter = 'all' | DeadlineGroup

export const DEADLINE_GROUPS: DeadlineGroup[] = ['overdue', 'today', 'week', 'later', 'done']
export const DEADLINE_FILTERS: DeadlineFilter[] = ['all', ...DEADLINE_GROUPS]
export const DEADLINE_LABELS: Record<DeadlineFilter, string> = {
  all: 'Vsi roki',
  overdue: 'Zapadlo',
  today: 'Danes',
  week: 'Naslednjih 7 dni',
  later: 'Pozneje',
  done: 'Končano',
}

const MS_PER_DAY = 86_400_000

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

// Calendar day number for a YYYY-MM-DD value, independent of time zone and DST.
export function parseCalendarDate(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null
  return Date.UTC(year, month - 1, day) / MS_PER_DAY
}

export function classifyTask(task: Task, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  const due = parseCalendarDate(task.dueDate)
  const reference = parseCalendarDate(referenceDate)
  if (due === null || reference === null) return 'later'
  if (due < reference) return 'overdue'
  if (due === reference) return 'today'
  if (due <= reference + WEEK_LENGTH) return 'week'
  return 'later'
}

export function countGroups(tasks: Task[], referenceDate: string): Record<DeadlineGroup, number> {
  const counts: Record<DeadlineGroup, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[classifyTask(task, referenceDate)] += 1
  return counts
}

export function filterTasks(tasks: Task[], referenceDate: string, filter: DeadlineFilter): Task[] {
  if (filter === 'all') return tasks
  return tasks.filter((task) => classifyTask(task, referenceDate) === filter)
}
