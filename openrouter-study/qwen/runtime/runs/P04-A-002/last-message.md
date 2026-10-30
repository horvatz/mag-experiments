```python
content = """
import { useState, useCallback } from 'react'
import type { SortingState } from './useTaskListConfig'
import { DEFAULT_STATE } from './useTaskListState'

export function useTaskSortState(): [SortingState, (newState: Partial<SortingState>) => void, () => void] {
  const [state, setState] = useState<SortingState>(DEFAULT_STATE)

  const setSorting = useCallback((newState: Partial<SortingState>) => {
    setState(prev => ({ ...prev, ...newState }))
  }, [])

  const resetSorting = useCallback(() => {
    setState({ ...DEFAULT_STATE })
  }, [])

  return [state, setSorting, resetSorting]
}
"""
with open('src/hooks/TaskSortState.ts', 'w') as f:
    f.write(content)
print('Created TaskSortState.ts')
```
