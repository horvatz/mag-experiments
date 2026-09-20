import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { CalendarDays, CircleDot, FolderOpen, Hash, UserRound, X } from 'lucide-react'
import type { Project, Task, TaskStatus, TaskUpdate } from '../shared/types.ts'
import { updateTask } from './api.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, type TaskView } from './navigation.ts'
import { useResource } from './useResource.ts'
import { normalizeTitle } from './taskEditing.ts'

export function TaskDetails({ project, taskId, view, onSaved }: { project: Project; taskId: string; view: TaskView; onSaved: (task: Task) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const { data: task, error, loading, retry, updateData } = useResource<Task>(`/api/tasks/${encodeURIComponent(taskId)}`)
  const [draft, setDraft] = useState<TaskUpdate | null>(null)
  const [titleError, setTitleError] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const saveLock = useRef(false)
  const titleField = useRef<HTMLTextAreaElement>(null)
  const editButton = useRef<HTMLButtonElement>(null)
  const close = () => { window.location.hash = projectUrl(project.id, view) }

  function beginEdit() {
    if (!task) return
    setDraft({ title: task.title, status: task.status })
    setTitleError(false)
    setSaveError(null)
  }

  function finishEdit() {
    setDraft(null)
    setTitleError(false)
    setSaveError(null)
    requestAnimationFrame(() => editButton.current?.focus())
  }

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saveLock.current || !draft || !task) return
    const title = normalizeTitle(draft.title)
    if (!title) {
      setTitleError(true)
      titleField.current?.focus()
      return
    }
    saveLock.current = true
    setSaving(true)
    setSaveError(null)
    try {
      const saved = await updateTask(task.id, { title, status: draft.status })
      updateData(() => saved)
      onSaved(saved)
      finishEdit()
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : 'Shranjevanje ni uspelo. Poskusi znova.')
    } finally {
      saveLock.current = false
      setSaving(false)
    }
  }

  useEffect(() => {
    const element = dialog.current!
    const previousFocus = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

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
        {draft ? <form className="task-edit-form" onSubmit={save} noValidate aria-label="Urejanje opravila">
          <div className="edit-field">
            <label htmlFor="task-title">Naslov</label>
            <textarea ref={titleField} id="task-title" rows={2} value={draft.title} disabled={saving}
              aria-invalid={titleError || undefined} aria-describedby={titleError ? 'task-title-error' : undefined}
              onChange={(event) => {
                const title = event.target.value
                setDraft({ ...draft, title })
                if (normalizeTitle(title)) setTitleError(false)
              }} />
            {titleError && <p id="task-title-error" className="edit-error" role="alert">Naslov ne sme biti prazen.</p>}
          </div>
          <div className="edit-field">
            <label htmlFor="task-status">Stanje</label>
            <select id="task-status" value={draft.status} disabled={saving}
              onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskStatus })}>
              <option value="todo">Pripravljeno</option>
              <option value="in_progress">V delu</option>
              <option value="done">Končano</option>
            </select>
          </div>
          {saveError && <p className="edit-error" role="alert">{saveError}</p>}
          {saving && <p className="edit-status" role="status">Shranjevanje …</p>}
          <div className="edit-actions">
            <button className="button button-primary" type="submit" disabled={saving}>Shrani</button>
            <button className="button" type="button" disabled={saving} onClick={() => { if (!saveLock.current) finishEdit() }}>Prekliči</button>
          </div>
        </form> : <button ref={editButton} className="button edit-trigger" type="button" onClick={beginEdit}>Uredi</button>}
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
