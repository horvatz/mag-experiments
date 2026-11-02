import type { Task, TaskStatus } from "../shared/types.ts"

export type ViewStatus = "all" | TaskStatus
export type ViewOrder = "original" | "title-asc" | "title-desc"
export type ViewParams = { q: string; status: ViewStatus; order: ViewOrder }
export type ViewKind = "table" | "board"

export const DEFAULT_VIEW_PARAMS: ViewParams = { q: "", status: "all", order: "original" }

const STATUS_VALUES: readonly ViewStatus[] = ["all", "todo", "in_progress", "done"]
const ORDER_VALUES: readonly ViewOrder[] = ["original", "title-asc", "title-desc"]

export function parseViewParams(search: string): ViewParams {
  const params = new URLSearchParams(search)
  const status = params.get("status")
  const order = params.get("order")
  return {
    q: params.get("q") ?? "",
    status: STATUS_VALUES.includes(status as ViewStatus) ? (status as ViewStatus) : "all",
    order: ORDER_VALUES.includes(order as ViewOrder) ? (order as ViewOrder) : "original",
  }
}

export function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function matchesQuery(task: Task, q: string) {
  const needle = normalize(q.trim())
  if (!needle) return true
  return [task.title, task.description, task.assignee, task.id].some((field) => normalize(field).includes(needle))
}

function compareTitles(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0
}

export function filterTasks(tasks: Task[], params: ViewParams): Task[] {
  const filtered = tasks.filter((task) =>
    matchesQuery(task, params.q) && (params.status === "all" || task.status === params.status))
  if (params.order === "original") return filtered
  const direction = params.order === "title-asc" ? 1 : -1
  return filtered
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const result = compareTitles(normalize(a.task.title), normalize(b.task.title))
      return result === 0 ? a.index - b.index : result * direction
    })
    .map((entry) => entry.task)
}

export function buildHash(path: string, view: ViewKind, params: ViewParams): string {
  const search = new URLSearchParams()
  if (view === "board") search.set("view", "board")
  const q = params.q.trim()
  if (q) search.set("q", q)
  if (params.status !== "all") search.set("status", params.status)
  if (params.order !== "original") search.set("order", params.order)
  const query = search.toString().replace(/\+/g, "%20")
  return `#${path}${query ? `?${query}` : ""}`
}
