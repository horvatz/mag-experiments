
import type { Task } from "../shared/types.ts"

export function ExportDialog({ tasks, projectId, onClose }: { tasks: readonly Task[], projectId: string, onClose: () => void }) {
  const [settings, setSettings] = useState({
    columns: [...DEFAULT_COLUMNS],
    separator: ";",
    filter: "all"
  })

  const handleCheckbox = (col: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      columns: checked
        ? [...prev.columns, col as any]
        : prev.columns.filter(c => c !== col)
    }))
  }

  const handleSeparator = (sep: Separator) => {
    setSettings(prev => ({ ...prev, separator: sep }))
  }

  const handleFilter = (flt: "all" | "todo" | "in_progress" | "done") => {
    setSettings(prev => ({ ...prev, filter: flt }))
  }

  const getFiltered = () => {
    return settings.filter === "all"
      ? tasks
      : tasks.filter(t => t.status === settings.filter)
  }

  const handleDownload = () => {
    const filtered = getFiltered()
    const bom = "\uFEFF"
    const headers = DEFAULT_COLUMNS.map(c => """ + c.replace(/"/g, """) + """)
    const rows = [headers.join(settings.separator)]

    for (const task of filtered) {
      rows.push(
        DEFAULT_COLUMNS.map(c => {
          const val = String(task[c] || "")
          const escaped = val.replace(/"/g, """)
          return """ + escaped + """
        }).join(settings.separator)
      )
    }

    csvContent = rows.join("\r\n") + "\r\n"
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "folio-" + projectId + ".csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="export-overlay">
      <div className="export-dialog">
        <h2>Izvozi CSV</h2>
        <div className="export-section">
          <label>Stolpci</label>
          {DEFAULT_COLUMNS.map(col => (
            <div key={col} className="checkbox-row">
              <input type="checkbox" id={col} checked={settings.columns.includes(col)} onChange={(e) => handleCheckbox(col, e.target.checked)} />
              <label htmlFor={col}>Stolpec {col}</label>
            </div>
          ))}
        </div>
        <div className="export-section">
          <label>Ločilo CSV</label>
          <select value={settings.separator} onChange={(e) => handleSeparator(e.target.value)} aria-label="Ločilo CSV">
            <option value=";">Semicolon</option>
            <option value=",">Comma</option>
          </select>
        </div>
        <div className="export-section">
          <label>Filter izvoza</label>
          <select value={settings.filter} onChange={(e) => handleFilter(e.target.value)} aria-label="Filter izvoza">
            <option value="all">all</option>
            <option value="todo">todo</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
          </select>
        </div>
        <div className="export-actions">
          <button onClick={onClose} className="cancel-button">Prekliči</button>
          <button onClick={handleDownload} className="primary-button">Izvozi CSV</button>
        </div>
      </div>
    </div>
  )
}
