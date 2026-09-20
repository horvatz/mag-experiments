import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CalendarDays, CircleDot, FolderOpen, Hash, UserRound, X } from 'lucide-react'
import type { Project, Task, TaskStatus } from '../shared/types.ts'
import { updateTask } from './api.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, type TaskView } from './navigation.ts'
import { useResource } from './useResource.ts'

function normalizeTitle(title: string) {
  return title.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '')
}

function TaskEditor({ task, onSaved, onCancel }: { task: Task; onSaved: (saved: Task) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(task.title)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [titleError, setTitleError] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const titleField = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { titleField.current?.focus() }, [])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending.current) return
    const normalizedTitle = normalizeTitle(title)
    if (!normalizedTitle) {
      setTitleError(true)
      titleField.current?.focus()
      return
    }
    pending.current = true
    setSaving(true)
    setSaveError(null)
    try {
      const saved = await updateTask(task.id, { title: normalizedTitle, status })
      onSaved(saved)
    } catch (error: unknown) {
      setSaveError(`Shranjevanje ni uspelo. ${error instanceof Error ? error.message : 'Poskusi znova.'}`)
    } finally {
      pending.current = false
      setSaving(false)
    }
  }

  return <form className="task-editor" onSubmit={save} noValidate aria-label="Urejanje opravila">
    <div className="form-field">
      <label htmlFor="task-title">Naslov</label>
      <textarea ref={titleField} id="task-title" rows={2} required value={title} disabled={saving}
        aria-invalid={titleError || undefined} aria-describedby={titleError ? 'task-title-error' : undefined}
        onChange={(event) => {
          setTitle(event.target.value)
          if (normalizeTitle(event.target.value)) setTitleError(false)
        }} />
      {titleError && <p className="form-error" id="task-title-error" role="alert">Vnesi naslov opravila.</p>}
    </div>
    <div className="form-field">
      <label htmlFor="task-status">Stanje</label>
      <select id="task-status" value={status} disabled={saving} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
        <option value="todo">Pripravljeno</option>
        <option value="in_progress">V delu</option>
        <option value="done">Končano</option>
      </select>
    </div>
    {saveError && <p className="form-error" role="alert">{saveError}</p>}
    {saving && <div className="save-status" role="status"><span className="spinner" aria-hidden="true" />Shranjevanje …</div>}
    <div className="form-actions">
      <button className="button button-primary" type="submit" disabled={saving}>Shrani</button>
      <button className="button" type="button" disabled={saving} onClick={onCancel}>Prekliči</button>
    </div>
  </form>
}

export function TaskDetails({ project, taskId, view, onSaved }: { project: Project; taskId: string; view: TaskView; onSaved: (saved: Task) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const editButton = useRef<HTMLButtonElement>(null)
  const [editing, setEditing] = useState(false)
  const { data: task, error, loading, retry, updateData } = useResource<Task>(`/api/tasks/${encodeURIComponent(taskId)}`)
  const close = () => { window.location.hash = projectUrl(project.id, view) }

  useEffect(() => {
    const element = dialog.current!
    const previousFocus = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

  useEffect(() => {
    if (!editing) editButton.current?.focus()
  }, [editing])

  const wrongProject = task && task.projectId !== project.id
  return <dialog ref={dialog} className="task-dialog" aria-labelledby="detail-title" onCancel={(event) => { event.preventDefault(); close() }}>
    <div className="detail-topbar">
      <span>Podrobnosti opravila</span>
      <button className="icon-button" onClick={close} aria-label="Zapri podrobnosti"><X size={20} aria-hidden="true" /></button>
    </div>
    <div className="detail-body">
      {(loading || error || wrongProject) && <h2 id="detail-title" className="visually-hidden">Podrobnosti opravila</h2>}
      {loading && <Loading />}
      {error && <LoadError message={error} retry={retry} />}
      {wrongProject && <div className="state-message"><h3>Opravilo ni v tem projektu</h3><p>Zapri podrobnosti in izberi opravilo s seznama.</p></div>}
      {task && !wrongProject && <>
        <span className="eyebrow">{task.id}</span>
        <h2 id="detail-title">{task.title}</h2>
        {editing ? <TaskEditor task={task} onCancel={() => setEditing(false)} onSaved={(saved) => {
          updateData(() => saved)
          onSaved(saved)
          setEditing(false)
        }} /> : <div className="detail-actions"><button ref={editButton} className="button" type="button" onClick={() => setEditing(true)}>Uredi</button></div>}
        <dl className="detail-properties">
          <div><dt><CircleDot size={16} aria-hidden="true" />Stanje</dt><dd><StatusBadge status={task.status} /></dd></div>
          <div><dt><UserRound size={16} aria-hidden="true" />Odgovorna oseba</dt><dd className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></dd></div>
          <div><dt><CalendarDays size={16} aria-hidden="true" />Rok</dt><dd><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></dd></div>
          <div><dt><FolderOpen size={16} aria-hidden="true" />Projekt</dt><dd>{project.name}</dd></div>
          <div><dt><Hash size={16} aria-hidden="true" />Oznaka</dt><dd className="task-id">{task.id}</dd></div>
        </dl>
        <section className="description"><h3>Opis opravila</h3><p>{task.description}</p></section>
      </>}
    </div>
  </dialog>
}
