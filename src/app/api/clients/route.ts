import { proxyToBackend } from '@/lib/api-proxy'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  return proxyToBackend(request, {
    endpoint: '/v1/clients',
    method: 'GET',
    searchParams,
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  return proxyToBackend(request, {
    endpoint: '/v1/clients',
    method: 'POST',
    body,
  })
}
