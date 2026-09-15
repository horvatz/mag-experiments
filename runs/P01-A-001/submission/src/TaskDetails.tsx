import { useEffect, useRef, useState } from 'react'
import { CalendarDays, CircleDot, FolderOpen, Hash, Pencil, UserRound, X } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, type TaskView } from './navigation.ts'
import { useResource } from './useResource.ts'
import { TaskEditForm } from './TaskEditForm.tsx'

export function TaskDetails({ project, taskId, view, savedTask, onSaved }: { project: Project; taskId: string; view: TaskView; savedTask?: Task; onSaved: (task: Task) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const editButton = useRef<HTMLButtonElement>(null)
  const [editing, setEditing] = useState(false)
  const { data: fetchedTask, error, loading: fetching, retry } = useResource<Task>(`/api/tasks/${encodeURIComponent(taskId)}`)
  const task = savedTask ?? fetchedTask
  const loading = fetching && !task
  const close = () => { window.location.hash = projectUrl(project.id, view) }

  useEffect(() => {
    if (!editing) editButton.current?.focus()
  }, [editing])

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
  return <dialog ref={dialog} className="task-dialog" aria-labelledby="detail-title" onCancel={(event) => { event.preventDefault(); if (!editing) close() }}>
    <div className="detail-topbar">
      <span>Podrobnosti opravila</span>
      <button className="icon-button" onClick={close} disabled={editing} aria-label="Zapri podrobnosti"><X size={20} aria-hidden="true" /></button>
    </div>
    <div className="detail-body">
      {(loading || (error && !task) || wrongProject) && <h2 id="detail-title" className="visually-hidden">Podrobnosti opravila</h2>}
      {loading && <Loading />}
      {error && !task && <LoadError message={error} retry={retry} />}
      {wrongProject && <div className="state-message"><h3>Opravilo ni v tem projektu</h3><p>Zapri podrobnosti in izberi opravilo s seznama.</p></div>}
      {task && !wrongProject && <>
        <span className="eyebrow">{task.id}</span>
        <h2 id="detail-title">{task.title}</h2>
        {editing ? <TaskEditForm task={task} onCancel={() => setEditing(false)} onSaved={(saved) => { onSaved(saved); setEditing(false) }} /> : <div className="detail-actions"><button ref={editButton} type="button" className="button" onClick={() => setEditing(true)}><Pencil size={15} aria-hidden="true" />Uredi</button></div>}
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
