import { useState, useEffect, useMemo } from "react"
import { type Task } from "../shared/types.ts"

interface TaskSortState {
  primary: "original" | "title" | "assignee" | "status" | "dueDate"
  primaryDirection: "asc" | "desc"
  secondary: null | "title" | "assignee" | "status" | "dueDate"
  secondaryDirection: "asc" | "desc"
}

const DEFAULT_SORT: TaskSortState = {
  primary: "original",
  primaryDirection: "asc",
  secondary: null,
  secondaryDirection: "asc"
}

export function useTaskSort(tasks: Task[]) {
  const [sortState, setSortState] = useState<TaskSortState>(DEFAULT_SORT)
  
  const [tasksSorted, setTasksSorted] = useState<Task[]>([])
  
  // R08: persist across local session, refresh keeps state
  // We do NOT persist to localStorage or write to api
  
  useEffect(() => {
    const { primary, primaryDirection, secondary, secondaryDirection } = sortState
    
    let result = [...tasks]
    
    // Apply primary sort
    if (primary === "original") {
      // Already in original order, no sorting needed
    } else if (primary === "status") {
      result = tasks.sort((a, b) => {
        const cmp = compareStatusText(a.status, b.status, primaryDirection)
        return cmp
      })
    } else if (primary === "dueDate") {
      result = tasks.sort((a, b) => {
        const cmp = compareDueDate(a.dueDate, b.dueDate, primaryDirection)
        return cmp
      })
    } else if (primary === "title") {
      result = tasks.sort((a, b) => {
        const cmp = normalizeText(a.title, b.title, primaryDirection)
        return cmp
      })
    } else if (primary === "assignee") {
      result = tasks.sort((a, b) => {
        const cmp = normalizeText(a.assignee, b.assignee, primaryDirection)
        return cmp
      })
    }
    
    // Apply secondary sort only when primary keys are equal (R05)
    if (secondary && secondary !== "none") {
      result = stableSort(result, (a, b) => {
        let cmp: number
        
        if (secondary === "status") {
          cmp = compareStatusText(a.status, b.status, secondaryDirection)
        } else if (secondary === "dueDate") {
          cmp = compareDueDate(a.dueDate, b.dueDate, secondaryDirection)
        } else if (secondary === "title") {
          cmp = normalizeText(a.title, b.title, secondaryDirection)
        } else if (secondary === "assignee") {
          cmp = normalizeText(a.assignee, b.assignee, secondaryDirection)
        } else {
          cmp = 0
        }
        
        return cmp
      })
    }
    
    setTasksSorted(result)
  }, [tasks, sortState])
  
  const setPrimary = (key: TaskSortState["primary"], dir?: "asc" | "desc") => {
    setSortState(prev => ({
      ...prev,
      primary: key,
      primaryDirection: dir ?? prev.primaryDirection
    }))
  }
  
  const setSecondary = (key: TaskSortState["secondary"], dir: "asc" | "desc") => {
    setSortState(prev => ({
      ...prev,
      secondary: key ?? null,
      secondaryDirection: dir ?? "asc"
    }))
  }
  
  const setDirection = (key: "primary" | "secondary", dir: "asc" | "desc") => {
    setSortState(prev => {
      const target = key === "primary" ? "primaryDirection" : "secondaryDirection"
      return { ...prev, [target]: dir }
    })
  }
  
  // R09: reset on project change - called externally
  // R10: reset button functionality
  const resetSort = () => {
    setSortState(DEFAULT_SORT)
  }
  
  return {
    tasksSorted,
    sortState,
    setPrimary,
    setSecondary,
    setDirection,
    resetSort
  }
}

function compareStatusText(a: string, b: string, direction: "asc" | "desc"): number {
  const statusOrder = ["todo", "in_progress", "done"]
  const aIndex = statusOrder.indexOf(a.toLowerCase() as any)
  const bIndex = statusOrder.indexOf(b.toLowerCase() as any)
  const cmp = aIndex === -1 && bIndex === -1 ? 0 : aIndex === -1 ? 1 : bIndex === -1 ? -1 : aIndex - bIndex
  return direction === "desc" ? -cmp : cmp
}

function compareDueDate(a: string, b: string, direction: "asc" | "desc"): number {
  if (!a || !b) return 0
  const cmp = a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  return direction === "desc" ? -cmp : cmp
}

function normalizeText(a: string, b: string, direction: "asc" | "desc"): number {
  const nfa = a.normalize("NFD").replace(/[̀-ͯ]/g, "")
  const nfb = b.normalize("NFD").replace(/[̀-ͯ]/g, "")
  const normalizedA = nfa.toLowerCase()
  const normalizedB = nfb.toLowerCase()
  const cmp = normalizedA < normalizedB ? -1 : normalizedA > normalizedB ? 1 : 0
  return direction === "desc" ? -cmp : cmp
}

function stableSort<T>(items: T[], comparator: (a: T, b: T) => number): T[] {
  const indexed = items.map((item, index) => ({ item, originalIndex: index }))
  indexed.sort((a, b) => {
    const comparison = comparator(a.item, b.item)
    if (comparison !== 0) return comparison
    return a.originalIndex - b.originalIndex
  })
  return indexed.map(({ item }) => item)
}

