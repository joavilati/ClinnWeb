/**
 * License Guard — cache e validação de licença.
 *
 * Armazena endDate e status da licença em localStorage.
 * NÃO bloqueia requisições — apenas mantém o estado atualizado.
 * O bloqueio é feito apenas nas ações: Nova Nota, Duplicar, Cancelar.
 */

const LICENSE_END_KEY = 'clinnota_license_end'
const LICENSE_STATUS_KEY = 'clinnota_license_status'

/**
 * Verifica se a data de expiração em cache já passou (ou se não há cache).
 * Usado pelo interceptor para decidir se precisa chamar /api/license.
 */
export function isLicenseExpired(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(LICENSE_END_KEY)
  if (!stored) return true // Sem cache = precisa verificar
  return Date.now() > parseInt(stored, 10)
}

/**
 * Salva a data de expiração da licença no cache.
 */
export function saveLicenseEndDate(endDate: number | undefined): void {
  if (typeof window === 'undefined' || !endDate) return
  localStorage.setItem(LICENSE_END_KEY, endDate.toString())
}

/**
 * Salva o status da licença (active, expired, suspended).
 */
export function saveLicenseStatus(status: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LICENSE_STATUS_KEY, status.toLowerCase())
}

/**
 * Retorna o status cacheado da licença.
 */
export function getLicenseStatus(): string {
  if (typeof window === 'undefined') return 'unknown'
  return localStorage.getItem(LICENSE_STATUS_KEY) || 'unknown'
}

/**
 * Verifica se a licença está ativa.
 * Retorna true se o status é 'active' ou se ainda não foi verificado ('unknown').
 * Usado pelas telas de Nova Nota, Duplicar e Cancelar para decidir se mostra o modal.
 */
export function isLicenseActive(): boolean {
  if (typeof window === 'undefined') return true
  const status = localStorage.getItem(LICENSE_STATUS_KEY)
  if (!status) return true // Sem info = assume ativo até verificar
  return status === 'active'
}

/**
 * Limpa cache da licença (usado no logout).
 */
export function clearLicenseCache(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LICENSE_END_KEY)
  localStorage.removeItem(LICENSE_STATUS_KEY)
}

/**
 * Endpoints que não devem passar pelo license guard.
 */
export function isSkippedEndpoint(url: string): boolean {
  return url.includes('/api/auth/') || url.includes('/api/license')
}
