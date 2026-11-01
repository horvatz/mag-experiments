import type { Task } from '../shared/types';

export type SortPrimaryKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate';
export type SortSecondaryKey = 'none' | 'title' | 'assignee' | 'status' | 'dueDate';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  primaryKey: SortPrimaryKey;
  primaryDirection: SortDirection;
  secondaryKey: SortSecondaryKey;
  secondaryDirection: SortDirection;
}

export interface SortContextType {
  state: SortState;
  setSort: (state: Partial<SortState>) => void;
  resetSort: () => void;
  compareTasks: (a: Task, b: Task, originalOrder: number[]) => number;
  sortedTasks: (tasks: Task[], originalOrder: number[]) => Task[];
}
