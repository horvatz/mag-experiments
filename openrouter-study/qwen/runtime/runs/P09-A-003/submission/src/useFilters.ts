import { useState, useEffect } from 'react'
import { useViewHistory } from '../viewStorage'

export interface ViewState {
  q: string
  status: "all" | "todo" | "in_progress" | "done"
  order: "original" | "title-asc" | "title-desc"
}

export type NormalizedFilters = {
  q: string
  status: string
  order: string
  viewMode: "table" | "board"
}

const normalizeQuery = (q: string): string => {
  return q
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export const useFilters = (projectId?: string) => {
  const [viewState, setViewState] = useState<ViewState>(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.split('?')[1] ?? '')
    
    let q = params.get('q') || ''
    let status = params.get('status') || 'all'
    let order = params.get('order') || 'original'
    
    // Default values
    if (!status || !["all", "todo", "in_progress", "done"].includes(status)) {
      status = 'all'
    }
    if (!order || !["original", "title-asc", "title-desc"].includes(order)) {
      order = 'original'
    }
    
    return { q, status, order }
  })

  const [internalDraft, setInternalDraft] = useState<{
    q?: string
    status?: string
    order?: string
  } | null>(null)

  useEffect(() => {
    const checkDraft = () => {
      const key = `view.${projectId}`
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.type === 'draft') {
          setInternalDraft(parsed.meta)
          setViewState(prev => ({ ...prev, ...parsed.meta }))
        }
      }
    }
    
    checkDraft()
    
    window.addEventListener('storage', checkDraft)
    window.addEventListener('hashchange', () => {
      // Reset draft on hash change (new view/opened)
      setInternalDraft(null)
    })
    
    return () => {
      window.removeEventListener('storage', checkDraft)
      if (projectId) {
        localStorage.removeItem(`view.${projectId}`)
      }
    }
  }, [projectId])

  const update = (newValues: Partial<{ q: string; status: string; order: string }>) => {
    setViewState(prev => {
      let { q: query, status, order } = prev
      if (newValues.q !== undefined) {
        query = normalizeQuery(newValues.q)
        if (query === prev.q) query = newValues.q
      }
      if (newValues.status !== undefined) status = newValues.status
      if (newValues.order !== undefined) order = newValues.order
      return { q: query, status, order }
    })
  }

  const applyAll = (values: { q: string; status: string; order: string }) => {
    commit(values)
  }

  const clearDrafts = () => {
    window.removeEventListener('storage', checkDraft)
    if (projectId) {
      localStorage.removeItem(`view.${projectId}`)
    }
    setInternalDraft(null)
    setViewState({ q: '', status: 'all', order: 'original' })
  }

  const reset = () => {
    clearDrafts()
    setViewState({ q: '', status: 'all', order: 'original' })
  }

  const commit = (values: ViewState) => {
    commitToStorage(values)
    setInternalDraft(null)
  }

  const commitToStorage = (filters: ViewState) => {
    const key = `view.${projectId}`
    const hasCommittedBefore = localStorage.getItem(key)
    if (hasCommittedBefore) return

    const hasChanges = filters.q !== '' || filters.status !== 'all' || filters.order !== 'original'
    if (!hasChanges) {
      applyReset()
      return
    }

    localStorage.setItem(key, JSON.stringify({ type: 'draft', meta: { q: filters.q, status: filters.status, order: filters.order } }))
    
    const projectId = window.location.hash.split('/projects/')[1]?.replace('?', )
    projectViews.set(projectId || 'web', { q: filters.q, status: filters.status, order: filters.order })
  }

  const applyReset = () => {
    if (projectId) {
      localStorage.removeItem(`view.${projectId}`)
    }
    setViewState({ q: '', status: 'all', order: 'original' })
  }

  const getParams = () => {
    const { q, status, order } = internalDraft || viewState
    const params = []
    if (q) params.push(`q=${encodeURIComponent(q)}`)
    if (status !== 'all') params.push(`status=${encodeURIComponent(status)}`)
    if (order !== 'original') params.push(`order=${encodeURIComponent(order)}`)
    return params
  }

  return {
    viewState,
    internalDraft,
    update,
    applyAll,
    clearDrafts,
    reset,
    getParams,
    commit
  }
}