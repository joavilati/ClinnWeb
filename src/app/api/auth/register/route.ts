import { NextResponse } from 'next/server'
import { proxyToBackend, safeJsonParse, setAuthCookie } from '@/lib/api-proxy'

export async function POST(request: Request) {
  const { data: body, error } = await safeJsonParse(request)
  if (error) return error

  const upstreamResponse = await proxyToBackend(request, {
    endpoint: '/v1/register',
    method: 'POST',
    body,
    requireAuth: false,
  })

  if (!upstreamResponse.ok) {
    return upstreamResponse
  }

  const data = await upstreamResponse.json()

  const token =
    data?.token ||
    data?.data?.token ||
    data?.result?.token ||
    data?.accessToken

  const response = NextResponse.json(data, { status: upstreamResponse.status })
  if (token) {
    setAuthCookie(response, token)
  }
  return response
}
