import { proxyToBackend } from '@/lib/api-proxy'

export async function GET(request: Request) {
  return proxyToBackend(request, {
    endpoint: '/v1/services',
    method: 'GET',
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  return proxyToBackend(request, {
    endpoint: '/v1/services',
    method: 'POST',
    body,
  })
}
