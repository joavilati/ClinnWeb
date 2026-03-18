'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as Sentry from '@sentry/nextjs'
import { hasSession, clearSession } from '@/lib/tokenCache'
import { encodePassword } from '@/lib/passwordEncoder'
import { clearVolatileCache } from '@/lib/localCache'
import { clearLicenseCache } from '@/lib/licenseGuard'
import { STORAGE_KEYS } from '@/lib/constants'

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
 * Extrai dados do emissor da resposta de login/registro.
 * Suporta múltiplos formatos: { emissor }, { data: { emissor } }, { result: { emissor } }
 */
function extractEmissor(body: Record<string, unknown>): Record<string, unknown> {
  const emissor =
    (body.emissor as Record<string, unknown>) ||
    ((body.data as Record<string, unknown>)?.emissor as Record<string, unknown>) ||
    ((body.result as Record<string, unknown>)?.emissor as Record<string, unknown>) ||
    {}
  return emissor
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restaurar sessão do localStorage ao carregar
  useEffect(() => {
    try {
      if (hasSession()) {
        setUser({
          id: localStorage.getItem(STORAGE_KEYS.USER_ID) || '',
          cnpj: localStorage.getItem(STORAGE_KEYS.USER_CNPJ) || '',
          name: localStorage.getItem(STORAGE_KEYS.USER_NAME) || undefined,
          email: localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || undefined,
        })
      }
    } catch (e) {
      Sentry.captureException(e)
    }
    setLoading(false)
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

    // O token é salvo automaticamente como httpOnly cookie pelo servidor.
    // Aqui salvamos apenas dados do usuário no localStorage.
    const emissor = extractEmissor(body)
    const userId = (emissor.id as string) || ''
    const userName = (emissor.companyName as string) || (emissor.tradeName as string) || ''
    const userEmail = (emissor.email as string) || ''

    localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
    localStorage.setItem(STORAGE_KEYS.USER_CNPJ, cnpj)
    if (userName) localStorage.setItem(STORAGE_KEYS.USER_NAME, userName)
    if (userEmail) localStorage.setItem(STORAGE_KEYS.USER_EMAIL, userEmail)

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

    const emissor = extractEmissor(body)
    const userId = (emissor.id as string) || ''

    localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
    localStorage.setItem(STORAGE_KEYS.USER_CNPJ, cnpj)
    localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email)

    setUser({
      id: userId,
      cnpj,
      email,
    })
  }, [])

  const signOut = useCallback(async () => {
    try {
      // O servidor limpa o cookie httpOnly
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    } finally {
      clearSession()
      clearVolatileCache()
      clearLicenseCache()
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
