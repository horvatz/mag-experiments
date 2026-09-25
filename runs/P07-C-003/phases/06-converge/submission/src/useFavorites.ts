import { useEffect, useRef, useState } from 'react'

const storageKey = 'folio:favorites:v1'

function decode(raw: string | null): Set<string> {
  try {
    const value: unknown = raw === null ? null : JSON.parse(raw)
    if (typeof value !== 'object' || value === null || !('version' in value) || value.version !== 1 || !('ids' in value) || !Array.isArray(value.ids) || !value.ids.every((id): id is string => typeof id === 'string')) return new Set()
    return new Set(value.ids)
  } catch {
    return new Set()
  }
}

function readInitial() {
  try {
    return { ids: decode(window.localStorage.getItem(storageKey)), unavailable: false }
  } catch {
    return { ids: new Set<string>(), unavailable: true }
  }
}

export function useFavorites() {
  const [initial] = useState(readInitial)
  const [ids, setIds] = useState(initial.ids)
  const [unavailable, setUnavailable] = useState(initial.unavailable)
  // Event handlers share the latest value even before React renders again.
  const current = useRef(initial.ids)

  useEffect(() => {
    function receive(event: StorageEvent) {
      if (event.key !== storageKey) return
      const next = decode(event.newValue)
      current.current = next
      setIds(next)
    }
    window.addEventListener('storage', receive)
    return () => window.removeEventListener('storage', receive)
  }, [])

  function commit(next: Set<string>) {
    current.current = next
    setIds(next)
    // Only local actions persist; initialization and storage events never write.
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ids: [...next].sort() }))
    } catch {
      setUnavailable(true)
    }
  }

  function toggle(id: string) {
    const next = new Set(current.current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    commit(next)
  }

  function remove(projectIds: string[]) {
    const next = new Set(current.current)
    for (const id of projectIds) next.delete(id)
    commit(next)
  }

  return { ids, unavailable, toggle, remove }
}
