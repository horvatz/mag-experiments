import type { Task } from '../shared/types.ts'

export type DeadlineView = 'all' | 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DeadlineGroup = Exclude<DeadlineView, 'all'>

export const defaultReferenceDate = '2026-09-21'

const dateFormat = /^\d{4}-\d{2}-\d{2}$/

export function isValidDate(date: string) {
  if (!dateFormat.test(date)) return false
  const [year, month, day] = date.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
}

export function addDays(date: string, amount: number) {
  const [year, month, day] = date.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day + amount))
  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, '0')}-${String(parsed.getUTCDate()).padStart(2, '0')}`
}

export function getDeadlineGroup(task: Task, referenceDate: string): DeadlineGroup {
  if (task.status === 'done') return 'done'
  if (task.dueDate < referenceDate) return 'overdue'
  if (task.dueDate === referenceDate) return 'today'
  return addDays(referenceDate, 7) >= task.dueDate ? 'week' : 'later'
}

export function filterTasksByDeadline(tasks: Task[], view: DeadlineView, referenceDate: string) {
  return view === 'all' ? tasks : tasks.filter(task => getDeadlineGroup(task, referenceDate) === view)
}

export function countDeadlineGroups(tasks: Task[], referenceDate: string): Record<DeadlineGroup, number> {
  return tasks.reduce<Record<DeadlineGroup, number>>((counts, task) => {
    counts[getDeadlineGroup(task, referenceDate)] += 1
    return counts
  }, { overdue: 0, today: 0, week: 0, later: 0, done: 0 })
}
