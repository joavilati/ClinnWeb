import { proxyToBackend } from '@/lib/api-proxy'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  return proxyToBackend(request, {
    endpoint: '/v1/notes',
    method: 'GET',
    searchParams,
  })
}
