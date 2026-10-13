export type FilterState = {
  search: string
  statusFilter: string
  assigneeFilter: string
}

import { useState, useCallback, useMemo } from 'react'

export function useFilteredTasks(
  tasks: Task[],
  filters: FilterState
): { filteredTasks: Task[], totalCount: number } {
  const normalizedSearch = useCallback((input: string): string => {
    if (!input) return ""
    return input.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  }, [])
  
  const filterTasks = useCallback(() => {
    return tasks.filter(task => {
      const { search, statusFilter, assigneeFilter } = filters
      const combinedText = task.id + " " + task.title + " " + task.description + " " + task.assignee
      const normalizedCombined = normalizedSearch(combinedText)
      
      let searchMatch = true
      if (search.trim() !== "") {
        const words = search.split(/\s+/).filter(w => w.length > 0)
        searchMatch = words.every(word => normalizedCombined.includes(word))
      }
      
      const statusMatch = statusFilter === "all" || task.status === statusFilter
      const assigneeMatch = assigneeFilter === "all" || (task.assignee !== "" && task.assignee === assigneeFilter)
      
      return searchMatch && statusMatch && assigneeMatch
    })
  }, [tasks, filters, normalizedSearch])
  
  const filteredTasks = useMemo(() => filterTasks(), [filterTasks])
  
  return { filteredTasks, totalCount: tasks.length }
}
