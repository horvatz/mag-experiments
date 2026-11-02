import type { Task } from "../shared/types.ts"
import type { ViewFilters, ViewOrder, ViewStatus } from "./navigation.ts"

export const defaultViewFilters: ViewFilters = { q: "", status: "all", order: "original" }
export const statusOptions: { value: ViewStatus; label: string }[] = [
  { value: "all", label: "Vse" },
  { value: "todo", label: "Pripravljeno" },
  { value: "in_progress", label: "V delu" },
  { value: "done", label: "Končano" },
]
export const orderOptions: { value: ViewOrder; label: string }[] = [
  { value: "original", label: "Izvorni" },
  { value: "title-asc", label: "Naslov naraščajoče" },
  { value: "title-desc", label: "Naslov padajoče" },
]

export function normalizeText(value: string) {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036F]/gu, "").toLowerCase()
}

export function matchesTask(task: Task, q: string) {
  const query = normalizeText(q)
  if (!query) return true
  return [task.title, task.description, task.assignee, task.id]
    .some((field) => normalizeText(field).includes(query))
}

export function visibleTasks(tasks: Task[], filters: ViewFilters) {
  const filtered = tasks.filter((task) => (
    (filters.status === "all" || task.status === filters.status) && matchesTask(task, filters.q)
  ))
  if (filters.order === "original") return filtered
  const direction = filters.order === "title-asc" ? 1 : -1
  return [...filtered].sort((left, right) => {
    const leftTitle = normalizeText(left.title)
    const rightTitle = normalizeText(right.title)
    if (leftTitle < rightTitle) return -direction
    if (leftTitle > rightTitle) return direction
    return 0
  })
}
