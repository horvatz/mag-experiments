import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { updateTask } from './api.ts'
import './editor.css'

function normalizeTitle(value: string) {
  return value.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '')
}

export function TaskEditor({ task, onSaved, onCancel }: {
  task: Task
  onSaved: (saved: Task) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(task.title)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [titleError, setTitleError] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const titleField = useRef<HTMLInputElement>(null)
  // The synchronous guard also covers repeated events before React renders disabled controls.
  const submitting = useRef(false)

  useEffect(() => { titleField.current?.focus() }, [])

  function changeTitle(value: string) {
    setTitle(value)
    if (normalizeTitle(value)) setTitleError(false)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const values = { title: normalizeTitle(title), status }
    if (!values.title) {
      setTitleError(true)
      titleField.current?.focus()
      return
    }
    submitting.current = true
    setPending(true)
    setSaveError(null)
    try {
      const saved = await updateTask(task.id, values)
      onSaved(saved)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Shranjevanje ni uspelo. Poskusi znova.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return <form className="task-editor" aria-labelledby="editor-title" onSubmit={(event) => { void submit(event) }} noValidate>
    <h3 id="editor-title">Urejanje opravila</h3>
    <div className="form-field">
      <label htmlFor="task-title">Naslov</label>
      <input ref={titleField} id="task-title" name="title" value={title} onChange={(event) => changeTitle(event.target.value)} disabled={pending} aria-required="true" aria-invalid={titleError || undefined} aria-describedby={titleError ? 'title-error' : undefined} autoComplete="off" />
      {titleError && <p id="title-error" className="field-error" role="alert">Vnesi naslov opravila. Naslov ne sme vsebovati samo presledkov.</p>}
    </div>
    <div className="form-field">
      <label htmlFor="task-status">Stanje</label>
      <select id="task-status" name="status" value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} disabled={pending}>
        <option value="todo">Pripravljeno</option>
        <option value="in_progress">V delu</option>
        <option value="done">Končano</option>
      </select>
    </div>
    <p className="form-note">Spremembe bodo shranjene, ko izbereš »Shrani«.</p>
    {saveError && <p className="save-error" role="alert">{saveError}</p>}
    <div className="form-actions">
      <button type="button" className="button" onClick={onCancel} disabled={pending}>Prekliči</button>
      <button type="submit" className="button button-primary" disabled={pending}><Save size={15} aria-hidden="true" />Shrani</button>
    </div>
    {pending && <p className="save-progress" role="status"><span className="spinner" aria-hidden="true" />Shranjujem spremembe …</p>}
  </form>
}
