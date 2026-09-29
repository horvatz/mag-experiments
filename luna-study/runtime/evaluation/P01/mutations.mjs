export const mutations = [
  {
    id: 'M01', name: 'Autosave before confirmation', scenario: 'E02', assertion: 'toEqual',
    edits: [{ file: 'src/TaskEditor.tsx', from: '    setTitle(value)', to: "    setTitle(value)\n    void updateTask(task.id, { title: value, status }).catch(() => undefined)" }],
  },
  {
    id: 'M02', name: 'Update the other task with the same title', scenario: 'E08', assertion: 'toEqual',
    edits: [{ file: 'src/TaskEditor.tsx', from: 'await updateTask(task.id, values)', to: "await updateTask(task.id === 'web-02' ? 'web-01' : task.id, values)" }],
  },
  {
    id: 'M03', name: 'Validate without removing edge whitespace', scenario: 'E03', assertion: 'toHaveAttribute',
    edits: [{ file: 'src/TaskEditor.tsx', from: "return value.replace(/^[ \\t\\r\\n]+|[ \\t\\r\\n]+$/g, '')", to: 'return value' }],
  },
  {
    id: 'M04', name: 'Update only the local display', scenario: 'E06', assertion: 'toEqual',
    edits: [
      { file: 'src/TaskEditor.tsx', from: 'const saved = await updateTask(task.id, values)', to: 'const saved = { ...task, ...values }' },
      { file: 'src/TaskEditor.tsx', from: "import { updateTask } from './api.ts'\n", to: '' },
    ],
  },
  {
    id: 'M05', name: 'Close and discard input on rejection', scenario: 'E09', assertion: 'toBeVisible',
    edits: [{ file: 'src/TaskEditor.tsx', from: "setSaveError(error instanceof Error ? error.message : 'Shranjevanje ni uspelo. Poskusi znova.')", to: 'if (error) onCancel()' }],
  },
  {
    id: 'M06', name: 'Send two updates for one save', scenario: 'E10', assertion: 'toBe',
    edits: [{ file: 'src/TaskEditor.tsx', from: 'const saved = await updateTask(task.id, values)', to: 'const [saved] = await Promise.all([updateTask(task.id, values), updateTask(task.id, values)])' }],
  },
  {
    id: 'M07', name: 'Reuse a previous task draft', scenario: 'E11', assertion: 'toHaveValue',
    edits: [
      { file: 'src/TaskEditor.tsx', from: 'function normalizeTitle(value: string)', to: 'let previousTitle: string | null = null\n\nfunction normalizeTitle(value: string)' },
      { file: 'src/TaskEditor.tsx', from: 'useState(task.title)', to: 'useState(previousTitle ?? task.title)' },
      { file: 'src/TaskEditor.tsx', from: '    setTitle(value)', to: '    previousTitle = value\n    setTitle(value)' },
    ],
  },
  {
    id: 'M08', name: 'Leave the board and counters stale after saving', scenario: 'E06', assertion: 'toContainText',
    edits: [{ file: 'src/TaskDetails.tsx', from: '          onSaved(saved)', to: "          if (view === 'table') onSaved(saved)" }],
  },
]
