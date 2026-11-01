$code="import type { Task } from "../shared/types.ts"

function normalizeText(s: string): string {
  if (typeof s !== "string") return ""
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("und")
}

function compareText(a: string, b: string): number {
  const na = normalizeText(a)
  const nb = normalizeText(b)
  return na < nb ? -1 : na > nb ? 1 : 0
}

function compareTitle(a: string, b: string): number { return compareText(a, b) }
function compareAssignee(a: string, b: string): number { return compareText(a, b) }
function compareStatus(a: string, b: string): number {
  const order = { todo: 0, in_progress: 1, done: 2 }
  const oa = order[a] ?? 3
  const ob = order[b] ?? 3
  return oa - ob
}
function compareDateAsc(a: string, b: string): number {
  if (!a && !b) return 0
  if (!a) return -1
  if (!b) return 1
  const da = new Date(a + "T00:00:00Z").getTime()
  const db = new Date(b + "T00:00:00Z").getTime()
  if (isNaN(da) && isNaN(db)) return 0
  if (isNaN(da)) return -1
  if (isNaN(db)) return 1
  return da > db ? 1 : da < db ? -1 : 0
}

export function sortTasks(
  tasks: Task[],
  primaryKey: SortKey,
  primaryDesc: boolean,
  secondaryKey: SortKey,
  secondaryDesc: boolean
): Task[] {
  return tasks.toSorted((a, b) => {
    let cmp = comparePrimaryKey(a, b, primaryKey)
    if (primaryDesc) cmp = -cmp
    if (cmp === 0 && secondaryKey !== "none") {
      cmp = compareSecondaryKey(a, b, secondaryKey)
      if (secondaryDesc) cmp = -cmp
    }
    return cmp
  })
}

function comparePrimaryKey(a: Task, b: Task, key: SortKey): number {
  switch (key) {
    case "original": return 0
    case "title": return compareTitle(a.title, b.title)
    case "assignee": return compareAssignee(a.assignee, b.assignee)
    case "status": return compareStatus(a.status, b.status)
    case "dueDate": return compareDateAsc(a.dueDate, b.dueDate)
  }
}

function compareSecondaryKey(a: Task, b: Task, key: SortKey): number {
  switch (key) {
    case "title": return compareTitle(a.title, b.title)
    case "assignee": return compareAssignee(a.assignee, b.assignee)
    case "status": return compareStatus(a.status, b.status)
    case "dueDate": return compareDateAsc(a.dueDate, b.dueDate)
  }
}

