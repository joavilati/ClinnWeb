/**
 * Cache local persistente (localStorage), escopado por usuário.
 * Limpo em logout e ao trocar de CNPJ — ver `clearAllCache`.
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
  } catch {
    // localStorage cheio ou indisponível — ignora silenciosamente
  }
}

export function removeCache(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PREFIX + key)
}

/**
 * Remove todas as chaves de cache de dados do usuário (`clinnota_cache_*`).
 * Chamado no logout e ao detectar troca de CNPJ no login.
 */
export function clearAllCache(): void {
  if (typeof window === 'undefined') return
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(PREFIX)) keysToRemove.push(key)
  }
  for (const key of keysToRemove) localStorage.removeItem(key)
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
