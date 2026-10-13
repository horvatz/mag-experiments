import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from 'lucide-react'
import { AlertCircle, CalendarDays } from 'lucide-react'
import type { Project, Task, CalendarView } from '../shared/types.ts'
import { Avatar, LoadError, Loading, StatusBadge } from '../components.tsx'
import { formatDate } from '../formatDate.ts'
import { projectUrl, taskUrl, useRoute } from '../navigation.ts'
import { groupForTask } from '../util/grouping.ts'
import { useResource } from '../useResource.ts'

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: CalendarView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)

  return <>
    <div className="project-overview">
      <div className="project-heading">
        <h1>{project.name}</h1>
        <p className="project-intro">Opravila, odgovornosti in roki na enem mestu.</p>
      </div>
      {loading && <Loading label="Nalaganje opravil …" />}
      {error && <LoadError message={error} retry={retry} />}
      {tasks && (
        <div>
          <section className="task-section" aria-labelledby="tasks-title">
            <div className="section-heading">
              <div><ListTodo className="section-icon" size={17} strokeWidth={1.6} aria-hidden="true" /><h2 id="tasks-title">Opravila</h2></div>
            </div>
        
