import { proxyToBackend } from '@/lib/api-proxy'

export async function GET(request: Request) {
  return proxyToBackend(request, {
    endpoint: '/v1/tax-configuration',
    method: 'GET',
  })
}

export async function PUT(request: Request) {
  const body = await request.json()
  return proxyToBackend(request, {
    endpoint: '/v1/tax-configuration',
    method: 'PUT',
    body,
  })
}
