'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { ThemeToggle } from './ThemeToggle'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
    } catch {
      setIsSigningOut(false)
    }
  }

  const confirmLogout = () => {
    setShowLogoutModal(false)
    handleSignOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED] mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (isSigningOut || (!loading && !user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7C3AED] mx-auto"></div>
          <p className="text-lg font-medium text-foreground mt-4">Saindo do sistema...</p>
          <p className="text-sm text-muted-foreground mt-1">Você será redirecionado em instantes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => setShowLogoutModal(true)}
      />

      {/* Main content */}
      <div className="flex-1 lg:ml-0 flex flex-col">
        {/* Mobile header */}
        <header className="bg-card shadow-sm border-b border-border lg:hidden">
          <div className="px-4 h-16 flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="ml-4 text-lg font-semibold text-[#7C3AED]">ClinNota</span>
            <div className="ml-auto"><ThemeToggle /></div>
          </div>
        </header>

        {/* Desktop header — invisível no claro, faixa sutil no escuro só pra ancorar o toggle */}
        <header className="hidden lg:flex h-14 items-center justify-end px-8 dark:bg-card dark:border-b dark:border-border">
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Modal de Confirmação de Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => setShowLogoutModal(false)}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md transform transition-all z-[10000]">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-950 rounded-full">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-semibold text-foreground">Confirmar Saída</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Tem certeza que deseja sair do sistema?</p>
                </div>
                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-4 py-2 text-foreground border border-border rounded-lg hover:bg-accent transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
