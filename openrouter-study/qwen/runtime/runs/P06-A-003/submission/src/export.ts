
export type ColumnId = 'id' | 'projectId' | 'title' | 'status' | 'assignee' | 'dueDate' | 'description'
export type Separator = ';' | ','

export interface ExportSettings {
  columns: ColumnId[]
  separator: Separator
  filter: 'all' | 'todo' | 'in_progress' | 'done'
}

import "./funcs.ts"
export { useExportState }
