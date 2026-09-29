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

/** A calendar day number, independent of the device clock, time zone and DST. */
export function calendarDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const milliseconds = Date.parse(`${value}T00:00:00Z`)
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString().slice(0, 10) !== value) return null
  return milliseconds / 86_400_000
}

/** API dates and the committed reference date must be valid YYYY-MM-DD. */
export function groupTasksByDeadline(tasks: Task[], referenceDate: string): Record<DeadlineGroup, Task[]> {
  const groups: Record<DeadlineGroup, Task[]> = { overdue: [], today: [], week: [], later: [], done: [] }
  const referenceDay = calendarDay(referenceDate)!
  for (const task of tasks) {
    if (task.status === 'done') {
      groups.done.push(task)
      continue
    }
    const days = calendarDay(task.dueDate)! - referenceDay
    const group = days < 0 ? 'overdue' : days === 0 ? 'today' : days <= 7 ? 'week' : 'later'
    groups[group].push(task)
  }
  return groups
}
