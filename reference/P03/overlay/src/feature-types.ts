import type { ReactNode } from 'react'
import type { Project, Task } from '../shared/types.ts'
import type { TaskView } from './navigation.ts'
export type FeatureContext = { tasks: Task[]; project: Project; view: TaskView }
export type FeatureModel = { items: Task[]; controls: ReactNode; countItems?: Task[]; emptyMessage?: string; renderExtra?: (task: Task) => ReactNode }
