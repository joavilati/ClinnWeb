import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const targetPath = `/v1/admin/${path.join('/')}`
  const url = `${API_BASE_URL}${targetPath}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const adminKey = req.headers.get('X-Admin-Key')
  if (adminKey) {
    headers['X-Admin-Key'] = adminKey
  }

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await req.text()
      if (body) fetchOptions.body = body
    }

    const response = await fetch(url, fetchOptions)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao conectar com o servidor' }, { status: 502 })
  }
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
