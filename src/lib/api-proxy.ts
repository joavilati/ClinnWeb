import { NextResponse } from 'next/server'

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
      return NextResponse.json(
        { message: 'Method not allowed' },
        { status: 405 }
      )
    }

    const apiBase = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL
    if (!apiBase) {
      return NextResponse.json(
        { error: 'API base url not configured' },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('authorization')

    if (options.requireAuth !== false && !authHeader) {
      return NextResponse.json(
        { message: 'Authorization header required' },
        { status: 401 }
      )
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
      'X-App-Version': '1.0.0',
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
          return NextResponse.json(
            {
              message: errorText || `Erro ${res.status}: ${res.statusText}`,
              code: `HTTP_${res.status}`
            },
            { status: res.status }
          )
        }
      } catch {
        return NextResponse.json(
          {
            message: `Erro ao consultar ${options.endpoint} (${res.status} ${res.statusText})`,
            code: 'PROXY_PARSE_ERROR'
          },
          { status: 502 }
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
    return NextResponse.json(
      { error: 'Erro interno ao fazer proxy', detail: error?.message },
      { status: error?.name === 'AbortError' ? 504 : 500 }
    )
  }
}
