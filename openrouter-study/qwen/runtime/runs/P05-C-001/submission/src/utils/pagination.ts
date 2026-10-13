// src/utils/pagination.ts

type FilterType = "all" | "todo" | "in_progress" | "done";

export function getPageData<T>(tasks: T[], filteredCount: number, pageSize: number, currentPage: number): Array<{ task: T; index: number; filteredIndex: number }> {
  if (filteredCount === 0) {
    return [];
  }
  
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, filteredCount);
  const selectedTasks = tasks.slice(start, end);
  
  return selectedTasks.map((task, i) => ({
    task,
    index: start + i + 1,
    filteredIndex: i
  }));
}

export function getTotalPages(filteredCount: number, pageSize: number): number {
  return Math.ceil(filteredCount / pageSize) || 0;
}

export function isPageBoundary(currentPage: number, totalPages: number): boolean {
  return currentPage >= 1 && currentPage <= totalPages;
}

export function onPageChange(currentPage: number, totalPages: number, onPageCallback: (page: number) => void) {
  if (!isPageBoundary(currentPage, totalPages)) return;
  onPageCallback(currentPage);
}

export function onSizeChange<T>(
  tasks: T[],
  all: string,
  currentSize: number | string,
  filter: FilterType,
  onPageCallback: (page: number) => void,
  onDataChange: (data: T[]) => void
) {
  const actualSize = [all, 2, 5, 10].includes(currentSize) ? (currentSize === all ? Infinity : currentSize) : 10;
  const filteredTasks = tasks.filter((task) => filter === all ? true : task.status === filter);
  const isFirstPage = (currentPage as number) === 1;
  
  onPageCallback(1);
  onDataChange(filteredTasks);
  return filteredTasks;
}

export function onFilterChange<T>(
  tasks: T[],
  currentSize: number | string,
  filter: FilterType,
  onPageCallback: (page: number) => void,
  onDataChange: (data: T[]) => void
) {
  const isFirstPage = true;
  const actualSize = [all, 2, 5, 10].includes(currentSize) ? (currentSize === all ? Infinity : currentSize) : 10;
  const filteredTasks = tasks.filter((task) => filter === all ? true : task.status === filter);
  
  onPageCallback(1);
  onDataChange(filteredTasks);
  return filteredTasks;
}

