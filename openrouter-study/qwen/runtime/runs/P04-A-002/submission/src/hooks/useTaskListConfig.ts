
export type SortKey = 'original' | 'title' | 'assignee' | 'status' | 'dueDate'
export type SortDir = 'asc' | 'desc'
export type TaskSecondaryOption = 'none' | 'title' | 'assignee' | 'status' | 'dueDate'

export type SortingState = {
  primaryKey: SortKey
  primaryDir: SortDir
  secondaryKey: TaskSecondaryOption
  secondaryDir: SortDir
}
