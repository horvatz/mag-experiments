import type { Task } from '../shared/types.ts'

export type DueGroup = 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DueFilter = 'all' | DueGroup

export const DUE_GROUPS: DueGroup[] = ['overdue', 'today', 'week', 'later', 'done']

export const GROUP_LABELS: Record<DueGroup, string> = {
  overdue: 'Zapadlo',
  today: 'Danes',
  week: 'Naslednjih 7 dni',
  later: 'Pozneje',
  done: 'Končano',
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function diffDays(from: string, to: string): number {
  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number)
  const [toYear, toMonth, toDay] = to.split('-').map(Number)
  return Math.round((Date.UTC(toYear, toMonth - 1, toDay) - Date.UTC(fromYear, fromMonth - 1, fromDay)) / 86_400_000)
}

export function dueGroup(task: Pick<Task, 'status' | 'dueDate'>, ref: string): DueGroup {
  if (task.status === 'done') return 'done'
  const diff = diffDays(ref, task.dueDate)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 7) return 'week'
  return 'later'
}

export function dueCounts(tasks: Task[], ref: string): Record<DueGroup, number> {
  const counts: Record<DueGroup, number> = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  for (const task of tasks) counts[dueGroup(task, ref)] += 1
  return counts
}

export function visibleTasks(tasks: Task[], filter: DueFilter, ref: string): Task[] {
  if (filter === 'all') return tasks
  return tasks.filter((task) => dueGroup(task, ref) === filter)
}
