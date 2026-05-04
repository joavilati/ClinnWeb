const ADMIN_STORAGE_KEY = 'admin_token'

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ADMIN_STORAGE_KEY)
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_STORAGE_KEY, token)
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_STORAGE_KEY)
}

export async function adminFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const token = getAdminToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'X-Admin-Key': token } : {}),
  }

  const res = await fetch(`/api/admin/${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string> || {}),
    },
  })

  if (res.status === 401 || res.status === 403) {
    clearAdminToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

// Convenience methods
export const adminApi = {
  get: <T = unknown>(path: string) => adminFetch<T>(path),

  post: <T = unknown>(path: string, body?: unknown) =>
    adminFetch<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    }),

  patch: <T = unknown>(path: string, body?: unknown) =>
    adminFetch<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    }),

  delete: <T = unknown>(path: string) =>
    adminFetch<T>(path, { method: 'DELETE' }),
}
