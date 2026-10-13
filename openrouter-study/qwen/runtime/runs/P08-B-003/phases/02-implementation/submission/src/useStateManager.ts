import { useRef, useSyncExternalStore } from 'react'

interface StateManagerState {
  referenceDate: string | null
  activeFilter: 'all' | 'overdue' | 'today' | 'week' | 'later' | 'done'
  initialized: boolean
}

interface StateManagerActions {
  date: (date: string | null) => void
  filter: (filter: 'all' | 'overdue' | 'today' | 'week' | 'later' | 'done') => void
  refresh: () => void
}

export function createStateManager(initialReferenceDate: string | null = '2026-09-21'): StateManagerState & StateManagerActions {
  let activeFilter: 'all' | 'overdue' | 'today' | 'week' | 'later' | 'done' = 'all'
  if (typeof window !== 'undefined') {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
    activeFilter = (hashParams.get('filter') as any) || 'all'
  }

  const stateRef = useRef<StateManagerState>({
    referenceDate: initialReferenceDate,
    activeFilter,
    initialized: false
  })

  function subscribe(onChange: () => void) {
    const handler = (event: HashChangeEvent) => {
      if (event.newURL) {
        const newParams = new URLSearchParams(event.newURL.split('?')[1] || '')
        const newFilter = newParams.get('filter') as any
        if (newFilter && ['all', 'overdue', 'today', 'week', 'later', 'done'].includes(newFilter)) {
          stateRef.current.activeFilter = newFilter
          onChange()
        }
      }
    }
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }

  function getSnapshot() {
    return stateRef.current
  }

  function state() {
    const result = useSyncExternalStore(subscribe, getSnapshot)
    return result
  }

  return {
    ...state(),
    date: (date: string | null) => {
      stateRef.current.referenceDate = date
    },
    filter: (filter: 'all' | 'overdue' | 'today' | 'week' | 'later' | 'done') => {
      stateRef.current.activeFilter = filter
    },
    refresh: () => {}
  }
}

