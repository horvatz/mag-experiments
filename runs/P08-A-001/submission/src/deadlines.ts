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

// UTC midnights represent calendar days without local time or DST transitions.
export function calendarDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return null
  const timestamp = Date.parse(`${value}T00:00:00Z`)
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) return null
  return timestamp / 86_400_000
}

export function groupDeadlines(tasks: Task[], referenceDate: string): Record<DeadlineGroup, Task[]> {
  const groups: Record<DeadlineGroup, Task[]> = { overdue: [], today: [], week: [], later: [], done: [] }
  // The caller retains the last valid reference date; API dates are valid by contract.
  const referenceDay = calendarDay(referenceDate)!
  for (const task of tasks) {
    if (task.status === 'done') {
      groups.done.push(task)
      continue
    }
    const difference = calendarDay(task.dueDate)! - referenceDay
    const group = difference < 0 ? 'overdue' : difference === 0 ? 'today' : difference <= 7 ? 'week' : 'later'
    groups[group].push(task)
  }
  return groups
}
