import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from "lucide-react"
import type { Project, Task } from "../shared/types.ts"
import { Avatar, LoadError, Loading, StatusBadge } from "./components.tsx"
import { formatDate } from "./formatDate.ts"
import { projectUrl, taskUrl, useRoute, type TaskView } from "./navigation.ts"
import { TaskBoard } from "./TaskBoard.tsx"
import { TaskDetails } from "./TaskDetails.tsx"
import { useResource } from "./useResource.ts"
import { useCalendarConfig } from "./useCalendarConfig"
import * as dateUtils from "./useCalendarViewUtils"
import "./styles.css"

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView; initialDate: string | null = null; initialStats: CalendarStats | null = null }) {
  const { referenceDate, error: dateError, parseDate } = useCalendarConfig()
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)

  let currentReferenceDate = referenceDate
  if (initialDate) {
    const parsed = parseDate(initialDate)
    currentReferenceDate = parsed || referenceDate
  }

  const errorDisplay = dateError ? "Vnesi veljaven referencni datum" : null
  // ... rest of implementation
}
