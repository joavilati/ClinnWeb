import { proxyToBackend, safeFormDataParse } from '@/lib/api-proxy'

export async function POST(request: Request) {
  const { data: formData, error } = await safeFormDataParse(request)
  if (error) return error
  return proxyToBackend(request, {
    endpoint: '/v1/certificado-digital/multipart',
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
