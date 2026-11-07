import { useState } from "react"
import type { Project, Task } from "../shared/types.ts"
import { buildCsv, downloadCsv, EXPORT_COLUMNS, type CsvSeparator, type ExportColumn, type ExportFilter } from "./csv.ts"

const filters: { value: ExportFilter; label: string }[] = [
  { value: "all", label: "Vsa opravila" },
  { value: "todo", label: "Pripravljeno" },
  { value: "in_progress", label: "V delu" },
  { value: "done", label: "Končano" },
]

export function ExportControls({ project, tasks }: { project: Project; tasks: Task[] }) {
  const [columns, setColumns] = useState<ExportColumn[]>([...EXPORT_COLUMNS])
  const [separator, setSeparator] = useState<CsvSeparator>(";")
  const [filter, setFilter] = useState<ExportFilter>("all")
  const rows = filter === "all" ? tasks : tasks.filter((task) => task.status === filter)
  const enabled = columns.length > 0 && rows.length > 0

  const toggle = (column: ExportColumn, checked: boolean) => {
    setColumns((current) => EXPORT_COLUMNS.filter((entry) => entry === column ? checked : current.includes(entry)))
  }

  return <div className="export-panel">
    <fieldset>
      <legend>Stolpci</legend>
      {EXPORT_COLUMNS.map((column) => <label key={column}>
        <input type="checkbox" aria-label={"Stolpec " + column} checked={columns.includes(column)} onChange={(event) => toggle(column, event.target.checked)} />
        {column}
      </label>)}
    </fieldset>
    <label>Ločilo CSV
      <select aria-label="Ločilo CSV" value={separator} onChange={(event) => setSeparator(event.target.value as CsvSeparator)}>
        <option value=";">;</option>
        <option value=",">,</option>
      </select>
    </label>
    <label>Filter izvoza
      <select aria-label="Filter izvoza" value={filter} onChange={(event) => setFilter(event.target.value as ExportFilter)}>
        {filters.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
      </select>
    </label>
    <button type="button" className="export-button" disabled={!enabled} onClick={() => downloadCsv("folio-" + project.id + ".csv", buildCsv(rows, columns, separator))}>Izvozi CSV</button>
  </div>
}
