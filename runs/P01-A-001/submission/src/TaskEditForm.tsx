import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { updateTask } from './api.ts'

// P01 deliberately preserves other whitespace, including non-breaking spaces.
function cleanTitle(title: string) {
  return title.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '')
}

export function TaskEditForm({ task, onSaved, onCancel }: { task: Task; onSaved: (task: Task) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(task.title)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [titleError, setTitleError] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const titleInput = useRef<HTMLTextAreaElement>(null)
  const id = useId()

  useEffect(() => { titleInput.current?.focus() }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    const cleaned = cleanTitle(title)
    if (!cleaned) {
      setTitleError(true)
      titleInput.current?.focus()
      return
    }

    // The synchronous guard also covers submissions before React rerenders.
    pending.current = true
    setSaving(true)
    setSaveError(null)
    try {
      const saved = await updateTask(task.id, { title: cleaned, status })
      onSaved(saved)
    } catch (error: unknown) {
      setSaveError(error instanceof TypeError
        ? 'Shranjevanje ni uspelo. Preveri povezavo in poskusi znova.'
        : error instanceof Error ? error.message : 'Shranjevanje ni uspelo. Poskusi znova.')
    } finally {
      pending.current = false
      setSaving(false)
    }
  }

  return <form className="task-edit-form" aria-label="Urejanje opravila" aria-busy={saving} noValidate onSubmit={submit}>
    <div className="form-field">
      <label htmlFor={`${id}-title`}>Naslov</label>
      <textarea ref={titleInput} id={`${id}-title`} rows={3} value={title} disabled={saving} aria-required="true" aria-invalid={titleError ? 'true' : undefined} aria-describedby={titleError ? `${id}-title-error` : undefined} onChange={(event) => {
        setTitle(event.target.value)
        if (cleanTitle(event.target.value)) setTitleError(false)
      }} />
      {titleError && <p id={`${id}-title-error`} className="form-error" role="alert">Vnesi naslov opravila. Naslov ne sme biti prazen ali vsebovati samo presledkov, tabulatorjev in prelomov vrstic.</p>}
    </div>
    <div className="form-field">
      <label htmlFor={`${id}-status`}>Stanje</label>
      <select id={`${id}-status`} value={status} disabled={saving} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
        <option value="todo">Pripravljeno</option>
        <option value="in_progress">V delu</option>
        <option value="done">Končano</option>
      </select>
    </div>
    {saveError && <p className="form-error" role="alert">{saveError}</p>}
    {saving && <div className="save-status" role="status"><span className="spinner" aria-hidden="true" />Shranjevanje …</div>}
    <div className="form-actions">
      <button type="submit" className="button button-primary" disabled={saving}>Shrani</button>
      <button type="button" className="button" disabled={saving} onClick={() => { if (!pending.current) onCancel() }}>Prekliči</button>
    </div>
  </form>
}
