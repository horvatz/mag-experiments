import type { Task } from "../shared/types.ts"
import { defaultViewFilters, type ViewFilters } from "./navigation.ts"

export const taskStatusFilterOptions = [
  { value: "all", label: "all" },
  { value: "todo", label: "todo" },
  { value: "in_progress", label: "in_progress" },
  { value: "done", label: "done" },
] as const

export const taskOrderOptions = [
  { value: "original", label: "original" },
  { value: "title-asc", label: "title-asc" },
  { value: "title-desc", label: "title-desc" },
] as const

export function normalizeText(value: string) {
  return value
    .trim()
    .normalize("NFD")
.replace(/[\u0300-\u036F]/g, "")
    .toLowerCase()
}

export function cleanViewFilters(filters: ViewFilters): ViewFilters {
  return { ...filters, q: filters.q.trim() }
}

export function isDefaultViewFilters(filters: ViewFilters) {
  const clean = cleanViewFilters(filters)
  return clean.q === defaultViewFilters.q && clean.status === defaultViewFilters.status && clean.order === defaultViewFilters.order
}

export function filterTasks(tasks: Task[], filters: ViewFilters) {
  const query = normalizeText(filters.q)
  const matching = tasks.filter((task) => {
    const statusMatches = filters.status === "all" || task.status === filters.status
    const queryMatches = query === "" || [task.title, task.description, task.assignee, task.id]
      .some((field) => normalizeText(field).includes(query))
    return statusMatches && queryMatches
  })

  if (filters.order === "original") return matching

  const direction = filters.order === "title-asc" ? -1 : 1
  return matching
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const leftTitle = normalizeText(left.task.title)
      const rightTitle = normalizeText(right.task.title)
      if (leftTitle < rightTitle) return direction
      if (leftTitle > rightTitle) return -direction
      return left.index - right.index
    })
    .map((entry) => entry.task)
}
