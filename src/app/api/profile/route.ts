import { proxyToBackend } from '@/lib/api-proxy'

export async function GET(request: Request) {
  return proxyToBackend(request, {
    endpoint: '/v1/cadastro/emissor',
    method: 'GET',
  })
}

export async function PUT(request: Request) {
  const body = await request.json()
  return proxyToBackend(request, {
    endpoint: '/v1/cadastro/emissor',
    method: 'POST',
    body,
  })
}
