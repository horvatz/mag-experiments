import { useSyncExternalStore } from "react"

export type TaskView = "table" | "board"
export type TaskStatusFilter = "all" | "todo" | "in_progress" | "done"
export type TaskOrder = "original" | "title-asc" | "title-desc"

export interface ViewFilters {
  q: string
  status: TaskStatusFilter
  order: TaskOrder
}

export interface Route {
  projectId: string
  taskId: string | null
  view: TaskView
  filters: ViewFilters
}

export const defaultViewFilters: ViewFilters = { q: "", status: "all", order: "original" }

const statusFilters: TaskStatusFilter[] = ["all", "todo", "in_progress", "done"]
const orders: TaskOrder[] = ["original", "title-asc", "title-desc"]

function isStatusFilter(value: string): value is TaskStatusFilter {
  return statusFilters.includes(value as TaskStatusFilter)
}

function isOrder(value: string): value is TaskOrder {
  return orders.includes(value as TaskOrder)
}

function appendFilters(params: URLSearchParams, filters: ViewFilters) {
  const query = filters.q.trim()
  if (query) params.set("q", query)
  if (filters.status !== "all") params.set("status", filters.status)
  if (filters.order !== "original") params.set("order", filters.order)
}

function routeUrl(projectId: string, taskId: string | null, view: TaskView = "table", filters: ViewFilters = defaultViewFilters) {
  const params = new URLSearchParams()
  if (view === "board") params.set("view", "board")
  appendFilters(params, filters)
  const query = params.toString()
  const taskPath = taskId ? `/tasks/${encodeURIComponent(taskId)}` : ""
  const suffix = query ? `?${query}` : ""
  return `#/projects/${encodeURIComponent(projectId)}${taskPath}${suffix}`
}

export function projectUrl(projectId: string, view: TaskView = "table", filters: ViewFilters = defaultViewFilters) {
  return routeUrl(projectId, null, view, filters)
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = "table", filters: ViewFilters = defaultViewFilters) {
  return routeUrl(projectId, taskId, view, filters)
}

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

function parseFilters(params: URLSearchParams): ViewFilters {
  const status = params.get("status") ?? ""
  const order = params.get("order") ?? ""
  return {
    q: params.get("q") ?? "",
    status: isStatusFilter(status) ? status : "all",
    order: isOrder(order) ? order : "original",
  }
}

export function useRoute(): Route | null {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const queryStart = hash.indexOf("?")
  const path = queryStart === -1 ? hash : hash.slice(0, queryStart)
  const query = queryStart === -1 ? "" : hash.slice(queryStart + 1)
  const params = new URLSearchParams(query)
  const view: TaskView = params.get("view") === "board" ? "board" : "table"
  const filters = parseFilters(params)

  if (!path || path === "#" || path === "#/") {
    return { projectId: "web", taskId: null, view, filters }
  }

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
