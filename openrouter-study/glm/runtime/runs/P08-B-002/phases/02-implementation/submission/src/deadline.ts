import type { Task } from '../shared/types.ts'

export type DeadlineView = 'all' | 'overdue' | 'today' | 'week' | 'later' | 'done'
export type DeadlineGroup = Exclude<DeadlineView, 'all'>

export const initialReferenceDate = '2026-09-21'

function parseDate(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const value = new Date(Date.UTC(2000, 0, 1))
  value.setUTCFullYear(year)
  value.setUTCMonth(month - 1)
  value.setUTCDate(day)
  return { year, month, day, value: value.getTime() }
}

export function isValidDate(date: string) {
  const parsed = parseDate(date)
  if (!parsed) return false
  const dateFromParts = new Date(parsed.value)
  return dateFromParts.getUTCFullYear() === parsed.year
    && dateFromParts.getUTCMonth() === parsed.month - 1
    && dateFromParts.getUTCDate() === parsed.day
}

export function plusDays(date: string, days: number) {
  const parsed = parseDate(date)
  if (!parsed) throw new Error(`Invalid calendar date: ${date}`)
  const result = new Date(parsed.value + days * 86_400_000)
  const year = String(result.getUTCFullYear()).padStart(4, '0')
  const month = String(result.getUTCMonth() + 1).padStart(2, '0')
  const day = String(result.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function deadlineGroup(task: Task, referenceDate: string) {
  if (task.status === 'done') return 'done'
  if (task.dueDate < referenceDate) return 'overdue'
  if (task.dueDate === referenceDate) return 'today'
  return task.dueDate <= plusDays(referenceDate, 7) ? 'week' : 'later'
}
