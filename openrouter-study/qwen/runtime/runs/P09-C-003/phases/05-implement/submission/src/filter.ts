/**
 * Normalize search query: trim, NFD, remove combining marks U+0300-U+036F, lowercase
 * R02: Search query normalization
 */
export function normalizeQuery(q: string): string {
  if (!q) return '';
  const trimmed = q.trim();
  return trimmed.normalize('NFD').replace(/[^p{Letter}p{Number}]/gu, '').toLowerCase();
}

/**
 * Build query filter: combine q and status with AND logic
 * R03: Combined with q using logical AND (both must match)
 */
export function buildQuery(params: { q?: string; status?: string }): { q: string; status: string } {
  const q = normalizeQuery(params.q || '');
  const status = (params.status || 'all').toLowerCase();
  return { q, status };
}

export function normalizeTitleForSorting(title: string): string {
  return normalizeQuery(title);
}

interface Task {
  id: string;
  title: string;
  status: string;
  // ... other fields
}

/**
 * Sort tasks by original order or by title (asc/desc)
 * R03: order options: original, title-asc, title-desc
 */
export function getSortedTasks(tasks: Task[], order: 'original' | 'title-asc' | 'title-desc'): Task[] {
  if (!tasks || !tasks.length) return [];
  if (order === 'original') return [...tasks];
  return [...tasks].sort((a, b) => {
    const normA = normalizeTitleForSorting(a.title);
    const normB = normalizeTitleForSorting(b.title);
    if (normA < normB) return order === 'title-asc' ? -1 : 1;
    if (normA > normB) return order === 'title-asc' ? 1 : -1;
    return 0;
  });
}

export function filterTasks(tasks: Task[], { q, status }: { q: string; status: string }): Task[] {
  if (!q) return tasks;
  const normalizedQ = normalizeQuery(q);
  const filtered = tasks.filter(task => {
    const titleMatch = task.title.toLowerCase().includes(normalizedQ);
    const descMatch = task.description.toLowerCase().includes(normalizedQ);
    const assigneeMatch = task.assignee.toLowerCase().includes(normalizedQ);
    const statusMatch = task.status === status;
    return (titleMatch || descMatch || assigneeMatch) && statusMatch;
  });
  return filtered;
}
