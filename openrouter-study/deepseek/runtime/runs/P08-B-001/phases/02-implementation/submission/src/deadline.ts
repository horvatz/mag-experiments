import type { Task } from '../shared/types.ts'

export const REFERENCE_DATE = '2026-09-21'

export type DeadlineBucket = 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DeadlineView = 'all' | DeadlineBucket

export const DEADLINE_BUCKETS: { key: DeadlineBucket; label: string }[] = [
  { key: 'overdue', label: 'Zapadlo' },
  { key: 'today', label: 'Danes' },
  { key: 'week', label: 'Naslednjih 7 dni' },
  { key: 'later', label: 'Pozneje' },
  { key: 'done', label: 'Končano' },
]

export function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function addDays(value: string, days: number): string {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export function bucketOf(task: Task, reference: string): DeadlineBucket {
  if (task.status === 'done') return 'done'
  if (task.dueDate < reference) return 'overdue'
  if (task.dueDate === reference) return 'today'
  if (task.dueDate <= addDays(reference, 7)) return 'week'
  return 'later'
}

export function countByBucket(tasks: Task[], reference: string): Record<DeadlineBucket, number> {
  const counts: Record<DeadlineBucket, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[bucketOf(task, reference)] += 1
  return counts
}

export function filterByView(tasks: Task[], reference: string, view: DeadlineView): Task[] {
  if (view === 'all') return tasks
  return tasks.filter((task) => bucketOf(task, reference) === view)
}
