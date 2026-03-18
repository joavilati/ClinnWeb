import { proxyToBackend, safeJsonParse } from '@/lib/api-proxy'

export async function GET(request: Request) {
  return proxyToBackend(request, {
    endpoint: '/v1/services',
    method: 'GET',
  })
}

export async function POST(request: Request) {
  const { data: body, error } = await safeJsonParse(request)
  if (error) return error
  return proxyToBackend(request, {
    endpoint: '/v1/services',
    method: 'POST',
    body,
  })
}
