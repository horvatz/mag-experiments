// Public API shape; evaluation never imports the candidate's implementation.
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export interface TaskRecord {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  assignee: string
  dueDate: string
}
export interface Snapshot {
  tasks: TaskRecord[]
  saveRequests: number
  pending: number
  nextMode: string
}
