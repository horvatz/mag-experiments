import { useRef, useState } from 'react'
import type { Task, TaskStatus } from '../shared/types.ts'
import { updateTask } from './api.ts'

export function useBulkTasks(tasks: Task[], onSaved: (task: Task) => void) {
  const [selected, setSelected] = useState<string[]>([])
  const [target, setTarget] = useState<TaskStatus | ''>('')
  const [failures, setFailures] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ successful: number; failed: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const sending = useRef(false)
  const hasFailures = Object.keys(failures).length > 0
  const locked = busy || hasFailures

  function choose(id: string) {
    if (sending.current || locked) return
    setSelected((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id])
    setResult(null)
  }

  function chooseAll() {
    if (sending.current || locked) return
    setSelected(selected.length === tasks.length ? [] : tasks.map((task) => task.id))
    setResult(null)
  }

  function changeTarget(value: TaskStatus | '') {
    if (sending.current || locked) return
    setTarget(value)
    setResult(null)
  }

  function clear() {
    if (sending.current) return
    setSelected([])
    setTarget('')
    setFailures({})
    setResult(null)
  }

  async function save(retry = false) {
    if (sending.current || !target || (retry ? !hasFailures : hasFailures)) return
    const ids = retry ? Object.keys(failures) : selected
    const batch = tasks.filter((task) => ids.includes(task.id))
    if (batch.length === 0) return
    sending.current = true
    setBusy(true)
    const previousSuccesses = retry ? result?.successful ?? 0 : 0
    setResult(null)
    setFailures({})
    const outcomes = await Promise.all(batch.map(async (task) => {
      try {
        const saved = await updateTask(task.id, { title: task.title, status: target })
        onSaved(saved)
        setSelected((current) => current.filter((id) => id !== task.id))
        return { id: task.id, error: null }
      } catch (error: unknown) {
        return { id: task.id, error: error instanceof Error ? error.message : 'Shranjevanje ni uspelo. Poskusi znova.' }
      }
    }))
    const failed = outcomes.filter((outcome): outcome is { id: string; error: string } => outcome.error !== null)
    setFailures(Object.fromEntries(failed.map(({ id, error }) => [id, error])))
    setSelected(failed.map(({ id }) => id))
    setResult({ successful: previousSuccesses + batch.length - failed.length, failed: failed.length })
    if (failed.length === 0) setTarget('')
    sending.current = false
    setBusy(false)
  }

  return { selected, target, failures, result, busy, locked, hasFailures, choose, chooseAll, changeTarget, clear, save }
}
