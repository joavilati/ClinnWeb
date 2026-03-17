import { proxyToBackend } from '@/lib/api-proxy'

export async function PUT(request: Request) {
  const body = await request.json()
  return proxyToBackend(request, {
    endpoint: '/v1/new-password',
    method: 'POST',
    body,
  })
}
