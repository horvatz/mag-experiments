const fs = require("fs");
import type { Task } from "../shared/types.ts"
export type CsvDelimiter = ";" | ","
export type CsvFilter = "all" | "todo" | "in_progress" | "done"
function exportData(tasks: Task[]): void {
  navigator.clipboard.writeText(generateCSV(tasks))
    .then(() => alert("CSV podatki kopirani!" ))
    .catch(err => console.error("Export napaka:", err))
}

function generateCSV(tasks: Task[]): string { const headers = ["id","projectId","title","status","assignee","dueDate","description"]; const rows = tasks.map(t => { const values: string[] = tasks.map(t => (t[id] ?? "").toString()); return [ values.join(";") ]; }); const csv = [ headers.join(";"), ...rows ].join("\r\n"); return csv; }
export const CSV_DELIMITER_OPTIONS: { value: ";" | ",", label: string }[] = [
  { value: ";", label: "Podpičje" },
  { value: ",", label: "Vezaj" }
];

export const CSV_FILTER_OPTIONS: { value: "all" | "todo" | "in_progress" | "done", label: string }[] = [
  { value: "all", label: "Vse opravila" },
  { value: "todo", label: "Ni opravil" },
  { value: "in_progress", label: "V delu" },
  { value: "done", label: "Končano" }
];

