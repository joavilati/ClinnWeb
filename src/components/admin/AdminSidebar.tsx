'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  CreditCard,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  X,
  ChevronDown,
  TrendingUp,
  Users,
  ArrowLeftRight,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Building2, label: 'Empresas', path: '/admin/empresas' },
  { icon: DollarSign, label: 'Pagamentos', path: '/admin/pagamentos' },
  { icon: CreditCard, label: 'Planos', path: '/admin/planos' },
  { icon: Shield, label: 'Licencas', path: '/admin/licencas' },
]

const relatorioItems = [
  { icon: TrendingUp, label: 'Financeiro', path: '/admin/relatorios/financeiro' },
  { icon: Users, label: 'Crescimento', path: '/admin/relatorios/crescimento' },
  { icon: ArrowLeftRight, label: 'Conversao', path: '/admin/relatorios/conversao' },
  { icon: Activity, label: 'Uso', path: '/admin/relatorios/uso' },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  onLogout: () => void
}

export default function AdminSidebar({ isOpen = true, onClose, onLogout }: AdminSidebarProps) {
  const pathname = usePathname()
  const [relatoriosOpen, setRelatoriosOpen] = useState(pathname.startsWith('/admin/relatórios'))

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') return pathname === '/admin/dashboard' || pathname === '/admin'
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <>
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out',
          'bg-gradient-to-b from-slate-50 via-blue-50/30 to-purple-50/30 border-r border-gray-200',
          'flex flex-col',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200/60 bg-white/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <span className="text-white font-bold text-lg">CN</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg">ClinNota</span>
              <p className="text-xs text-blue-600/70">Admin Panel</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors p-1 hover:bg-white/60 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/40'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-white/70 hover:shadow-sm'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
              </Link>
            )
          })}

          {/* Relatórios submenu */}
          <div>
            <button
              onClick={() => setRelatoriosOpen(!relatoriosOpen)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                pathname.startsWith('/admin/relatórios')
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/40'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/70 hover:shadow-sm'
              )}
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Relatórios</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 ml-auto transition-transform duration-200',
                  relatoriosOpen && 'rotate-180'
                )}
              />
            </button>
            {relatoriosOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                {relatorioItems.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm',
                        active
                          ? 'bg-white text-blue-600 font-semibold shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Configuracoes */}
          <Link
            href="/admin/configuracoes"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
              isActive('/admin/configuracoes')
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/40'
                : 'text-gray-700 hover:text-gray-900 hover:bg-white/70 hover:shadow-sm'
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Configuracoes</span>
            {isActive('/admin/configuracoes') && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
          </Link>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200/60 bg-white/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-3 rounded-xl">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-semibold">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-600 truncate">admin@clinnota.com.br</p>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-red-600 transition-colors p-1"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
