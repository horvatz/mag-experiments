import type { Task, TaskStatus } from "../shared/types.ts"

export type StatusFilter = TaskStatus | "all"

const combiningMarks = /[\u0300-\u036f]/g

export function normalizeText(value: string) {
  return value.normalize("NFD").replace(combiningMarks, "").toLowerCase()
}

export function filterTasks(
  tasks: Task[],
  query: string,
  status: StatusFilter,
  assignee: string,
) {
  const words = query.trim().split(/\s+/).filter(Boolean).map(normalizeText)
  return tasks.filter((task) => {
    if (status !== "all" && task.status !== status) return false
    if (assignee !== "all" && task.assignee !== assignee) return false
    const haystack = normalizeText([
      task.id,
      task.title,
      task.description,
      task.assignee,
    ].join(" "))
    return words.every((word) => haystack.includes(word))
  })
}
