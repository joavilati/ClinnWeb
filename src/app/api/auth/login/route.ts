import { NextResponse } from 'next/server'
import { proxyToBackend, safeJsonParse, setAuthCookie } from '@/lib/api-proxy'

export async function POST(request: Request) {
  const { data: body, error } = await safeJsonParse(request)
  if (error) return error

  const upstreamResponse = await proxyToBackend(request, {
    endpoint: '/v1/login',
    method: 'POST',
    body,
    requireAuth: false,
  })

  // Se não foi sucesso, retorna o erro normalmente
  if (!upstreamResponse.ok) {
    return upstreamResponse
  }

  // Extrai o body da resposta do backend
  const data = await upstreamResponse.json()

  // Procura o token na resposta (suporta múltiplos formatos do backend)
  const token =
    data?.token ||
    data?.data?.token ||
    data?.result?.token ||
    data?.accessToken

  // Cria a resposta com o cookie httpOnly
  const response = NextResponse.json(data, { status: 200 })
  if (token) {
    setAuthCookie(response, token)
  }
  return response
}
