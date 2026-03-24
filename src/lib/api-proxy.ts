import { NextResponse } from 'next/server'

const APP_VERSION = process.env.npm_package_version || '1.0.0'
const AUTH_COOKIE = 'auth_token'
const COOKIE_MAX_AGE = 24 * 60 * 60 // 24h em segundos
const DEFAULT_API_BASE_URL = 'https://api.clinnota.com.br'

/**
 * Define o cookie httpOnly com o token JWT na resposta.
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

/**
 * Remove o cookie httpOnly de autenticação.
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

function generateRequestId(): string {
  return crypto.randomUUID()
}

export interface ProxyOptions {
  endpoint: string
  method?: string
  body?: unknown
  searchParams?: URLSearchParams
  requireAuth?: boolean
  allowedMethods?: string[]
  timeoutMs?: number
}

/**
 * Retorna uma resposta de erro padronizada.
 * Formato: { error: string, code?: string }
 */
function errorResponse(error: string, status: number, code?: string): Response {
  return NextResponse.json({ error, ...(code ? { code } : {}) }, { status })
}

/**
 * Faz parse seguro de request.json(), retornando erro 400 se inválido.
 */
export async function safeJsonParse(request: Request): Promise<{ data?: unknown; error?: Response }> {
  try {
    const data = await request.json()
    return { data }
  } catch {
    return { error: errorResponse('Corpo da requisição inválido (JSON malformado)', 400, 'INVALID_JSON') }
  }
}

/**
 * Faz parse seguro de request.formData(), retornando erro 400 se inválido.
 */
export async function safeFormDataParse(request: Request): Promise<{ data?: FormData; error?: Response }> {
  try {
    const data = await request.formData()
    return { data }
  } catch {
    return { error: errorResponse('Corpo da requisição inválido (FormData malformado)', 400, 'INVALID_FORM_DATA') }
  }
}

/**
 * Proxy requests para o backend API do ClinNota
 */
export async function proxyToBackend(
  request: Request,
  options: ProxyOptions
): Promise<Response> {
  const requestId = request.headers.get('x-request-id') || generateRequestId()

  try {
    const method = (options.method || 'GET').toUpperCase()
    if (options.allowedMethods && !options.allowedMethods.includes(method)) {
      return errorResponse('Method not allowed', 405)
    }

    const apiBase = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL
    if (!apiBase) {
      return errorResponse('API base url not configured', 500, 'API_NOT_CONFIGURED')
    }

    // Tenta Authorization header; se não tiver, lê do cookie httpOnly
    let authHeader = request.headers.get('authorization')
    if (!authHeader) {
      const cookieHeader = request.headers.get('cookie') || ''
      const match = cookieHeader.match(/auth_token=([^;]+)/)
      if (match) {
        authHeader = `Bearer ${match[1]}`
      }
    }

    if (options.requireAuth !== false && !authHeader) {
      return errorResponse('Authorization header required', 401, 'AUTH_REQUIRED')
    }

    const upstreamUrl = new URL(options.endpoint, apiBase)
    if (options.searchParams) {
      options.searchParams.forEach((value, key) =>
        upstreamUrl.searchParams.set(key, value)
      )
    }

    const headers: HeadersInit = {
      Accept: 'application/json',
      'X-Platform': 'web',
      'X-App-Version': APP_VERSION,
      'X-Request-Id': requestId,
    }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000)

    const fetchOptions: RequestInit = {
      method,
      cache: 'no-store',
      headers,
      signal: controller.signal,
    }

    if (options.body && method !== 'GET') {
      const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
      fetchOptions.body = isFormData
        ? options.body as FormData
        : typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body)

      if (!isFormData) {
        ;(headers as Record<string, string>)['Content-Type'] = 'application/json'
      }
    }

    const res = await fetch(upstreamUrl.toString(), fetchOptions)
      .finally(() => clearTimeout(timeout))

    if (!res.ok) {
      const contentType = res.headers.get('content-type')

      try {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json()
          return NextResponse.json(errorData, { status: res.status })
        } else {
          const errorText = await res.text()
          return errorResponse(
            errorText || `Erro ${res.status}: ${res.statusText}`,
            res.status,
            `HTTP_${res.status}`
          )
        }
      } catch {
        return errorResponse(
          `Erro ao consultar ${options.endpoint} (${res.status} ${res.statusText})`,
          502,
          'PROXY_PARSE_ERROR'
        )
      }
    }

    const contentType = res.headers.get('content-type') || ''
    if (res.status === 204 || contentType.length === 0) {
      return new NextResponse(null, { status: res.status })
    }

    if (contentType.includes('application/json')) {
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { 'content-type': contentType }
    })
  } catch (err: unknown) {
    const error = err as Error
    return errorResponse(
      error?.message || 'Erro interno ao fazer proxy',
      error?.name === 'AbortError' ? 504 : 500,
      error?.name === 'AbortError' ? 'TIMEOUT' : 'INTERNAL_ERROR'
    )
  }
}
