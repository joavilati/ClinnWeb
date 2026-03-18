import { NextResponse } from 'next/server'
import { proxyToBackend, clearAuthCookie } from '@/lib/api-proxy'

export async function POST(request: Request) {
  // Faz o proxy para o backend (que invalida o token no server)
  await proxyToBackend(request, {
    endpoint: '/v1/logout',
    method: 'POST',
  }).catch(() => {})

  // Limpa o cookie httpOnly independentemente do resultado do backend
  const response = NextResponse.json({ message: 'Logout realizado' }, { status: 200 })
  clearAuthCookie(response)
  return response
}
