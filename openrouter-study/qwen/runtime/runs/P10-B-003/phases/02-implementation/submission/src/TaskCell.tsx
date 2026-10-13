import type { Task, TaskStatus } from "/Users/zan/Documents/mag/experiments/openrouter-study/qwen/runtime/.work/pilots/P10-B-003/app/shared/types.ts"
import { type ArrowUpRight } from "/Users/zan/Documents/mag/experiments/openrouter-study/qwen/runtime/.work/pilots/P10-B-003/app/src/styles.css"

const STATUS_ORDER = ["todo", "in_progress", "done"] as const

export function TaskBoardCell({ task, onDrop }: { task: Task; onDrop?: (taskId: string, status: TaskStatus) => void }) {
  const isDraggable = Boolean(onDrop)
  
  return <span draggable={true} onDragStart={(e: DragEvent) => e.dataTransfer.setData("text/plain", task.id)}>
    <span class={task.status}>{task.title}</span>
    <span class="task-status-icon" />
  </span>
}
