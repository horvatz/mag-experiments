import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync, cpSync } from 'node:fs'
import { resolve } from 'node:path'
const root = process.cwd(), catalog = JSON.parse(readFileSync('tasks/main-catalog.json'))
const commit = JSON.parse(readFileSync('baseline.json')).commit
const get = file => execFileSync('git', ['show', commit + ':' + file], { cwd: resolve(root, '../aplikacija'), encoding: 'utf8' })
const original = get('src/App.tsx'), split = original.indexOf('export function App()')
let project = original.slice(0, split).replace("import type { Project, Task }", "import { useTaskFeature } from './TaskFeature.tsx'\nimport './feature.css'\nimport type { Project, Task }")
project = project.replace('function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {', 'function LoadedProject({ project, taskId, view, tasks }: { project: Project; taskId: string | null; view: TaskView; tasks: Task[] }) {')
project = project.replace("  const { data: tasks, error, loading, retry } = useResource<Task[]>(`/api/projects/${encodeURIComponent(project.id)}/tasks`)\n", '  const feature = useTaskFeature({ tasks, project, view })\n  const items = feature.items\n  const countItems = feature.countItems ?? tasks\n')
project = project.replaceAll('tasks?.filter', 'countItems.filter')
project = project.replace('    {loading && <Loading label="Nalaganje opravil …" />}\n', '').replace('    {error && <LoadError message={error} retry={retry} />}\n', '')
project = project.replace("        {view === 'board' ? <TaskBoard tasks={tasks} /> : tasks.length === 0 ?", "        {feature.controls}\n        {view === 'board' && items.length === 0 && tasks.length > 0 && <p role=\"status\">{feature.emptyMessage ?? 'Ni opravil v izbranem prikazu.'}</p>}\n        {view === 'board' ? <TaskBoard tasks={items} renderExtra={feature.renderExtra} /> : items.length === 0 ?")
project = project.replace('<h3>V tem projektu še ni opravil</h3><p>Opravila bodo prikazana tukaj.</p>', '<h3>{tasks.length === 0 ? \'V tem projektu še ni opravil\' : feature.emptyMessage ?? \'Ni opravil v izbranem prikazu.\'}</h3>{tasks.length === 0 && <p>Opravila bodo prikazana tukaj.</p>}')
project = project.replace('<span className="visually-hidden">Podrobnosti</span></th></tr>', '<span className="visually-hidden">Podrobnosti</span></th>{feature.renderExtra && <th scope="col">Dejanja</th>}</tr>')
project = project.replace('{tasks.map((task)', '{items.map((task)').replace('<td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>', '<td className="row-arrow"><ArrowUpRight size={17} aria-hidden="true" /></td>{feature.renderExtra && <td>{feature.renderExtra(task)}</td>}')
const wrapper = `function ProjectView({ project, taskId, view }: { project: Project; taskId: string | null; view: TaskView }) {\n  const { data: tasks, error, loading, retry } = useResource<Task[]>(\`/api/projects/\${encodeURIComponent(project.id)}/tasks\`)\n  return <>\n    {loading && <Loading label="Nalaganje opravil …" />}\n    {error && <LoadError message={error} retry={retry} />}\n    {tasks && <LoadedProject project={project} taskId={taskId} view={view} tasks={tasks} />}\n  </>\n}\n\n`
const app = project + wrapper + original.slice(split)
let board = get('src/TaskBoard.tsx').replace("import { CalendarDays }", "import type { ReactNode } from 'react'\nimport { CalendarDays }")
board = board.replace('export function TaskBoard({ tasks }: { tasks: Task[] })', 'export function TaskBoard({ tasks, renderExtra }: { tasks: Task[]; renderExtra?: (task: Task) => ReactNode })').replace('              </a>\n            </li>', '              </a>\n              {renderExtra?.(task)}\n            </li>')
for (const task of catalog) {
  const dir = `reference/${task.id}/overlay/src`; mkdirSync(dir, { recursive: true })
  writeFileSync(dir + '/App.tsx', app); writeFileSync(dir + '/TaskBoard.tsx', board)
  for (const f of ['feature-types.ts', 'feature-utils.ts', 'feature.css']) cpSync('reference/main-common/' + f, dir + '/' + f)
  cpSync('tasks/main-helpers.ts', `tasks/${task.id}/helpers.ts`)
}
console.log('Generated reference rendering shells and public helpers for eight main tasks.')
