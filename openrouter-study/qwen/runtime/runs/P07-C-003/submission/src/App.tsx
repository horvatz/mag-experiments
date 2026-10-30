import { ArrowUpRight, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import type { Project, Task } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from '.components.tsx'
import { formatDate } from '.formatDate.ts'
import { projectUrl, taskUrl, useRoute } from '.navigation.ts'
import { useResource } from '.useResource.ts'
import { useFavorites } from '.hooks/useFavorites.ts'

function ProjectView({ project, view }: { project: Project; view: 'table' | 'board' }) {
  const { data: tasks, error, loading } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)
  const { favorites } = useFavorites(project.id)
  const counts = { todo: tasks.filter((t) => t.status === 'todo').length ?? 0, in_progress: tasks.filter((t) => t.status === 'in_progress').length ?? 0, done: tasks.filter((t) => t.status === 'done').length ?? 0, total: tasks.length ?? 0 }
  const visible = tasks?.filter((t) => favorites.includes(t.id)) ?? []
  return <>
    <div className="project-overview"><div className="project-heading"><h1>{project.name}</h1></div>${"\n      } tasks && <div className="summary-grid" aria-label="Pregled stanj opravil"><div className="summary-item"><strong>${counts.todo}</strong></div><div className="summary-item"><strong>${counts.in_progress}</strong></div><div className="summary-item"><strong>${counts.done}</strong></div></div>}
    </div>
    {loading && <Loading />} {error && <LoadError />}
    {tasks && <>
      <section><div className="section-heading"><h2>Opravila <span className="count-badge">${visible.length}</span></h2><div className="view-switch" role="group"><button type="button" aria-pressed={view === 'table'}>Preglednica</button><button type="button" aria-pressed={view === 'board'}>Tabla</button></div></div>
        {view === 'board' ? <div>Tabla</div> : <table><tbody>${visible.map((t) => <tr key={t.id}><td>${t.title}</td></tr>)}<\/tbody></table>}
      </section>
    </>}
  </>
}
export function App() {
  const route = useRoute()
  const view = route?.view ?? 'table'
  const { data: projects, loading } = useResource<Project[]>('/api/projects')
  const project = projects?.find((p) => p.id === route?.projectId)
  return project && loading && <Loading />
}