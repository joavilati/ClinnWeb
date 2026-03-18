import { proxyToBackend, safeJsonParse } from '@/lib/api-proxy'

export async function GET(request: Request) {
  return proxyToBackend(request, {
    endpoint: '/v1/cadastro/emissor',
    method: 'GET',
  })
}

export async function PUT(request: Request) {
  const { data: body, error } = await safeJsonParse(request)
  if (error) return error
  return proxyToBackend(request, {
    endpoint: '/v1/cadastro/emissor',
    method: 'PUT',
    body,
  })
}
