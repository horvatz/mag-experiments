export interface ExportState { cols: Set<string>; delim: ';' | ','; filter: 'all' | 'todo' | 'in_progress' | 'done'; }
let state: ExportState | null = null

export function initExp(): void { 
    if (!import.meta.env.SSR && typeof window !== 'undefined' && !window.__folioExpState) {
        window.__folioExpState = { cols: new Set(ID_COLS), delim: ';', filter: 'all' }
    }
}

export function getExpState(): ExportState {
    return state || (window.__folioExpState as ExportState)
}

export function setExpFilter(f: 'all' | 'todo' | 'in_progress' | 'done'): void {
    const s = getExpState()
    s.filter = f
    if (!import.meta.env.SSR && typeof window !== 'undefined') {
        window.__folioExpState = s as any
    }
}

export function setExpDelim(d: ';' | ','): void {
    const s = getExpState()
    s.delim = d
    if (!import.meta.env.SSR && typeof window !== 'undefined') {
        window.__folioExpState = s
    }
}

export function toggleExpCol(col: string): void {
    const s = getExpState()
    const arr = Array.from(s.cols as Set<string>)
    s.cols = new Set(arr.includes(col) ? arr.filter(c => c !== col) : arr.concat(col))
    if (!import.meta.env.SSR && typeof window !== 'undefined') {
        window.__folioExpState = s as any
    }
}

export function isExpEnabled(): boolean {
    return getExpState()?.cols.size > 0
}
import type { Task } from '../../shared/types.ts'

export const ID_COLS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']
export type TaskColumn = typeof ID_COLS[number]

export function filterTasks(tasks: Task[], filter: string): Task[] {
    return filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
}

export function escapeFormula(v: string): string {
    if (!v) return v
    if (/^[	
 ]*[=+\-@]/.test(v)) {
        return "'" + v
    }
    return v
}

export function escapeCell(v: string): string {
    if (!v) return ''
    return '"' + v.replace(/"/g, '""') + '"'
}
