/**
 * Cache local persistente (localStorage).
 * Dados persistem entre sessões e após logout.
 * Usado para: serviços, clientes, configurações, perfil.
 */

const PREFIX = 'clinnota_cache_'

export function getCached<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed.data as T
  } catch {
    return null
  }
}

export function setCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({
      data,
      cachedAt: Date.now(),
    }))
  } catch (e) {
    console.warn('Erro ao salvar cache:', e)
  }
}

export function removeCache(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PREFIX + key)
}

/**
 * Limpa apenas dados voláteis (dashboard, notas).
 * NÃO limpa: serviços, clientes, configurações, perfil.
 */
export function clearVolatileCache(): void {
  if (typeof window === 'undefined') return
  removeCache('dashboard')
  removeCache('notes')
}

// Keys usadas no sistema
export const CACHE_KEYS = {
  SERVICES: 'services',
  CLIENTS: 'clients',
  PROFILE: 'profile',
  TAX_CONFIG: 'tax_configuration',
  NFSE_CONTROL: 'nfse_control',
  DASHBOARD: 'dashboard',
  NOTES: 'notes',
  LICENSE: 'license',
} as const
