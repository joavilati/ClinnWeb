import { proxyToBackend } from '@/lib/api-proxy'

export async function POST(request: Request) {
  const formData = await request.formData()
  return proxyToBackend(request, {
    endpoint: '/v1/certificado-digital',
    method: 'POST',
    body: formData,
  })
}

export async function GET(request: Request) {
  return proxyToBackend(request, {
    endpoint: '/v1/certificado-digital',
    method: 'GET',
  })
}
