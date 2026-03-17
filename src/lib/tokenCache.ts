interface TokenCache {
  token: string | null
  expiresAt: number
}

let tokenCache: TokenCache = {
  token: null,
  expiresAt: 0
}

const REFRESH_MARGIN_MS = 5 * 60 * 1000

/**
 * Obtém o token JWT do localStorage com cache inteligente.
 */
export function getCachedToken(): string | null {
  const now = Date.now()

  if (tokenCache.token && tokenCache.expiresAt > now + REFRESH_MARGIN_MS) {
    return tokenCache.token
  }

  // Tenta recuperar do localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth_token')
    const expiresAt = localStorage.getItem('auth_token_expires_at')

    if (stored && expiresAt) {
      const expiry = parseInt(expiresAt, 10)
      if (expiry > now) {
        tokenCache = { token: stored, expiresAt: expiry }
        return stored
      } else {
        // Token expirado, limpar
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_token_expires_at')
        localStorage.removeItem('user_id')
      }
    }
  }

  tokenCache = { token: null, expiresAt: 0 }
  return null
}

/**
 * Salva o token JWT no cache e localStorage.
 */
export function saveToken(token: string, expiresInMs: number = 24 * 60 * 60 * 1000): void {
  const expiresAt = Date.now() + expiresInMs
  tokenCache = { token, expiresAt }

  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_token_expires_at', expiresAt.toString())
  }
}

/**
 * Limpa o cache do token.
 */
export function clearTokenCache(): void {
  tokenCache = { token: null, expiresAt: 0 }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_token_expires_at')
    localStorage.removeItem('user_id')
  }
}

/**
 * Força refresh do token na próxima chamada.
 */
export function invalidateTokenCache(): void {
  tokenCache.expiresAt = 0
}
