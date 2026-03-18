import { proxyToBackend, safeJsonParse } from '@/lib/api-proxy'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: body, error } = await safeJsonParse(request)
  if (error) return error
  return proxyToBackend(request, {
    endpoint: `/v1/clients/${id}`,
    method: 'PUT',
    body,
  })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyToBackend(request, {
    endpoint: `/v1/clients/${id}`,
    method: 'DELETE',
  })
}
