import type { Task, TaskStatus } from '../shared/types.ts'

export type StatusFilter = 'all' | TaskStatus

export interface TaskFilterValues {
  search: string
  statusFilter: StatusFilter
  assigneeFilter: string
}

const combiningMarks = /[\u0300-\u036F]/g

export function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(combiningMarks, '').toLowerCase()
}

export function searchTerms(search: string) {
  return search.trim().split(/\s+/).filter((term) => term.length > 0).map(normalizeSearch)
}

export function assigneeOptions(tasks: Task[]) {
  const assignees = [...new Set(tasks.map((task) => task.assignee).filter((assignee) => assignee.length > 0))]
  return ['all', ...assignees]
}

export function filterTasks(tasks: Task[], values: TaskFilterValues) {
  const terms = searchTerms(values.search)
  return tasks.filter((task) => {
    const matchesStatus = values.statusFilter === 'all' || task.status === values.statusFilter
    const matchesAssignee = values.assigneeFilter === 'all' || task.assignee === values.assigneeFilter
    if (!matchesStatus || !matchesAssignee) return false
    if (terms.length === 0) return true
    const combinedFields = normalizeSearch([task.id, task.title, task.description, task.assignee].join(' '))
    return terms.every((term) => combinedFields.includes(term))
  })
}
