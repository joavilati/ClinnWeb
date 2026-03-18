import {
  isLicenseExpired,
  isSkippedEndpoint,
  saveLicenseEndDate,
  saveLicenseStatus,
} from '@/lib/licenseGuard'
import { clearSession } from '@/lib/tokenCache'

/**
 * Promise compartilhada para evitar múltiplas verificações simultâneas de licença.
 */
let licenseCheckPromise: Promise<void> | null = null

/**
 * Verifica licença no servidor e atualiza o cache local.
 */
async function refreshLicenseStatus(): Promise<void> {
  if (licenseCheckPromise) return licenseCheckPromise

  licenseCheckPromise = (async () => {
    try {
      // Cookie httpOnly é enviado automaticamente pelo browser
      const res = await fetch('/api/license')
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
 * Com httpOnly cookies, o token é enviado automaticamente pelo browser.
 * O hook agora foca apenas em:
 * - Content-Type management
 * - License guard
 * - 401/402 handling
 */
export function useApiClient() {
  const apiFetch = async (url: string, options?: RequestInit) => {
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string> || {})
    }

    // Ajusta Content-Type quando o body não é FormData
    const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    // License guard: verifica e ATUALIZA status, mas NÃO bloqueia
    if (!isSkippedEndpoint(url) && isLicenseExpired()) {
      await refreshLicenseStatus()
    }

    const response = await fetch(url, {
      ...options,
      headers,
      // credentials: 'same-origin' é o default — cookies são enviados automaticamente
    })

    // 401 = sessão expirada (cookie expirou ou token inválido)
    if (response.status === 401 && !isSkippedEndpoint(url)) {
      clearSession()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    if (response.status === 402) {
      saveLicenseStatus('expired')
    }

    return response
  }

  return { apiFetch }
}
