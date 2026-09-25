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

function calendarDay(date: string) {
  // Explicit UTC preserves calendar-day differences across local DST changes.
  return Date.parse(`${date}T00:00:00Z`) / 86_400_000
}

export function deadlineGroup(task: Task, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  const days = calendarDay(task.dueDate) - calendarDay(referenceDate)
  if (days < 0) return 'overdue'
  if (days === 0) return 'today'
  return days <= 7 ? 'week' : 'later'
}

export function deadlineOverview(tasks: readonly Task[], referenceDate: string, filter: DeadlineFilter) {
  const counts: Record<DeadlineGroup, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  const visibleTasks: Task[] = []
  for (const task of tasks) {
    const group = deadlineGroup(task, referenceDate)
    counts[group] += 1
    if (filter === 'all' || filter === group) visibleTasks.push(task)
  }
  return { counts, visibleTasks }
}
