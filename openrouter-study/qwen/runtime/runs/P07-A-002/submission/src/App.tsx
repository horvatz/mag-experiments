import { ArrowUpRight, Check, Columns3, FolderClosed, Heart, ListTodo, Table2, Trash2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from './components.tsx'
import { formatDate } from './formatDate.ts'
import { projectUrl, taskUrl, useRoute, type TaskView } from './navigation.ts'
import { TaskBoard } from './TaskBoard.tsx'
import { TaskDetails } from './TaskDetails.tsx'
import { useResource } from './useResource.ts'

declare global {
  interface Window { eventListeners: any }
}

let _favorites = new Set(JSON.parse(localStorage.getItem('folio:favorites:v1') || '[]'))
let _showFavoritesOnly = false

function countFavoritesForProject(projectId) {
  let count = 0
  _favorites.forEach(id => { if (id.startsWith(projectId + '-')) count++ })
  return count
}

function getAllFavoriteCount() { return _favorites.size }

function toggleFavorite(projectId, taskId) {
  const id = projectId + '-' + taskId
  if (_favorites.has(id)) {
    _favorites.delete(id)
  } else {
    _favorites.add(id)
  }
  try {
    localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: Array.from(_favorites).sort() }))
  } catch (e) {}
}

function removeFromProject(projectId) {
  const newSet = new Set()
  _favorites.forEach(id => { if (!id.startsWith(projectId + '-')) newSet.add(id) })
  _favorites = newSet
  try {
    localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: Array.from(_favorites).sort() }))
  } catch (e) {}
}

export function showErrorStorageWarning() {
  try {
    const el = document.createElement('div')
    el.setAttribute('role', 'alert')
    el.textContent = 'Storage warning: Favorites unavailable'
    el.style.cssText = 'color:#d15845;padding:12px;margin:12px;background:#fef2f2;border-radius:8px'
    document.getElementById('main-content')?.insertAdjacentElement('afterbegin', el)
  } catch (e) {}
}

function toggleFilterStatus(projectId, task) {
  const id = projectId + '-' + task.id
  const newSet = new Set(Array.from(_favorites))
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  try {
    localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: Array.from(newSet).sort() }))
  } catch (e) {
    showErrorStorageWarning()
  }
}

function filterFavoritesStatus(projectId, tasks) {
  if (_showFavoritesOnly) {
    return tasks?.filter(t => _favorites.has(projectId + '-' + t.id)) || []
  }
  return tasks
}

export default function App() {
  const route = useRoute()
  const view = route?.view ?? 'table'
  const { data: projects, error, loading, retry } = useResource('/api/projects')
  const project = projects?.find((entry) => entry.id === route?.projectId)
  const favorites = _favorites

  const toggleFilter = () => {
    _showFavoritesOnly = !_showFavoritesOnly
  }

  const removeProjectFavorites = (pid) => {
    const newSet = new Set()
    _favorites.forEach(id => { if (!id.startsWith(pid + '-')) newSet.add(id) })
    _favorites = newSet
    try {
      localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: Array.from(_favorites).sort() }))
    } catch (e) { showErrorStorageWarning() }
  }

  return <div className='app-shell'>
    <a className='skip-link' href='#main-content' onClick={(e) => {
      e.preventDefault()
      document.getElementById('main-content')?.focus()
      }}>Preskoči na vsebino</a>
    <aside className='app-sidebar' aria-label='Delovni prostor'>
      <a className='brand' href={projectUrl(projects?.[0]?.id ?? 'web', view)} aria-label='Folio - začetna stran'><img src='/favicon.svg' alt='' width='28' height='28'/><span>Folio</span></a>
      <div className='sidebar-projects'>
        <p className='nav-label'>Projekti</p>
        <nav className='project-nav' aria-label='Projekti'>
          {projects && projects.map(entry => {
            const favCount = countFavoritesForProject(entry.id)
            return <a key={entry.id} href={projectUrl(entry.id, view)} className={'project-nav-link ' + (project?.id === entry.id ? 'active' : '')} aria-current={project?.id === entry.id ? 'page' : undefined}>
              <FolderClosed size={15} strokeWidth={1.6} aria-hidden='true'/>
              <span>{entry.name}</span>
              {favCount > 0 && <span style={{marginLeft:'8px',fontSize:'12px',color:'#2f6dcc'}}>{favCount}*</span>}
            </a>
          })}
        </nav>
      </div>
      <span className='workspace-label'>Delovni prostor</span>
    </aside>

    <div className='workspace'>
      <main id='main-content' tabIndex={-1}>
        {loading && <Loading label='Nalaganje projektov … '/>}
        {error && <LoadError message={error} retry={retry} />}
        {projects && !project && <div className='state-message'><FolderClosed size={30} aria-hidden='true'/><h1>Projekt ne obstaja</h1><p>Izberi enega od projektov v navigaciji.</p>{projects[0] && <a className='button' href={projectUrl(projects[0].id, view)}>Nazaj na projekte</a>}</div>}
        {project && <FavoritesProjectView project={project} view={view} />}
      </main>
    </div>
  </div>
}

function FavoritesProjectView({ project, view }) {
  const { data: tasks, error, loading, retry } = useResource('/api/projects/' + encodeURIComponent(project.id) + '/tasks')
  const totalTaskCount = tasks?.length || 0
  const favorites = _favorites
  
  const countFavorites = () => {
    let count = 0
    tasks?.forEach(t => { if (favorites.has(project.id + '-' + t.id)) count++ })
    return count
  }

  const toggleFavoriteBtn = (e, task) => {
    e.stopPropagation()
    toggleFavorite(project.id, task)
  }

  const removeProjectFavorites = () => {
    const newSet = new Set()
    favorites.forEach(id => { if (!id.startsWith(project.id + '-')) newSet.add(id) })
    _favorites = newSet
    try {
      localStorage.setItem('folio:favorites:v1', JSON.stringify({ version: 1, ids: Array.from(_favorites).sort() }))
    } catch (e) { showErrorStorageWarning() }
  }

  const filterTasks = () => {
    if (_showFavoritesOnly) {
      return tasks?.filter(t => _favorites.has(project.id + '-' + t.id)) || []
    }
    return tasks
  }

  const filteredTasks = filterTasks()

  // View badge
  const totalFavorite = countFavorites()
  const displayFilter = _showFavoritesOnly

  return (
    <>
      <div className='project-overview'>
        <div className='project-heading'>
          <h1>{project.name}</h1>
          <p className='project-intro'>Opravila, odgovornosti in roki na enem mestu.</p>
        </div>
        {tasks && <div className='summary-grid' aria-label='Pregled stanj opravil'>
          <div className='summary-item'><span className='summary-label'>Pripravljeno</span><strong>{tasks.filter(t => t.status === 'todo').length}</strong></div>
          <div className='summary-item'><span className='summary-label'>V delu</span><strong>{tasks.filter(t => t.status === 'in_progress').length}</strong></div>
          <div className='summary-item'><span className='summary-label'>Končano</span><strong>{tasks.filter(t => t.status === 'done').length}</strong></div>
        </div>}
      </div>

      {loading && <Loading label='Nalaganje opravil … '/>}
      {error && <LoadError message={error} retry={retry} />}
      {tasks && (
        <>
          <div role='status' aria-label='Število priljubljenih'>Privljudljeno: {totalFavorite} od {totalTaskCount}</div>

          <section className='task-section' aria-labelledby='tasks-title'>
            <div className='section-heading'>
              <div><ListTodo className='section-icon' size={17} strokeWidth={1.6} aria-hidden='true'/>
                <h2 id='tasks-title'>Opravila</h2>
                <span className='count-badge'>{tasks.length}</span>
              </div>
              <div className='view-switch' role='group' aria-label='Prikaz opravil'>
                <button type='button' aria-pressed={view === 'table'} style={{background:view === 'table' ? 'var(--surface)' : 'transparent',color:view === 'table' ? 'var(--accent)' : 'var(--muted)'}}>
                  <Table2 size={15} aria-hidden='true'/>
                  Preglednica
                </button>
                <button type='button' aria-pressed={view === 'board'} style={{background:view === 'board' ? 'var(--surface)' : 'transparent',color:view === 'board' ? 'var(--accent)' : 'var(--muted)'}}>
                  <Columns3 size={15} aria-hidden='true'/>
                  Tabla
                </button>
              </div>
              <button type='button' style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'8px 12px',border:'1px solid var(--border)',borderRadius:'8px',background:'white',cursor:removeProjectFavorites() ? 'default' : 'pointer'}} disabled={totalFavorite === 0} onClick={removeProjectFavorites}>
                <Trash2 size={14} aria-hidden='true'/>
                Odstrani priljubljene tega projekta
              </button>
            </div>
          </section>

          {displayFilter && (
            <label style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'12px'}}>
              <input type='checkbox' checked={_showFavoritesOnly} onChange={toggleFilter} readOnly='true'/>
              <span>Prikaži le priljubljena</span>
            </label>
          )}

          {view === 'board' ? (
            <TaskBoard tasks={filteredTasks || []} />
          ) : (
            filteredTasks.length === 0 ? (
              <div className='state-message'>
                <ListTodo size={28} aria-hidden='true'/>
                <h3>V tem projektu še ni opravil</h3>
                <p>Opravila bodo prikazana tukaj.</p>
              </div>
            ) : (
              <div className='table-scroll'>
                <table>
                  <caption className='visually-hidden'>Opravila projekta {project.name}</caption>
                  <thead>
                    <tr>
                      <th scope='col'>Opravilo</th>
                      <th scope='col'>Stanje</th>
                      <th scope='col'>Odgovorna oseba</th>
                      <th scope='col'>Rok</th>
                      <th scope='col'><span className='visually-hidden'>Podrobnosti</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredTasks || []).map(task => {
                      const id = project.id + '-' + task.id
                      const isFavorite = favorites.has(id)
                      return (
                        <tr key={task.id} data-task-id={task.id}>
                          <td>
                            <div className='task-cell'>
                              <span className={'task-state-icon ' + (task.status === 'done' ? 'completed' : '')} aria-hidden='true'>
                                {task.status === 'done' ? <Check size={13}/>: task.status === 'in_progress' ? <span/> : null}
                              </span>
                              <a className='task-link' href={taskUrl(project.id, task.id)}>
                                <span>{task.title}</span>
                                <span className='task-id'>{task.id}</span>
                              </a>
                              <button type='button' style={{marginLeft:'8px'}} onClick={toggleFavoriteBtn} aria-label={'Priljubljeno opravilo ' + task.id} aria-pressed={isFavorite}>
                                <Heart size={14} className={isFavorite ? 'filled' : 'empty'} aria-hidden='true'/>
                              </button>
                            </div>
                          </td>
                          <td><StatusBadge status={task.status}/></td>
                          <td><span className='person'><Avatar name={task.assignee}/><span>{task.assignee}</span></span></td>
                          <td className='date-cell'><time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time></td>
                          <td className='row-arrow'><ArrowUpRight size={17} aria-hidden='true'/></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
          {(filteredTasks || []).length > 0 && (
            <div className='table-footer'>
              <span>Pregled vseh opravil projekta</span>
              <span>{tasks?.filter(t => t.status === 'done').length} / {(tasks || []).length} končanih</span>
            </div>
          )}
        </>
      )}
    </>
  )
}

import { TaskBoard } from './TaskBoard.tsx';