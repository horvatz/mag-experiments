export const deadlineGroups = [
  { key: 'overdue', label: 'Zapadlo' },
  { key: 'today', label: 'Danes' },
  { key: 'week', label: 'Naslednjih 7 dni' },
  { key: 'later', label: 'Pozneje' },
  { key: 'done', label: 'Končano' },
] as const

export type DeadlineGroup = typeof deadlineGroups[number]['key']
export type DeadlineFilter = 'all' | DeadlineGroup

const dayMilliseconds = 24 * 60 * 60 * 1000

/** Return a UTC day number for an actual YYYY-MM-DD calendar date. */
export function calendarDay(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const monthLengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month < 1 || month > 12 || day < 1 || day > monthLengths[month - 1]) return null

  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day)
  return Math.floor(date.getTime() / dayMilliseconds)
}

export function deadlineGroup(status: string, dueDate: string, referenceDay: number): DeadlineGroup {
  if (status === 'done') return 'done'
  const dueDay = calendarDay(dueDate)
  // Task data is contractually valid; treating malformed dates as later keeps
  // them out of the date-sensitive groups if an API response violates it.
  if (dueDay === null) return 'later'
  if (dueDay < referenceDay) return 'overdue'
  if (dueDay === referenceDay) return 'today'
  if (dueDay <= referenceDay + 7) return 'week'
  return 'later'
}
