import { ArrowUpRight } from "lucide-react";

import type { Task, TaskStatus } from "./shared/types";

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  return (
    <div
      className="task-board"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={handleDrop}
    >
      {tasks.map((task, index) => (
        <TaskRow key={task.id} task={task} index={index} onDrop={handleDrop} />
      ))}
    </div>
  );
}

function handleDrop(e: DragEvent) {
  const taskId = e.dataTransfer.getData("text/plain");
  const rect = e.currentTarget.getBoundingClientRect();
  const dropY = e.clientY - rect.top;
  if (dropY < 80) {
    handleStatusDrop(taskId, "todo");
  } else if (dropY >= 80 && dropY < 160) {
    handleStatusDrop(taskId, "in_progress");
  } else if (dropY >= 160) {
    handleStatusDrop(taskId, "done");
  }
}

function handleStatusDrop(id: string, status: TaskStatus) {
  console.log("Dropped " + id + " into " + status);
}

