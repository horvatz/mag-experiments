import type { Task } from '../shared/types.ts'

export type DueGroup = 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DueView = 'all' | DueGroup

export const dueViews: { value: DueView; label: string }[] = [
  { value: 'all', label: 'Vsi roki' },
  { value: 'overdue', label: 'Zapadlo' },
  { value: 'today', label: 'Danes' },
  { value: 'week', label: 'Naslednjih 7 dni' },
  { value: 'later', label: 'Pozneje' },
  { value: 'done', label: 'Končano' },
]

export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

export function dueGroup(task: Task, referenceDate: string): DueGroup {
  if (task.status === 'done') return 'done'
  if (task.dueDate < referenceDate) return 'overdue'
  if (task.dueDate === referenceDate) return 'today'
  if (task.dueDate <= addDays(referenceDate, 7)) return 'week'
  return 'later'
}

export function dueCounts(tasks: Task[], referenceDate: string): Record<DueGroup, number> {
  const counts: Record<DueGroup, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[dueGroup(task, referenceDate)] += 1
  return counts
}

export function filterByDueView(tasks: Task[], view: DueView, referenceDate: string) {
  return view === 'all' ? tasks : tasks.filter((task) => dueGroup(task, referenceDate) === view)
}
