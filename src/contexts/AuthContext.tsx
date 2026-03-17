'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { saveToken, clearTokenCache, getCachedToken } from '@/lib/tokenCache'
import { encodePassword } from '@/lib/passwordEncoder'
import { clearVolatileCache } from '@/lib/localCache'
import { clearLicenseCache } from '@/lib/licenseGuard'

interface User {
  id: string
  cnpj: string
  email?: string
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (cnpj: string, password: string) => Promise<void>
  signUp: (cnpj: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Extrai LoginResponse do corpo da resposta.
 * O backend pode retornar:
 *   { token, emissor }
 *   { data: { token, emissor } }
 *   { result: { token, emissor } }
 */
function extractLoginData(body: Record<string, unknown>): { token: string; emissor?: Record<string, unknown> } | null {
  // Direto: { token: "...", emissor: {...} }
  if (typeof body.token === 'string') {
    return { token: body.token, emissor: body.emissor as Record<string, unknown> | undefined }
  }

  // Envelope: { data: { token, emissor } }
  const data = body.data as Record<string, unknown> | undefined
  if (data && typeof data.token === 'string') {
    return { token: data.token, emissor: data.emissor as Record<string, unknown> | undefined }
  }

  // Envelope: { result: { token, emissor } }
  const result = body.result as Record<string, unknown> | undefined
  if (result && typeof result.token === 'string') {
    return { token: result.token, emissor: result.emissor as Record<string, unknown> | undefined }
  }

  // Fallback: procura accessToken
  if (typeof body.accessToken === 'string') {
    return { token: body.accessToken, emissor: body.emissor as Record<string, unknown> | undefined }
  }

  return null
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restaurar sessão ao carregar
  useEffect(() => {
    const restoreSession = () => {
      try {
        const token = getCachedToken()
        if (token) {
          const userId = localStorage.getItem('user_id') || ''
          const userCnpj = localStorage.getItem('user_cnpj') || ''
          const userName = localStorage.getItem('user_name')
          const userEmail = localStorage.getItem('user_email')

          // Basta ter token para restaurar sessão
          setUser({
            id: userId,
            cnpj: userCnpj,
            name: userName || undefined,
            email: userEmail || undefined,
          })
        }
      } catch (e) {
        console.error('Erro ao restaurar sessão:', e)
      }
      setLoading(false)
    }

    restoreSession()
  }, [])

  const signIn = useCallback(async (cnpj: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpj, password: encodePassword(password) }),
    })

    const body = await response.json()

    if (!response.ok) {
      throw new Error(body?.message || body?.error || 'Erro ao fazer login')
    }

    const loginData = extractLoginData(body)
    if (!loginData) {
      console.error('Resposta inesperada do login:', body)
      throw new Error('Resposta inesperada do servidor')
    }

    const emissor = loginData.emissor || {}
    const userId = (emissor.id as string) || ''
    const userName = (emissor.companyName as string) || (emissor.tradeName as string) || ''
    const userEmail = (emissor.email as string) || ''

    // Salvar token
    saveToken(loginData.token)

    // Salvar dados do usuário no localStorage
    localStorage.setItem('user_id', userId)
    localStorage.setItem('user_cnpj', cnpj)
    if (userName) localStorage.setItem('user_name', userName)
    if (userEmail) localStorage.setItem('user_email', userEmail)

    setUser({
      id: userId,
      cnpj,
      name: userName || undefined,
      email: userEmail || undefined,
    })
  }, [])

  const signUp = useCallback(async (cnpj: string, email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpj, email, password: encodePassword(password) }),
    })

    const body = await response.json()

    if (!response.ok) {
      throw new Error(body?.message || body?.error || 'Erro ao criar conta')
    }

    const loginData = extractLoginData(body)
    if (!loginData) {
      console.error('Resposta inesperada do registro:', body)
      throw new Error('Resposta inesperada do servidor')
    }

    const emissor = loginData.emissor || {}
    const userId = (emissor.id as string) || ''

    saveToken(loginData.token)

    localStorage.setItem('user_id', userId)
    localStorage.setItem('user_cnpj', cnpj)
    localStorage.setItem('user_email', email)

    setUser({
      id: userId,
      cnpj,
      email,
    })
  }, [])

  const signOut = useCallback(async () => {
    try {
      const token = getCachedToken()
      if (token) {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => {})
      }
    } finally {
      clearTokenCache()
      clearVolatileCache()
      clearLicenseCache()
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_cnpj')
      localStorage.removeItem('user_name')
      localStorage.removeItem('user_email')
      setUser(null)
    }
  }, [])

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
