import { proxyToBackend } from '@/lib/api-proxy'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  return proxyToBackend(request, {
    endpoint: `/v1/services/${id}`,
    method: 'PUT',
    body,
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyToBackend(request, {
    endpoint: `/v1/services/${id}`,
    method: 'DELETE',
  })
}
