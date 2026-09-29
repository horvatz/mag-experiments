import { useRef, useState } from 'react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { updateTask } from './api.ts'

type Failure = { task: Task; reason: string }
type Operation = { target: TaskStatus; successful: Set<string> }

export function useBulkTaskStatus(tasks: Task[] | null, updateData: (update: (tasks: Task[]) => Task[]) => void) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [target, setTarget] = useState<TaskStatus | ''>('')
  const [failures, setFailures] = useState<Failure[]>([])
  const [result, setResult] = useState<{ successful: number; failed: number } | null>(null)
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null)
  // The synchronous guard also covers repeated events before React renders disabled controls.
  const running = useRef(false)
  const operation = useRef<Operation | null>(null)
  const locked = progress !== null || failures.length > 0

  function toggle(id: string) {
    if (running.current || failures.length || !tasks?.some((task) => task.id === id)) return
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (running.current || failures.length || !tasks?.length) return
    setSelected((previous) => previous.size === tasks.length ? new Set() : new Set(tasks.map((task) => task.id)))
  }

  function changeTarget(value: TaskStatus | '') {
    if (!running.current && !failures.length) setTarget(value)
  }

  function clear() {
    if (running.current) return
    setSelected(new Set())
    setTarget('')
    setFailures([])
    setResult(null)
    operation.current = null
  }

  async function send(attempt: Task[], current: Operation) {
    if (running.current || !attempt.length) return
    running.current = true
    setProgress({ completed: 0, total: attempt.length })
    setResult(null)
    const outcomes = await Promise.all(attempt.map(async (task): Promise<Failure | null> => {
      try {
        const saved = await updateTask(task.id, { title: task.title, status: current.target })
        updateData((previous) => previous.map((entry) => entry.id === task.id ? { ...entry, status: saved.status } : entry))
        current.successful.add(task.id)
        return null
      } catch (error: unknown) {
        return { task, reason: error instanceof Error ? error.message : 'Shranjevanje ni uspelo. Poskusi znova.' }
      } finally {
        setProgress((previous) => previous && { ...previous, completed: previous.completed + 1 })
      }
    }))
    const failed = outcomes.filter((failure): failure is Failure => failure !== null)
    setFailures(failed)
    setSelected(new Set(failed.map(({ task }) => task.id)))
    setTarget(failed.length ? current.target : '')
    setResult({ successful: current.successful.size, failed: failed.length })
    if (!failed.length) operation.current = null
    setProgress(null)
    running.current = false
  }

  function apply() {
    if (running.current || failures.length || !target || !selected.size) return
    const current: Operation = { target, successful: new Set() }
    operation.current = current
    void send((tasks ?? []).filter((task) => selected.has(task.id)), current)
  }

  function retryFailed() {
    if (running.current || !failures.length || !operation.current) return
    void send(failures.map(({ task }) => task), operation.current)
  }

  return { selected, target, failures, result, progress, locked, toggle, toggleAll, changeTarget, clear, apply, retryFailed }
}
