import { ArrowRight, CalendarDays, Check, Clock, FolderClosed, ListTodo, Columns3, CheckCircle2 } from "lucide-react"
import { formatDate } from "./formatDate"
import { DUE_DATE_GROUPS, DUE_DATE_TEXT, DUE_DATE_STYLE } from "./categorizeDue"
import { getTaskDueGroup } from "./calculateDueGroup"
import type { Project, Task } from "../shared/types"
import { useResource } from "./useResource"
import { taskUrl } from "./navigation"

import { useState, useCallback } from "react"
import type { Task, TaskUpdate, DueDateGroup, DueDateFilter, DueDateConfig } from "./type-defs"

export interface TaskFilter {
  status?: Task["status"]
  dueGroup?: DueDateGroup
}
interface TaskSort { by: "title" | "status" | "dueDate" | "assignee" | "projectId"; direction: "asc" | "desc" }
export function App() {
