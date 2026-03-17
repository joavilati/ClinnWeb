import { getCachedToken, invalidateTokenCache } from '@/lib/tokenCache'
import {
  isLicenseExpired,
  isSkippedEndpoint,
  saveLicenseEndDate,
  saveLicenseStatus,
} from '@/lib/licenseGuard'

/**
 * Promise compartilhada para evitar múltiplas verificações simultâneas de licença.
 */
let licenseCheckPromise: Promise<void> | null = null

/**
 * Verifica licença no servidor e atualiza o cache local.
 * NÃO bloqueia — apenas salva o status para consulta pelas telas.
 */
async function refreshLicenseStatus(authHeader?: string): Promise<void> {
  if (licenseCheckPromise) return licenseCheckPromise

  licenseCheckPromise = (async () => {
    try {
      const headers: Record<string, string> = {}
      if (authHeader) headers['Authorization'] = authHeader

      const res = await fetch('/api/license', { headers })
      if (!res.ok) return

      const body = await res.json()
      const license = body?.data ?? body
      const status = license?.status?.toLowerCase()

      if (status === 'active') {
        saveLicenseEndDate(license.endDate)
        saveLicenseStatus('active')
      } else {
        saveLicenseStatus(status || 'expired')
      }
    } catch {
      // Erro de rede — não altera o estado
    } finally {
      licenseCheckPromise = null
    }
  })()

  return licenseCheckPromise
}

/**
 * Hook para fazer chamadas de API autenticadas.
 *
 * O interceptor verifica a licença e ATUALIZA o status em cache,
 * mas NÃO bloqueia requisições nem redireciona.
 * O bloqueio é feito apenas nas telas: Nova Nota, Duplicar, Cancelar.
 */
export function useApiClient() {
  const apiFetch = async (url: string, options?: RequestInit) => {
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string> || {})
    }

    // Anexa Authorization: Bearer <token>
    const token = getCachedToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Ajusta Content-Type quando o body não é FormData
    const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    // License guard: verifica e ATUALIZA status, mas NÃO bloqueia
    if (!isSkippedEndpoint(url) && isLicenseExpired()) {
      await refreshLicenseStatus(headers['Authorization'])
    }

    const fetchWithHeaders = (finalHeaders: Record<string, string>) =>
      fetch(url, {
        ...options,
        headers: finalHeaders
      })

    let response = await fetchWithHeaders(headers)

    // Revalida token em caso de 401
    if (response.status === 401) {
      invalidateTokenCache()
      const retryToken = getCachedToken()
      if (retryToken) {
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${retryToken}`
        }
        response = await fetchWithHeaders(retryHeaders)
      }
    }

    // 402 do backend: apenas atualiza status, NÃO redireciona
    if (response.status === 402) {
      saveLicenseStatus('expired')
    }

    return response
  }

  return { apiFetch }
}
