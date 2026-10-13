// src/pagination.ts

export function getPageRange(filteredCount: number, pageSize: number, currentPage: number, all: string): {
  page: number;
  totalPages: number;
  start: number;
  end: number;
  maxPage: number;
} {
  if (filteredCount === 0) return { page: currentPage, totalPages: 0, start: 0, end: 0, maxPage: 0 };

  const pageSizeValid = [all, 2, 5, 10].includes(pageSize);
  const actualSize = pageSizeValid ? pageSize : 10;

  const totalPages = Math.ceil(filteredCount / actualSize);
  const actualPage = Math.min(currentPage, totalPages) || 1;
  const start = (actualPage - 1) * actualSize + 1;
  const end = Math.min(actualPage * actualSize, filteredCount);
  const maxPage = totalPages;

  return { page: actualPage, totalPages, start, end, maxPage };
}

export function isPageBoundaryValid(targetPage: number, totalPages: number): boolean {
  return targetPage >= 1 && targetPage <= totalPages;
}

export function getLastPage(filteredCount: number, pageSize: number, currentPage: number): number {
  if (filteredCount === 0) return 1;
  const totalPages = Math.ceil(filteredCount / pageSize);
  return Math.max(currentPage, totalPages);
}

