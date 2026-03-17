import { proxyToBackend } from '@/lib/api-proxy'

export async function POST(request: Request) {
  const body = await request.json()
  return proxyToBackend(request, {
    endpoint: '/v1/login',
    method: 'POST',
    body,
    requireAuth: false,
  })
}
