import { useSyncExternalStore } from "react"
import type { TaskStatus } from "../shared/types.ts"

export type TaskView = "table" | "board"
export type ViewStatus = "all" | TaskStatus
export type ViewOrder = "original" | "title-asc" | "title-desc"

export interface ViewFilters {
  q: string
  status: ViewStatus
  order: ViewOrder
}

export interface Route {
  projectId: string
  taskId: string | null
  view: TaskView
  filters: ViewFilters
}

export const defaultFilters: ViewFilters = { q: "", status: "all", order: "original" }
const statuses = new Set<ViewStatus>(["all", "todo", "in_progress", "done"])
const orders = new Set<ViewOrder>(["original", "title-asc", "title-desc"])

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

function viewQuery(view: TaskView, filters: ViewFilters = defaultFilters) {
  const params = new URLSearchParams()
  if (view === "board") params.set("view", "board")
  if (filters.q.trim()) params.set("q", filters.q.trim())
  if (filters.status !== "all") params.set("status", filters.status)
  if (filters.order !== "original") params.set("order", filters.order)
  return params.toString()
}

export function projectUrl(projectId: string, view: TaskView = "table", filters: ViewFilters = defaultFilters) {
  const query = viewQuery(view, filters)
  return `#/projects/${encodeURIComponent(projectId)}${query ? `?${query}` : ""}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = "table", filters: ViewFilters = defaultFilters) {
  return `${projectUrl(projectId, view, filters)}/tasks/${encodeURIComponent(taskId)}`
}

export function useRoute(): Route | null {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const queryIndex = hash.indexOf("?")
  const path = queryIndex === -1 ? hash : hash.slice(0, queryIndex)
  const query = queryIndex === -1 ? "" : hash.slice(queryIndex + 1)
  const params = new URLSearchParams(query)
  const view: TaskView = params.get("view") === "board" ? "board" : "table"
  const status = params.get("status")
  const order = params.get("order")
  const filters: ViewFilters = {
    q: params.get("q") ?? "",
    status: statuses.has(status as ViewStatus) ? status as ViewStatus : "all",
    order: orders.has(order as ViewOrder) ? order as ViewOrder : "original",
  }
  if (!path || path === "#" || path === "#/") return { projectId: "web", taskId: null, view, filters }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return {
      projectId: decodeURIComponent(match[1]),
      taskId: match[2] ? decodeURIComponent(match[2]) : null,
      view,
      filters,
    }
  } catch {
    return null
  }
}
