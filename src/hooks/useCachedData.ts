import { useState, useEffect, useCallback, useRef } from 'react'
import { getCached, setCache, CACHE_KEYS } from '@/lib/localCache'
import { useApiClient } from '@/hooks/useApiClient'

interface UseCachedDataOptions<T> {
  /** Chave do cache (usar CACHE_KEYS) */
  cacheKey: string
  /** URL da API para buscar dados */
  apiUrl: string
  /** Função para normalizar a resposta da API */
  normalize: (raw: unknown) => T
  /** Se true, persiste no localStorage (sobrevive logout). Default: true */
  persistent?: boolean
}

interface UseCachedDataReturn<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  /** Força refetch da API e atualiza cache */
  reload: () => Promise<void>
  /** Atualiza o cache local (após create/edit/delete) */
  updateCache: (newData: T) => void
}

/**
 * Hook que implementa cache-first strategy:
 * 1. Mostra dados do localStorage imediatamente (se existem)
 * 2. Se não tem cache, busca da API
 * 3. Botão reload força refetch da API
 * 4. Após mutações, updateCache atualiza o local
 */
export function useCachedData<T>({
  cacheKey,
  apiUrl,
  normalize,
  persistent = true,
}: UseCachedDataOptions<T>): UseCachedDataReturn<T> {
  const { apiFetch } = useApiClient()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)

  // 1. Carregar do cache no mount
  useEffect(() => {
    if (persistent) {
      const cached = getCached<T>(cacheKey)
      if (cached) {
        setData(cached)
        setIsLoading(false)
        hasFetchedRef.current = true
        return
      }
    }
    // Se não tem cache, busca da API
    fetchFromApi()
  }, [cacheKey])

  const fetchFromApi = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiFetch(apiUrl)
      if (!res.ok) {
        throw new Error(`Erro ${res.status}`)
      }
      const raw = await res.json()
      const normalized = normalize(raw)
      setData(normalized)
      if (persistent) {
        setCache(cacheKey, normalized)
      }
      hasFetchedRef.current = true
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar dados'
      // Se já tem dados (cache ou fetch anterior), mantém os dados e não seta erro.
      // Só mostra erro se nunca teve dados.
      if (!hasFetchedRef.current) {
        setError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }, [apiUrl, cacheKey, normalize, persistent, apiFetch])

  const reload = useCallback(async () => {
    await fetchFromApi()
  }, [fetchFromApi])

  const updateCache = useCallback((newData: T) => {
    setData(newData)
    if (persistent) {
      setCache(cacheKey, newData)
    }
  }, [cacheKey, persistent])

  return { data, isLoading, error, reload, updateCache }
}
