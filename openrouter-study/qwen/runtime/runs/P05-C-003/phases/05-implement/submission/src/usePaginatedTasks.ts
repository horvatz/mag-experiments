interface PaginatedStateResult {
  filteredTasks: Task[]
  paginatedTasks: Task[]
  totalPages: number
  currentPage: number
  firstPageIndex: number
  lastIndexPageIndex: number
  totalCount: number
  fromIndex: number
  toIndex: number
  totalItems: number
}

type TaskStatus = "todo" | "in_progress" | "done"
type PageSize = 2 | 5 | 10
type Page = number
type Filter = TaskStatus | "all"

function usePaginatedTasks(tasks: Task[] | null, page: number, pageSize: PageSize, filter: Filter): PaginatedStateResult {
  const filteredTasks = tasks?.filter((task) => {
    if (filter === "all") return true
    return task.status === filter
  }) || []

  const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(filteredTasks.length / pageSize))
  
  const paginatedTasks = pageSize === "all" 
    ? filteredTasks
    : filteredTasks.slice((page - 1) * pageSize, page * pageSize)

  const firstPageIndex = (page - 1) * pageSize + 1
  const lastIndexIndex = Math.min(page * pageSize, filteredTasks.length)

  return {
    filteredTasks,
    paginatedTasks,
    totalPages,
    currentPage: page,
    firstPageIndex,
    lastIndexPageIndex,
    totalCount: tasks?.length || 0,
    fromIndex: firstPageIndex,
    toIndex: lastIndexIndex,
    totalItems: filteredTasks.length,
  }
}

export function usePagination(
  tasks: Task[] | null,
  page: Page,
  pageSize: PageSize,
  filter: Filter
): PaginatedStateResult {
  return usePaginatedTasks(tasks, page, pageSize, filter)
}

export default usePaginatedTasks

