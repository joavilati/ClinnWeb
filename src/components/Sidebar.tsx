'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  User,
  CreditCard,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Nova Nota', path: '/nova-nota' },
  { icon: Receipt, label: 'Notas Emitidas', path: '/notas-emitidas' },
  { icon: User, label: 'Perfil', path: '/perfil' },
  { icon: CreditCard, label: 'Pagamentos', path: '/pagamentos' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  onLogout: () => void
}

export default function Sidebar({ isOpen = true, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          onClick={onClose}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out',
        'bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED] text-white flex flex-col',
        'lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">ClinNota</h1>
              <p className="text-xs text-purple-100 mt-1">Emissor de Notas de Serviço</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 lg:hidden"
                aria-label="Fechar menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path ||
                (item.path === '/configuracoes' && pathname.startsWith('/configuracoes'))

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={onClose}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                      isActive
                        ? 'bg-white text-[#7C3AED] shadow-md font-medium'
                        : 'text-white hover:bg-white/10'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-purple-500/30">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
