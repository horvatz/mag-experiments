import { useState, useMemo, useCallback } from "react"
import type { Task } from "../shared/types.ts"

const pageSizeMap: Record<string, number> = {
  all: 0,
  2: 2,
  5: 5,
  10: 10,
}

interface PaginationState {
  page: number
  pageSize: "all" | "2" | "5" | "10"
  filter: "all" | "todo" | "in_progress" | "done"
}

export function usePagination(tasks: Task[]): {
  state: PaginationState
  setPage: (p: number) => void
  setPageSize: (s: "all" | "2" | "5" | "10") => void
  setFilter: (f: "all" | "todo" | "in_progress" | "done") => void
  filteredTasks: Task[]
  totalFiltered: number
  totalPages: number
  currentPageSize: number
  tasksOnPage: Task[]
  statusText: string
  isFirstPage: boolean
  isLastPage: boolean
} {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    pageSize: "all",
    filter: "all",
  })

  const filteredTasks = useMemo<Task[]>(() => {
    if (state.filter === "all") return tasks
    return tasks.filter((task) => task.status === state.filter)
  }, [tasks, state.filter])

  const totalFiltered = filteredTasks.length
  const size = pageSizeMap[state.pageSize] || 0
  const currentPageSize = size
  
  const totalPages = totalFiltered > 0 && size > 0 ? Math.ceil(totalFiltered / size) : (state.pageSize === "all" ? 1 : 0)
  const startIndex = (state.page - 1) * currentPageSize
  const endIndex = Math.min(startIndex + currentPageSize, totalFiltered)
  const tasksOnPage = useMemo<Task[]>(() => filteredTasks.slice(startIndex, endIndex), [filteredTasks, startIndex, endIndex])
  
  const isFirstPage = state.page === 1
  const isLastPage = totalPages === 0 || state.page >= totalPages - (state.pageSize === "all" ? 1 : 0)

  const statusText: string = 
    totalFiltered === 0 
      ? "Stran 0 od 0. Prikazano 0–0 od 0." 
      : `Stran ${state.page} od ${totalPages}. Prikazano ${startIndex + 1}–${endIndex} od ${totalFiltered}.`

  const setPage = useCallback((p: number) => {
    if (p >= 1 && p <= totalPages) {
      setState(prev => ({ ...prev, page: p }))
    }
  }, [totalPages])

  const setPageSize = useCallback((size: "all" | "2" | "5" | "10") => {
    setState(prev => ({ ...prev, pageSize: size, page: 1 }))
  }, [])

  const setFilter = useCallback((filter: "all" | "todo" | "in_progress" | "done") => {
    setState(prev => ({ ...prev, filter, page: 1 }))
  }, [])

  return {
    state,
    setPage,
    setPageSize,
    setFilter,
    filteredTasks,
    totalFiltered,
    totalPages,
    currentPageSize,
    tasksOnPage,
    statusText,
    isFirstPage,
    isLastPage,
  }
}
