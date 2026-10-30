import React from 'react';
import type { Task } from '../../shared/types';

export type CsvDelimiter = ';' | ',';
export type ExportFilter = 'all' | 'todo' | 'in_progress' | 'done';

function initExportState() {
  exportState = {
    columns: new Set(['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description']),
    delimiter: ';',
    filter: 'all',
  };
}

function getExportState() {
  return exportState;
}

function setExportColumns(cols: string[]) {
  exportState.columns = new Set(cols);
}

function setExportDelimiter(delimiter: CsvDelimiter) {
  exportState.delimiter = delimiter;
}

function setExportFilter(filter: ExportFilter) {
  exportState.filter = filter;
}

function toggleExportColumn(col: string) {
  const cols = Array.from(exportState.columns);
  if (cols.includes(col)) {
    exportState.columns = new Set(cols.filter(c => c !== col));
  } else {
    exportState.columns = new Set([...cols, col]);
  }
}

function isExportEnabled(): boolean {
  return exportState.columns.size > 0;
}

let exportState: any = null;
exportState = {};