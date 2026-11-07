import { useSyncExternalStore } from "react"
import { buildHash, parseViewParams, type ViewKind, type ViewParams } from "./viewState.ts"

export type TaskView = ViewKind

export type Route = { projectId: string; taskId: string | null; view: TaskView; params: ViewParams }

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

function projectPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}`
}

export function projectUrl(projectId: string, view: TaskView = "table", params?: ViewParams) {
  if (params) return buildHash(projectPath(projectId), view, params)
  return `#${projectPath(projectId)}${view === "board" ? "?view=board" : ""}`
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = "table", params?: ViewParams) {
  const path = `${projectPath(projectId)}/tasks/${encodeURIComponent(taskId)}`
  if (params) return buildHash(path, view, params)
  return `#${path}${view === "board" ? "?view=board" : ""}`
}

export function navigate(hash: string, mode: "push" | "replace" = "push") {
  if (window.location.hash === hash) return
  const url = `${window.location.pathname}${window.location.search}${hash}`
  if (mode === "replace") window.history.replaceState(null, "", url)
  else window.history.pushState(null, "", url)
  window.dispatchEvent(new HashChangeEvent("hashchange"))
}

export function useRoute(): Route | null {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const queryIndex = hash.indexOf("?")
  const path = queryIndex === -1 ? hash : hash.slice(0, queryIndex)
  const query = queryIndex === -1 ? "" : hash.slice(queryIndex + 1)
  const params = parseViewParams(query)
  const view: TaskView = new URLSearchParams(query).get("view") === "board" ? "board" : "table"
  if (!path || path === "#" || path === "#/") return { projectId: "web", taskId: null, view, params }
  const match = path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
  if (!match) return null
  try {
    return { projectId: decodeURIComponent(match[1]), taskId: match[2] ? decodeURIComponent(match[2]) : null, view, params }
  } catch {
    return null
  }
}
