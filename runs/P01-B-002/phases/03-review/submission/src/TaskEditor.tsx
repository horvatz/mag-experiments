import { useRef, useState, type FormEvent } from 'react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { updateTask } from './api.ts'
import { normalizeTaskTitle } from './taskTitle.ts'

export function TaskEditor({ task, onSaved, onCancel }: { task: Task; onSaved: (task: Task) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(task.title)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [titleError, setTitleError] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    const normalizedTitle = normalizeTaskTitle(title)
    if (!normalizedTitle) {
      setTitleError(true)
      return
    }
    pending.current = true
    setSaving(true)
    setSaveError(null)
    try {
      const saved = await updateTask(task.id, { title: normalizedTitle, status })
      onSaved(saved)
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : 'Poskusi znova.')
    } finally {
      pending.current = false
      setSaving(false)
    }
  }

  return <form className="task-editor" onSubmit={save} noValidate aria-label="Urejanje opravila" aria-busy={saving}>
    <div className="editor-field">
      <label htmlFor="task-title">Naslov</label>
      <input id="task-title" value={title} disabled={saving} required autoFocus
        aria-invalid={titleError ? 'true' : undefined}
        aria-describedby={titleError ? 'task-title-error' : undefined}
        onChange={(event) => {
          setTitle(event.target.value)
          if (normalizeTaskTitle(event.target.value)) setTitleError(false)
        }} />
      {titleError && <p id="task-title-error" className="editor-error" role="alert">Vnesi naslov opravila.</p>}
    </div>
    <div className="editor-field">
      <label htmlFor="task-status">Stanje</label>
      <select id="task-status" value={status} disabled={saving} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
        <option value="todo">Pripravljeno</option>
        <option value="in_progress">V delu</option>
        <option value="done">Končano</option>
      </select>
    </div>
    {saveError && <p className="editor-error" role="alert">Shranjevanje ni uspelo. {saveError}</p>}
    {saving && <p className="editor-progress" role="status">Shranjevanje …</p>}
    <div className="editor-actions">
      <button className="button editor-save" type="submit" disabled={saving}>Shrani</button>
      <button className="button" type="button" disabled={saving} onClick={onCancel}>Prekliči</button>
    </div>
  </form>
}
