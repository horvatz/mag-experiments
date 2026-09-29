import { useRef, useState } from 'react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { updateTask } from './api.ts'

type Failure = { task: Task; reason: string }
type Operation = { remaining: Task[]; target: TaskStatus; successful: Set<string> }

export function useBulkTaskUpdate(tasks: Task[], onSaved: (id: string, status: TaskStatus) => void) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [target, setTarget] = useState<TaskStatus | ''>('')
  const [failures, setFailures] = useState<Failure[]>([])
  const [result, setResult] = useState<{ successful: number; failed: number } | null>(null)
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null)
  const operation = useRef<Operation | null>(null)
  // This synchronous guard also covers repeated events before React renders disabled controls.
  const busy = useRef(false)
  const saving = progress !== null
  const locked = saving || failures.length > 0

  function toggle(id: string) {
    if (busy.current || operation.current || !tasks.some((task) => task.id === id)) return
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (busy.current || operation.current) return
    setSelected((current) => current.size === tasks.length ? new Set() : new Set(tasks.map((task) => task.id)))
  }

  function changeTarget(value: TaskStatus | '') {
    if (!busy.current && !operation.current) setTarget(value)
  }

  async function run(current: Operation) {
    if (busy.current) return
    busy.current = true
    operation.current = current
    setProgress({ completed: 0, total: current.remaining.length })
    setResult(null)
    setFailures([])

    const outcomes = await Promise.all(current.remaining.map(async (task): Promise<Failure | null> => {
      try {
        const saved = await updateTask(task.id, { title: task.title, status: current.target })
        // Publish each confirmed status immediately; do not replace unrelated fields.
        onSaved(task.id, saved.status)
        current.successful.add(task.id)
        return null
      } catch (error: unknown) {
        return { task, reason: error instanceof Error ? error.message : 'Spremembe ni mogoče shraniti. Poskusi znova.' }
      } finally {
        setProgress((value) => value && { ...value, completed: value.completed + 1 })
      }
    }))

    const failed = outcomes.filter((outcome): outcome is Failure => outcome !== null)
    current.remaining = failed.map(({ task }) => task)
    setFailures(failed)
    setSelected(new Set(current.remaining.map((task) => task.id)))
    setResult({ successful: current.successful.size, failed: failed.length })
    if (failed.length === 0) {
      operation.current = null
      setTarget('')
    }
    setProgress(null)
    busy.current = false
  }

  function apply() {
    if (busy.current || operation.current || !target || selected.size === 0) return
    // Snapshot both selection and values; retry keeps the same target and saved titles.
    const remaining = tasks.filter((task) => selected.has(task.id)).map((task) => ({ ...task }))
    if (remaining.length) void run({ remaining, target, successful: new Set() })
  }

  function retry() {
    if (!busy.current && operation.current?.remaining.length) void run(operation.current)
  }

  function clear() {
    if (busy.current) return
    operation.current = null
    setSelected(new Set())
    setTarget('')
    setFailures([])
    setResult(null)
  }

  return { selected, target, failures, result, progress, saving, locked, toggle, toggleAll, changeTarget, apply, retry, clear }
}
