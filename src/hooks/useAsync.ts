import { useCallback, useEffect, useRef, useState } from 'react'

interface Settled<T> {
  data: T | null
  error: string | null
  /** Which request produced this result; compared against the current one. */
  forRequest: string | null
}

/**
 * Minimal data-fetching hook over the mock API.
 *
 * Every screen gets Loading / Error / Empty from one place, which is what
 * 00-README.md "Global state patterns" requires. `key` identifies the request —
 * change it (e.g. include a route param) to refetch.
 *
 * `isLoading` is derived rather than set at the top of the effect: a result is
 * pending exactly while the settled result belongs to an older request.
 */
export function useAsync<T>(fetcher: () => Promise<T>, key = '') {
  const [nonce, setNonce] = useState(0)
  const [settled, setSettled] = useState<Settled<T>>({
    data: null,
    error: null,
    forRequest: null,
  })
  const fetcherRef = useRef(fetcher)
  const request = `${key}#${nonce}`

  // Declared first so the ref holds the current closure before the fetch below runs.
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let cancelled = false

    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) setSettled({ data, error: null, forRequest: request })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSettled({
            data: null,
            error: error instanceof Error ? error.message : 'Unable to load this data.',
            forRequest: request,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [request])

  const isLoading = settled.forRequest !== request
  const reload = useCallback(() => setNonce((value) => value + 1), [])

  return {
    data: isLoading ? null : settled.data,
    error: isLoading ? null : settled.error,
    isLoading,
    reload,
  }
}
