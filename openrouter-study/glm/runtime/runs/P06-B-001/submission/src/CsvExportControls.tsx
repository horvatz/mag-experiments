import { useId, useState } from "react"
import { FileDown } from "lucide-react"
import type { Project, Task } from "../shared/types.ts"
import { buildCsv, csvColumns, csvFilters, downloadCsv, filterTasksForCsv, type CsvColumn, type CsvFilter, type CsvSeparator } from "./csvExport.ts"

const filterLabels: Record<CsvFilter, string> = {
  all: "Vse",
  todo: "Pripravljeno",
  in_progress: "V delu",
  done: "Končano",
}

export function CsvExportControls({ project, tasks }: { project: Project; tasks: readonly Task[] }) {
  const controlId = useId()
  const [selectedColumns, setSelectedColumns] = useState<ReadonlySet<CsvColumn>>(() => new Set(csvColumns))
  const [filter, setFilter] = useState<CsvFilter>("all")
  const [separator, setSeparator] = useState<CsvSeparator>(";")
  const projectTasks = tasks.filter((task) => task.projectId === project.id)
  const exportedTasks = filterTasksForCsv(projectTasks, filter)
  const canExport = selectedColumns.size > 0 && exportedTasks.length > 0

  const toggleColumn = (column: CsvColumn, checked: boolean) => {
    setSelectedColumns((current) => {
      const next = new Set(current)
      if (checked) next.add(column)
      else next.delete(column)
      return next
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canExport) return
    downloadCsv("folio-" + project.id + ".csv", buildCsv(projectTasks, { columns: selectedColumns, filter, separator }))
  }

  return <form className="csv-export" onSubmit={handleSubmit}>
    <fieldset>
      <legend>Izvoz CSV</legend>
      <div className="csv-export-layout">
        <div className="csv-column-group">
          <p className="csv-group-label">Stolpci</p>
          <div className="csv-column-grid">
            {csvColumns.map((column) => <label key={column} className="csv-column-label">
              <input
                type="checkbox"
                checked={selectedColumns.has(column)}
                onChange={(event) => toggleColumn(column, event.target.checked)}
                aria-label={"Stolpec " + column}
              />
              <span>{column}</span>
            </label>)}
          </div>
        </div>
        <div className="csv-select-group">
          <label htmlFor={controlId + "-separator"}>Ločilo CSV</label>
          <select id={controlId + "-separator"} value={separator} onChange={(event) => setSeparator(event.target.value as CsvSeparator)}>
            <option value=";">Podpičje</option>
            <option value=",">Vejica</option>
          </select>
          <label htmlFor={controlId + "-filter"}>Filter izvoza</label>
          <select id={controlId + "-filter"} value={filter} onChange={(event) => setFilter(event.target.value as CsvFilter)}>
            {csvFilters.map((option) => <option key={option} value={option}>{filterLabels[option]}</option>)}
          </select>
        </div>
        <button type="submit" className="csv-export-button" disabled={!canExport}>
          <FileDown size={16} aria-hidden="true" />
          Izvozi CSV
        </button>
      </div>
    </fieldset>
  </form>
}
