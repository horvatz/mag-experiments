import type { Task, TaskStatus } from "../shared/types.ts"

export type SortKey = "original" | "title" | "assignee" | "status" | "dueDate"
export type SecondarySortKey = "none" | Exclude<SortKey, "original">
export type SortDirection = "asc" | "desc"

export interface SortSettings {
  primaryKey: SortKey
  primaryDirection: SortDirection
  secondaryKey: SecondarySortKey
  secondaryDirection: SortDirection
}

export const defaultSortSettings: SortSettings = {
  primaryKey: "original",
  primaryDirection: "asc",
  secondaryKey: "none",
  secondaryDirection: "asc",
}

const statusOrder: Record<TaskStatus, number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036F]/g, "").toLowerCase()
}

function compareText(left: string, right: string) {
  const normalizedLeft = normalizeText(left)
  const normalizedRight = normalizeText(right)
  return normalizedLeft < normalizedRight ? -1 : normalizedLeft > normalizedRight ? 1 : 0
}

function compareKey(key: SortKey, left: Task, right: Task) {
  switch (key) {
    case "title":
      return compareText(left.title, right.title)
    case "assignee":
      return compareText(left.assignee, right.assignee)
    case "status":
      return statusOrder[left.status] - statusOrder[right.status]
    case "dueDate":
      return left.dueDate < right.dueDate ? -1 : left.dueDate > right.dueDate ? 1 : 0
    case "original":
      return 0
  }
}

export function sortTasks(tasks: Task[], settings: SortSettings) {
  if (settings.primaryKey === "original") return [...tasks]

  return tasks.map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const primary = compareKey(settings.primaryKey, left.task, right.task) *
        (settings.primaryDirection === "asc" ? 1 : -1)
      if (primary !== 0) return primary

      if (settings.secondaryKey !== "none" && settings.secondaryKey !== settings.primaryKey) {
        const secondary = compareKey(settings.secondaryKey, left.task, right.task) *
          (settings.secondaryDirection === "asc" ? 1 : -1)
        if (secondary !== 0) return secondary
      }

      return left.index - right.index
    })
    .map((entry) => entry.task)
}
