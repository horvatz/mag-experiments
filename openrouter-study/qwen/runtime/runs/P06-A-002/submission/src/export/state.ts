import type { Task } from '../../shared/types.ts';

let state: {
  filter: string;
  delimiter: string;
  columns: Set<string>;
  exportId: string;
} | null = null;

export function init() {
  if (!window.__folioExportState) {
    window.__folioExportState = {
      filter: 'all',
      delimiter: ';',
      columns: new Set(['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']),
      exportId: generateExportId()
    };
  }
}

function generateExportId(): string {
  return 'export-' + Math.random().toString(36).substring(2, 10);
}

export function getState() {
  return window.__folioExportState;
}

export function setFilter(filter: string) {
  window.__folioExportState.filter = filter;
  window.__folioExportState.exportId = generateExportId();
}

export function setDelimiter(delimiter: string) {
  window.__folioExportState.delimiter = delimiter;
}

export function setColumns(cols: Set<string>) {
  window.__folioExportState.columns = new Set(cols);
}

export function isExportEnabled(): boolean {
  return window.__folioExportState && window.__folioExportState.columns.size > 0;
}

export function toggleColumn(col: string) {
  const arr = Array.from(window.__folioExportState.columns);
  const set = new Set(arr.includes(col) ? arr.filter(c => c !== col) : arr.concat(col));
  window.__folioExportState.columns = set;
}

export function getExportState() {
  return window.__folioExportState;
}

function escapeFormula(val(value: string): string) {
  if (!value) return value;
  const pattern = /^[	
 ]*[=+\-@]/;
  return pattern.test(value) ? "'" + value : value;
}

function escapeCSVCellValue(value: string, useQuotes: boolean): string {
  if (!value) return '""';
  if (!useQuotes) return value;
  let escaped = value;
  if (pattern.test(escaped)) {
    escaped = "'" + escaped;
  }
  return '"' + escaped.replace(/"/g, '""') + '"';
}

export function generateCSV(
  tasks: Task[],
  selectedColumns: string[],
  filter: string,
  delimiter: string
): string {
  const filtered = filter !== 'all' ? tasks.filter(t => t.status === filter) : tasks;
  
  let csv = 'idprojectId, title, status, assignee, dueDate, description
';
  
  const columnsToExport = [...selectedColumns].filter(c => selectedColumns.includes(c));
  
  for (const task of filtered) {
    const row = columnsToExport.map(col => {
      let val = task[col as keyof Task];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      return escapeFormula(escapeCSVCellValue(String(val ? String(val) : ''), true));
    }).join(delimiter);
    csv += row + '
';
  }
  
  return csv;
}
