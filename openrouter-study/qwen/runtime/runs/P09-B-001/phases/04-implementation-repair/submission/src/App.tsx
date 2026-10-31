import { ArrowUpRight, Check, Columns3, FolderClosed, ListTodo, Table2 } from '''lucide-react''''
import type { Project, Task } from '''../shared/types.ts'''
import { Avatar, LoadError, Loading, StatusBadge } from '''./components.tsx'''
import { formatDate } from '''./formatDate.ts'''
import { projectUrl, taskUrl, useRoute, type TaskView } from '''./navigation.ts'''
import { TaskBoard } from '''./TaskBoard.tsx'''
import { TaskDetails } from '''./TaskDetails.tsx'''
import { useResource } from '''./useResource.ts'''
import { ConnectionView } from '''./ConnectionView.tsx'''

function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {
  const { data: tasks, error, loading, retry } = useResource<Task[]>()
  const [viewState, setViewState] = useLocalStorage('''view-state''', { q: '''''', status: '''all''', order: '''original''', applied: false })

  return <>
    <div className=''project-overview''></>
  </div>
}