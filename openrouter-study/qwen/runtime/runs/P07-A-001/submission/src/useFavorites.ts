import { useEffect, useState, useCallback } from "react"

export function useFavorites() {
  const [favorites, setFavorites] = useState([])
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const KEY = "folio:favorites:v1"

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (!stored) setFavorites([])
      else {
        const parsed = JSON.parse(stored)
        if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.ids)) {
          setFavorites([])
        } else {
          setFavorites([...new Set(parsed.ids)].sort())
        }
      }
    } catch (e) {
      setError("Nedostopna shramba.")
    }
  }, [])

  useEffect(() => {
    const fn = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return
      try {
        const parsed = JSON.parse(e.newValue)
        if (parsed && parsed.version === 1 && Array.isArray(parsed.ids)) {
          setFavorites([...new Set(parsed.ids)].sort())
        } else {
          setFavorites([])
        }
      } catch {
        setFavorites([])
      }
    }
    window.addEventListener("storage", fn)
    return () => window.removeEventListener("storage", fn)
  }, [])

  const store = useCallback((ids: string[]) => {
    if (pending) return
    setPending(true)
    try {
      const normalized = [...new Set(ids)].sort()
      localStorage.setItem(KEY, JSON.stringify({ version: 1, ids: normalized }))
      setFavorites(normalized)
      setError(null)
    } catch (e) {
      setError("Nedostopna shramba.")
    } finally {
      setPending(false)
    }
  }, [pending])

  const removeProject = useCallback((projectId: string) => {
    if (pending) return
    try {
      const current = parseFavoriteIds()
      const filtered = current.filter(id => !id.startsWith(projectId + "-"))
      localStorage.setItem(KEY, JSON.stringify({ version: 1, ids: filtered }))
      setFavorites(filtered)
      setError(null)
    } catch (e) {
      setError("Nedostopna shramba.")
    }
  }, [pending])

  const clear = useCallback(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ version: 1, ids: [] }))
      setFavorites([])
    } catch (e) {
      setError("Nedostopna shramba.")
    }
  }, [])

  function parseFavoriteIds() {
    try {
      const stored = localStorage.getItem(KEY)
      const parsed = JSON.parse(stored || "{}")
      return parsed.ids || []
    } catch {
      return []
    }
  }

  return { favorites, error, isPending: pending, store, removeProject, clear }
}
