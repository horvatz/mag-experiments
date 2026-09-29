import { useRef, useState } from 'react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { updateTask } from './api.ts'

type Entry = Pick<Task, 'id' | 'title'>
type Failure = Entry & { reason: string }
type Operation = { target: TaskStatus; successful: Set<string> }

export function useBulkStatus(tasks: Task[], onSaved: (task: Task) => void) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [target, setTarget] = useState<TaskStatus | ''>('')
  const [busy, setBusy] = useState(false)
  const [failures, setFailures] = useState<Failure[]>([])
  const [result, setResult] = useState<{ successful: number; failed: number } | null>(null)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const inFlight = useRef(false)
  const operation = useRef<Operation | null>(null)
  const locked = busy || failures.length > 0

  function toggle(id: string) {
    if (inFlight.current || locked || !tasks.some((task) => task.id === id)) return
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (inFlight.current || locked) return
    setSelected((previous) => previous.size === tasks.length ? new Set() : new Set(tasks.map((task) => task.id)))
  }

  function changeTarget(value: TaskStatus | '') {
    if (!inFlight.current && !locked) setTarget(value)
  }

  async function run(entries: Entry[], current: Operation) {
    if (inFlight.current || entries.length === 0) return
    // A synchronous gate also covers repeated events before React renders disabled controls.
    inFlight.current = true
    setBusy(true)
    setProgress({ completed: 0, total: entries.length })
    const rejected: Failure[] = []
    await Promise.all(entries.map(async (entry) => {
      try {
        const saved = await updateTask(entry.id, { title: entry.title, status: current.target })
        onSaved(saved)
        current.successful.add(entry.id)
      } catch (error: unknown) {
        rejected.push({ ...entry, reason: error instanceof Error ? error.message : 'Spremembe ni mogoče shraniti. Poskusi znova.' })
      } finally {
        setProgress((previous) => ({ ...previous, completed: previous.completed + 1 }))
      }
    }))
    setFailures(rejected)
    setSelected(new Set(rejected.map((entry) => entry.id)))
    setResult({ successful: current.successful.size, failed: rejected.length })
    if (rejected.length === 0) {
      setTarget('')
      operation.current = null
    }
    setBusy(false)
    inFlight.current = false
  }

  function apply() {
    if (inFlight.current || locked || !target || selected.size === 0) return
    const entries = tasks.filter((task) => selected.has(task.id)).map(({ id, title }) => ({ id, title }))
    const current: Operation = { target, successful: new Set() }
    operation.current = current
    setResult(null)
    void run(entries, current)
  }

  function retry() {
    if (inFlight.current || !operation.current || failures.length === 0) return
    void run(failures.map(({ id, title }) => ({ id, title })), operation.current)
  }

  function clear() {
    if (inFlight.current) return
    setSelected(new Set())
    setTarget('')
    setFailures([])
    setResult(null)
    setProgress({ completed: 0, total: 0 })
    operation.current = null
  }

  return { selected, target, busy, locked, failures, result, progress, toggle, toggleAll, changeTarget, apply, retry, clear }
}
