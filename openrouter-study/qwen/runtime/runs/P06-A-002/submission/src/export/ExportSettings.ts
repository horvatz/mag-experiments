import { useSyncExternalStore } from "react";

export function subscribeExportSettings(updateFn: () => void): () => void {
  window.addEventListener("hashchange", updateFn);
  return () => window.removeEventListener("hashchange", updateFn);
}

export function useExportSettings() {
  const subscribe = () => window.location.hash;
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => window.location.hash);
  const isBoard = hash.includes("view=board");
  return { view: isBoard ? "board" : "table" };
}

export type ExportState = {
  columns: Set<string>;
  delimiter: CsvDelimiter;
  filter: ExportFilter;
};

export function getDefaultExportState(): ExportState {
  return {
    columns: new Set<string>(["id", "projectId", "title", "status", "assignee", "dueDate", "description"]),
    delimiter: DEFAULT_DELIMITER,
    filter: "all", // todo | in_progress | done
  };
}

let globalState: ExportState = getDefaultExportState();

export function resetExportSettings() {
  globalState = getDefaultExportState();
}

export function getExportState(): ExportState {
  return globalState;
}

export function setExportFilter(filter: ExportFilter) {
  globalState.filter = filter;
}

export const EXPORT_FILTERS = ["all", "todo", "in_progress", "done"] as const;
export type ExportFilter = typeof EXPORT_FILTERS[number];
