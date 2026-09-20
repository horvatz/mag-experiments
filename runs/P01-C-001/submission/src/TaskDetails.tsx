import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CalendarDays, CircleDot, FolderOpen, Hash, UserRound, X } from 'lucide-react'
import type { Project, Task, TaskUpdate } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { updateTask } from './api.ts'
import { normalizeTitle } from './taskEditing.ts'
import { formatDate } from './formatDate.ts'
import { projectUrl, type TaskView } from './navigation.ts'
import { useResource } from './useResource.ts'

export function TaskDetails({ project, taskId, view, onSaved }: { project: Project; taskId: string; view: TaskView; onSaved: (task: Task) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
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

  const [draft, setDraft] = useState<TaskUpdate | null>(null)
  const [titleError, setTitleError] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  function startEditing() {
    if (!task) return
    setDraft({ title: task.title, status: task.status })
    setTitleError(false)
    setSaveError(null)
  }
  function cancelEditing() {
    if (pending.current) return
    setDraft(null)
    setTitleError(false)
    setSaveError(null)
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft || !task || pending.current) return
    const title = normalizeTitle(draft.title)
    if (!title) { setTitleError(true); return }
    pending.current = true
    setSaving(true)
    setSaveError(null)
    try {
      const saved = await updateTask(task.id, { title, status: draft.status })
      updateData(() => saved)
      onSaved(saved)
      setDraft(null)
      setTitleError(false)
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : 'Shranjevanje ni uspelo. Poskusi znova.')
    } finally {
      pending.current = false
      setSaving(false)
    }
  }

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
        {draft ? <form className="task-edit-form" onSubmit={save} noValidate>
          <label htmlFor="task-title">Naslov</label>
          <textarea id="task-title" rows={2} value={draft.title} disabled={saving}
            aria-invalid={titleError || undefined} aria-describedby={titleError ? 'title-error' : undefined}
            onChange={(event) => {
              const title = event.target.value
              setDraft({ ...draft, title })
              if (normalizeTitle(title)) setTitleError(false)
            }} />
          {titleError && <p id="title-error" className="form-error" role="alert">Naslov ne sme biti prazen.</p>}
          <label htmlFor="task-status">Stanje</label>
          <select id="task-status" value={draft.status} disabled={saving}
            onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskUpdate['status'] })}>
            <option value="todo">Pripravljeno</option>
            <option value="in_progress">V delu</option>
            <option value="done">Končano</option>
          </select>
          {saveError && <p className="form-error" role="alert">{saveError}</p>}
          {saving && <p className="save-status" role="status">Shranjevanje …</p>}
          <div className="edit-actions">
            <button className="button primary-button" type="submit" disabled={saving}>Shrani</button>
            <button className="button" type="button" disabled={saving} onClick={cancelEditing}>Prekliči</button>
          </div>
        </form> : <button className="button edit-button" type="button" onClick={startEditing}>Uredi</button>}
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
