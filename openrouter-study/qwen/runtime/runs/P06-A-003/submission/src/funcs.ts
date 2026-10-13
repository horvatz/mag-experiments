
import type { Task, Project } from '../shared/types.ts'
import { useState, useCallback } from 'react'
import { escapeCSVValue, escapeFormula, DEFAULT_COLUMNS, type Separator, type ExportSettings } from './export.ts'

export function useExportState(projectId: string | undefined, tasks: Task[]) {
  const [settings, setSettings] = useState<ExportSettings>({
    columns: [...DEFAULT_COLUMNS],
    separator: ';',
    filter: 'all',
  })

  const handleDownload = useCallback(() => {
    const filtered = tasks.length === 0
      ? []
      : settings.filter !== 'all'
        ? tasks.filter(t => t.status === settings.filter)
        : tasks

    const bom = 'FEFF'
    let csvContent = DEFAULT_COLUMNS.map(c => escapeCSVValue(c)).join(settings.separator)

    for (const task of filtered) {
      const values = settings.columns.map(c => {
        const val = String(task[c] || '')
        let escaped = val.replace(/"/g, '""')
        return '"' + escaped + '"'
      })
      csvContent += '
' + values.join(settings.separator)
    }
    csvContent += '
'

    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'folio-' + (projectId || 'unknown') + '.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [settings, tasks])

  const resetSettings = useCallback(() => {
    setSettings({ columns: [...DEFAULT_COLUMNS], separator: ';', filter: 'all' })
  }, [])

  return { settings, setSettings, handleDownload, resetSettings }
}
