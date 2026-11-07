import { useState } from 'react'
import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Search, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import {
  defaultViewState,
  projectUrl,
  stateUrl,
  taskUrl,
  useRoute,
  visibleTasks,
  type SortOrder,
  type StatusFilter,
  type TaskView,
  type ViewState,
} from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

function useDraft(value: ViewState, key: string) {
  const [draft, setDraft] = useState(value)
  const [seen, setSeen] = useState(key)
  if (seen !== key) {
    setSeen(key)
    setDraft(value)
  }
  return [draft, setDraft] as const
}

function NoResults() {
  return <div className="state-message">
    <Search size={28} aria-hidden="true" />
    <h3>Ni zadetkov.</h3>
    <p>Poskusi z drugim iskalnim nizom ali ponastavi pogled.</p>
  </div>
}

function ProjectView({ project, taskId, view, state }: { project: Project; taskId: string | null; view: TaskView; state: ViewState }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const routeKey = [project.id, taskId ?? '', view, state.q, state.status, state.order].join('\u0000')
  const [draft, setDraft] = useDraft(state, routeKey)
  const visible = tasks ? visibleTasks(tasks, state) : []
  const total = tasks?.length ?? 0
  const noResults = total > 0 && visible.length === 0

  const confirm = (next: ViewState) => {
    const confirmed: ViewState = { q: next.q.trim(), status: next.status, order: next.order }
    setDraft(confirmed)
    const changed = confirmed.q !== state.q || confirmed.status !== state.status || confirmed.order !== state.order
    const url = stateUrl(project.id, confirmed, view, taskId)
    if (changed) window.location.hash = url
    else if (window.location.hash !== url) window.history.replaceState(null, '', url)
  }

  const counts = {
    todo: tasks?.filter((task) => task.status === 'todo').length ?? 0,
    in_progress: tasks?.filter((task) => task.status === 'in_progress').length ?? 0,
    done: tasks?.filter((task) => task.status === 'done').length ?? 0,
  }

  return <>
    <div className="project-overview">
      <div className="project-heading">
        <h1>{project.name}</h1>
        <p className="project-intro">Opravila, odgovornosti in roki na enem mestu.</p>
      </div>
      {tasks && <div className="summary-grid" aria-label="Pregled stanj opravil">
        <div className="summary-item"><span className="summary-label">Pripravljeno</span><strong>{counts.todo}</strong></div>
        <div className="summary-item"><span className="summary-label">V delu</span><strong>{counts.in_progress}</strong></div>
        <div className="summary-item"><span className="summary-label">Končano</span><strong>{counts.done}</strong></div>
      </div>}
    </div>

    {loading && <Loading label="Nalaganje opravil …" />}
    {error && <LoadError message={error} retry={retry} />}
    {tasks && <>
      <section className="task-section" aria-labelledby="tasks-title">
        <div className="section-heading">
          <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2><span className="count-badge">{total}</span></div>
          <div className="view-switch" role="group" aria-label="Prikaz opravil">
            <button type="button" aria-pressed={view === 'table'} onClick={() => { window.location.hash = stateUrl(project.id, state, 'table') }}><Table2 size={15} aria-hidden="true" />Preglednica</button>
            <button type="button" aria-pressed={view === 'board'} onClick={() => { window.location.hash = stateUrl(project.id, state, 'board') }}><Columns3 size={15} aria-hidden="true" />Tabla</button>
          </div>
        </div>
        <div className="view-controls">
          <label className="control-field">
            <span className="control-label">Iskanje v povezavi</span>
            <input type="search" value={draft.q} onChange={(event) => setDraft({ ...draft, q: event.target.value })} />
          </label>
          <label className="control-field">
            <span className="control-label">Stanje v povezavi</span>
            <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as StatusFilter })}>
              <option value="all">Vsa stanja</option>
              <option value="todo">Pripravljeno</option>
              <option value="in_progress">V delu</option>
              <option value="done">Končano</option>
            </select>
          </label>
          <label className="control-field">
            <span className="control-label">Vrstni red v povezavi</span>
            <select value={draft.order} onChange={(event) => setDraft({ ...draft, order: event.target.value as SortOrder })}>
              <option value="original">Izvirni vrstni red</option>
              <option value="title-asc">Naslov A–Ž</option>
              <option value="title-desc">Naslov Ž–A</option>
            </select>
          </label>
          <div className="control-actions">
            <button type="button" className="button" onClick={() => confirm(draft)}>Uporabi pogled</button>
            <button type="button" className="button" onClick={() => confirm(defaultViewState)}>Ponastavi pogled</button>
          </div>
          <div className="result-status" role="status" aria-label="Rezultati povezave">Prikazano: {visible.length} od {total}.</div>
        </div>
        {view === 'board'
          ? noResults ? <NoResults /> : <TaskBoard tasks={visible} state={state} />
          : total === 0 ? <div className="state-message"><ListTodo size={28} aria-hidden="true" /><h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p></div>
          : noResults ? <NoResults /> : <div className="table-scroll">
          <table>
            <caption className="visually-hidden">Opravila projekta {project.name}</caption>
            <thead><tr><th scope="col">Opravilo</th><th scope="col">Stanje</th><th scope="col">Odgovorna oseba</th><th scope="col">Rok</th><th scope="col"><span className="visually-hidden">Podrobnosti</span></th></tr></thead>
            <tbody>{visible.map((task) => <tr key={task.id} data-task-id={task.id}>
              <td><div className="task-cell"><span className={`task-state-icon ${task.status === 'done' ? 'completed' : ''}`} aria-hidden="true">{task.status === 'done' ? <Check size={13} /> : task.status === 'in_progress' ? <span /> : null}</span><a className="task-link" href={taskUrl(project.id, task.id, state, view)}><span>{task.title}</span><span className="task-id">{task.id}</span></a></div></td>
              <td><StatusBadge status={task.status} /></td>
              <td><span className="person"><Avatar name={task.assignee} /><span>{task.assignee}</span></span></td>
              <td className="date-cell"><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
              <td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>
            </tr>)}</tbody>
          </table>
        </div>}
        {total > 0 && <div className="table-footer"><span>Pregled vseh opravil projekta</span><span>{counts.done} / {total} končanih</span></div>}
      </section>
    </>}
    {taskId && <TaskDetails key={taskId} project={project} taskId={taskId} view={view} state={state} />}
  </>
}

export function App() {
  const route = useRoute()
  const view = route?.view ?? 'table'
  const { data: projects, error, loading, retry } = useResource<Project[]>('/api/projects')
  const project = projects?.find((entry) => entry.id === route?.projectId)

  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>Preskoči na vsebino</a>
    <aside className="app-sidebar" aria-label="Delovni prostor">
      <a className="brand" href={projectUrl(projects?.[0]?.id ?? 'web', view)} aria-label="Folio – začetna stran"><img src="/favicon.svg" alt="" width="28" height="28" /><span>Folio</span></a>
      <div className="sidebar-projects">
        <p className="nav-label">Projekti</p>
        <nav className="project-nav" aria-label="Projekti">
          {projects?.map((entry) => <a key={entry.id} href={projectUrl(entry.id, view)} className={`project-nav-link ${project?.id === entry.id ? 'active' : ''}`} aria-current={project?.id === entry.id ? 'page' : undefined}><FolderClosed size={15} strokeWidth={1.6} aria-hidden="true" /><span>{entry.name}</span></a>)}
        </nav>
      </div>
      <span className="workspace-label">Delovni prostor</span>
    </aside>

    <div className="workspace">
      <main id="main-content" tabIndex={-1}>
        {loading && <Loading label="Nalaganje projektov …" />}
        {error && <LoadError message={error} retry={retry} />}
        {projects && !project && <div className="state-message"><FolderClosed size={30} aria-hidden="true" /><h1>Projekt ne obstaja</h1><p>Izberi enega od projektov v navigaciji.</p>{projects[0] && <a className="button" href={projectUrl(projects[0].id, view)}>Nazaj na projekte</a>}</div>}
        {project && <ProjectView key={project.id} project={project} taskId={route?.taskId ?? null} view={view} state={route?.state ?? defaultViewState} />}
      </main>
    </div>
  </div>
}
