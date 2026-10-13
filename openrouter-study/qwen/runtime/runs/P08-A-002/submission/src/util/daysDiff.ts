export function daysDiff(inputDateStr: string, refDateStr: string): number {
  const inputDate = new Date(inputDateStr)
  const refDate = new Date(refDateStr)
  const diffTime = inputDate.getTime() - refDate.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

export function groupForTask(task: Task, refDate: string): CalendarView {
  const daysDiff = daysDiff(task.dueDate, refDate)
  if (task.status === 'done') return 'done'
  if (daysDiff < 0) return 'overdue'
  if (daysDiff === 0) return 'today'
  if (daysDiff >= 1 && daysDiff <= 7) return 'week'
  return 'later'
}
