export type SortKey = "original" | "title" | "assignee" | "status" | "dueDate"
export type SecondarySortKey = Exclude<SortKey, "original"> | "none"
export type SortDirection = "asc" | "desc"

export interface SortOptions {
  primary: SortKey
  primaryDirection: SortDirection
  secondary: SecondarySortKey
  secondaryDirection: SortDirection
}

export const defaultSortOptions: SortOptions = {
  primary: "original",
  primaryDirection: "asc",
  secondary: "none",
  secondaryDirection: "asc",
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036F]/g, "").toLowerCase()
}

function compareText(left: string, right: string) {
  const normalizedLeft = normalizeText(left)
  const normalizedRight = normalizeText(right)
  if (normalizedLeft < normalizedRight) return -1
  return normalizedLeft > normalizedRight ? 1 : 0
}

function compareStatus(left: string, right: string) {
  const order: Record<string, number> = { todo: 0, in_progress: 1, done: 2 }
  return order[left] - order[right]
}

function compareValue(key: Exclude<SortKey, "original">, left: string, right: string) {
  if (key === "status") return compareStatus(left, right)
  if (key === "dueDate") {
    if (left < right) return -1
    return left > right ? 1 : 0
  }
  return compareText(left, right)
}

function byDirection(direction: SortDirection, value: number) {
  return direction === "asc" ? value : -value
}

export function sortTasks<T extends { title: string; assignee: string; status: string; dueDate: string }>(tasks: T[], options: SortOptions) {
  const primaryKey = options.primary
  if (primaryKey === "original") return [...tasks]

  return [...tasks].sort((left, right) => {
    const primary = byDirection(
      options.primaryDirection,
      compareValue(primaryKey, left[primaryKey], right[primaryKey]),
    )
    if (primary !== 0 || options.secondary === "none" || options.secondary === options.primary) return primary

    return byDirection(
      options.secondaryDirection,
      compareValue(options.secondary, left[options.secondary], right[options.secondary]),
    )
  })
}
