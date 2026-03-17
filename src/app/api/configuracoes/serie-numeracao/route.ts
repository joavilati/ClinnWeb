import { proxyToBackend } from '@/lib/api-proxy'

export async function GET(request: Request) {
  return proxyToBackend(request, {
    endpoint: '/v1/nfse-control',
    method: 'GET',
  })
}

export async function PUT(request: Request) {
  const body = await request.json()
  return proxyToBackend(request, {
    endpoint: '/v1/nfse-control',
    method: 'PUT',
    body,
  })
}
