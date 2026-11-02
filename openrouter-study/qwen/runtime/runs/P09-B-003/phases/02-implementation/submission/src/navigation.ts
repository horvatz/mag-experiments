import { useSyncExternalStore } from "react"

export type TaskView = "table" | "board"

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

export function projectUrl(projectId: string, view: TaskView = "table") {
  return `#/projects/${encodeURIComponent(projectId)}` + (view === "board" ? "?view=board" : "")
}

export function taskUrl(projectId: string, taskId: string, view: TaskView = "table") {
  return `${projectUrl(projectId)}/tasks/${encodeURIComponent(taskId)}` + (view === "board" ? "?view=board" : "")
}

export function getNormalizedQuery(task: { title: string; id: string; description: string; assignee: string }) {
  let q = String(task.title || "")
  q = q.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  return (
    task.title.includes(q) ||
    task.description.includes(q) ||
    task.assignee.toLowerCase().includes(q) ||
    (task.id && task.id.toLowerCase().includes(q))
  )
}

export function parseQueryString(query: string) {
  const params = new URLSearchParams(query)
  const status = params.get("status") as "all" | "todo" | "in_progress" | "done" | null
  return status
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path, query] = hash.split("?")
  const params = new URLSearchParams(query)
  const view: TaskView = params.get("view") === "board" ? "board" : "table"
  
  const projectId = path?.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
    ? decodeURIComponent(path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)[1])
    : null
  
  const taskId = path?.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)
    ? path.match(/^#\/projects\/([^/]+)(?:\/tasks\/([^/]+))?$/)[2]
    : null
  
  const q = params.get("q") || ""
  const qNormalized = q.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  
  const status = params.get("status") as "all" | "todo" | "in_progress" | "done" | null

  if (!projectId) return { projectId: "web", taskId: null, view, status: null }
  
  let initialTasks = []
  if (window.sessionStorage.getItem("view-state-" + projectId)) {
    const state = JSON.parse(window.sessionStorage.getItem("view-state-" + projectId)!)
    initialTasks = state.tasks || []
  }
  
  const tasks = initialTasks.filter(
    (t: { status: string }) => (status === null || status === "all" || t.status === status)
  )
  
  const order = params.get("order") || "original"
  let sortedTasks = [...tasks]
  if (order === "title-asc") {
    sortedTasks.sort((a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }))
  } else if (order === "title-desc") {
    sortedTasks.sort((a: { title: string }, b: { title: string }) => b.title.localeCompare(a.title, undefined, { sensitivity: "base" }))
  }
  
  const filteredTasks = sortedTasks.filter((t: { title: string; description: string; assignee: string; id: string }) => {
    if (!qNormalized) return true
    const nTitle = (t.title || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    const nDesc = (t.description || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    const nAssignee = (t.assignee || "").toLowerCase()
    const nId = (t.id || "").toLowerCase()
    return nTitle.includes(qNormalized) || nDesc.includes(qNormalized) || nAssignee.includes(qNormalized) || nId.includes(qNormalized)
  })
  
  return { projectId, taskId, view, status, q: q, tasks: filteredTasks }
}

