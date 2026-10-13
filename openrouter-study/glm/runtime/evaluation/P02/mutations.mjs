export const mutations = [
  {
    id: 'M01', name: 'Write to the other task with the same title', scenario: 'E05', assertion: 'Only the successful selected IDs',
    edits: [{ file: 'src/useBulkTasks.ts', from: 'await updateTask(task.id, { title: task.title, status: target })', to: "await updateTask(task.id === 'web-02' ? 'web-01' : task.id, { title: task.title, status: target })" }],
  },
  {
    id: 'M02', name: 'Retry successful and unselected tasks too', scenario: 'E07', assertion: 'toHaveText',
    edits: [{ file: 'src/useBulkTasks.ts', from: 'retry ? Object.keys(failures) : selected', to: 'retry ? tasks.map((task) => task.id) : selected' }],
  },
  {
    id: 'M03', name: 'Persist on the server but leave the display stale', scenario: 'E08', assertion: 'toContainText',
    edits: [{ file: 'src/useBulkTasks.ts', from: '        onSaved(saved)', to: '        void onSaved; void saved' }],
  },
  {
    id: 'M04', name: 'Lose another successful update through a stale list', scenario: 'E04', assertion: 'toHaveCount',
    edits: [{ file: 'src/App.tsx', from: 'setData((current) => current.map', to: 'setData(() => (tasks ?? []).map' }],
  },
  {
    id: 'M05', name: 'Show unconfirmed writes optimistically', scenario: 'E06', assertion: 'toContainText',
    edits: [{ file: 'src/useBulkTasks.ts', from: '        const saved = await updateTask', to: '        onSaved({ ...task, status: target })\n        const saved = await updateTask' }],
  },
  {
    id: 'M06', name: 'Count only the most recent retry successes', scenario: 'E07', assertion: 'toHaveText',
    edits: [
      { file: 'src/useBulkTasks.ts', from: '    const previousSuccesses = retry ? result?.successful ?? 0 : 0\n', to: '' },
      { file: 'src/useBulkTasks.ts', from: 'previousSuccesses + batch.length - failed.length', to: 'batch.length - failed.length' },
    ],
  },
  {
    id: 'M07', name: 'Send two writes for each selected ID', scenario: 'E06', assertion: 'toEqual',
    edits: [{ file: 'src/useBulkTasks.ts', from: 'const saved = await updateTask(task.id, { title: task.title, status: target })', to: 'const [saved] = await Promise.all([updateTask(task.id, { title: task.title, status: target }), updateTask(task.id, { title: task.title, status: target })])' }],
  },
  {
    id: 'M08', name: 'Forget selection on a view switch', scenario: 'E01', assertion: 'toBeChecked',
    edits: [{ file: 'src/App.tsx', from: '<ProjectView key={project.id}', to: '<ProjectView key={`${project.id}:${view}`}' }],
  },
  {
    id: 'M09', name: 'Keep the old target after clearing', scenario: 'E03', assertion: 'toHaveValue',
    edits: [{ file: 'src/useBulkTasks.ts', from: "    setSelected([])\n    setTarget('')", to: '    setSelected([])' }],
  },
  {
    id: 'M10', name: 'Keep successfully saved tasks selected', scenario: 'E07', assertion: 'toBeChecked',
    edits: [{ file: 'src/useBulkTasks.ts', from: '    setSelected(failed.map(({ id }) => id))', to: '    setSelected(ids)' }],
  },
]
