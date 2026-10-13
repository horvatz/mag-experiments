import { type Task, TaskStatus } from '../../shared/types.ts'

type TaskGroup = 'overdue' | 'today' | 'week' | 'later' | 'done'

export function groupTask(task: Task, referenceDate: string): TaskGroup {
  if (task.status === 'done') {
    return 'done'
  }
  if (!referenceDate) return 'done'
  const date = new Date(`0000-00-00T${referenceDate}T00:00:00Z`)
  const taskDate = new Date(`0000-00-00T${task.dueDate}T00:00:00Z`)
  
  const diffTime = taskDate.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return 'overdue'
  } else if (diffDays === 0) {
    return 'today'
  } else if (diffDays <= 7) {
    return 'week'
  } else {
    return 'later'
  }
}

export function getTaskCounts(tasks: Task[]): Record<TaskGroup, number> {
  const counts = { overdue: 0, today: 0, week: 0, later: 0, done: 0 }
  const doneCount = tasks.filter(t => t.status === 'done').length
  const openTasks = tasks.filter(t => t.status !== 'done')
  
  openTasks.forEach(task => {
    const group = groupTask(task, '')
    counts[group]++
  })
  
  counts['done'] = doneCount
  return counts
}

