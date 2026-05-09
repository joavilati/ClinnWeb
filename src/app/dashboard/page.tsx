'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, DollarSign, XCircle, CheckCircle, TrendingUp, ArrowUpRight, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useCachedData } from '@/hooks/useCachedData'
import { normalizeDashboard } from '@/lib/normalizers'
import { CACHE_KEYS } from '@/lib/localCache'
import { toast } from 'sonner'
import type { DashboardData, DashboardMetric } from '@/types'

function formatCurrency(value: number | string | undefined | null): string {
  if (value == null) return 'R$ 0,00'
  if (typeof value === 'string') return value
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatMetricValue(metric: DashboardMetric | undefined, type: 'currency' | 'count' | 'percent'): string {
  if (!metric) return type === 'currency' ? 'R$ 0,00' : '0'
  const val = metric.value
  if (type === 'currency') return formatCurrency(val)
  if (type === 'percent') return typeof val === 'number' ? `${val}%` : String(val ?? 0)
  return String(val ?? 0)
}

function formatChange(change: number | undefined | null): string {
  if (change == null) return '+0%'
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change}%`
}

// Skeleton components
function StatCardSkeleton() {
  return (
    <Card className="relative overflow-hidden shadow-lg border border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
          <div className="w-10 h-4 rounded bg-muted animate-pulse" />
        </div>
        <div className="w-24 h-4 rounded bg-muted animate-pulse mb-2" />
        <div className="w-32 h-8 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton({ height = 'h-80' }: { height?: string }) {
  return (
    <div className={`${height} flex items-center justify-center`}>
      <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
    </div>
  )
}

function RecentNoteSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-background border border-border animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="w-16 h-5 rounded-full bg-muted" />
        <div className="w-14 h-5 rounded-full bg-muted" />
      </div>
      <div className="w-36 h-4 rounded bg-muted mb-2" />
      <div className="flex items-center justify-between">
        <div className="w-20 h-4 rounded bg-muted" />
        <div className="w-20 h-3 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [reloading, setReloading] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const chartGrid = isDark ? '#2A2A30' : '#f0f0f0'
  const chartAxis = isDark ? '#a3a3a8' : '#888888'
  const tooltipStyle = {
    backgroundColor: isDark ? '#1A1A1F' : 'white',
    border: `1px solid ${isDark ? '#3A3A42' : '#e0e0e0'}`,
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    color: isDark ? '#F7F7F8' : '#1A1A1F',
  }
  const dotStrokeColor = isDark ? '#1A1A1F' : 'white'
  const { data, error, isLoading, reload } = useCachedData<DashboardData>({
    cacheKey: CACHE_KEYS.DASHBOARD,
    apiUrl: '/api/dashboard',
    normalize: normalizeDashboard,
  })

  const statsConfig = [
    {
      key: 'notasEmitidas' as const,
      title: 'Notas Emitidas',
      icon: FileText,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      type: 'count' as const,
    },
    {
      key: 'receitaTotal' as const,
      title: 'Receita Total',
      icon: DollarSign,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-green-600',
      type: 'currency' as const,
    },
    {
      key: 'notasCanceladas' as const,
      title: 'Notas Canceladas',
      icon: XCircle,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      textColor: 'text-red-600',
      type: 'count' as const,
    },
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header with gradient */}
            <div className="mb-8 relative">
              <div className="hidden dark:block absolute inset-0 bg-[#7C3AED]/10 rounded-3xl -z-10"></div>
              <div className="py-6 px-6">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Dashboard</h1>
                  <button onClick={async () => { setReloading(true); await reload(); setReloading(false); toast.success('Dados atualizados') }} disabled={reloading} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-[#7C3AED] transition-colors disabled:opacity-50" title="Recarregar" aria-label="Recarregar dados"><RefreshCw className={`w-5 h-5 ${reloading ? 'animate-spin' : ''}`} /></button>
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span>Visão geral do seu negócio</span>
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Atualizado agora</span>
                </p>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
                : statsConfig.map((stat) => {
                    const Icon = stat.icon
                    const metric: DashboardMetric | undefined = data?.[stat.key]
                    const displayValue = metric
                      ? formatMetricValue(metric, stat.type)
                      : '-'
                    const change = metric?.change ?? 0
                    const trend = change >= 0 ? 'up' : 'down'

                    return (
                      <Card
                        key={stat.key}
                        className="relative overflow-hidden shadow-lg border border-border hover:shadow-xl transition-all duration-300 group cursor-pointer"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-muted/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                        <CardContent className="p-6 relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`${stat.color} p-3 rounded-xl shadow-md`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div
                              className={`flex items-center gap-1 text-xs font-semibold ${
                                trend === 'up' ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              <ArrowUpRight
                                className={`w-3 h-3 ${trend === 'down' ? 'rotate-90' : ''}`}
                              />
                              {formatChange(change)}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                          <p className={`text-3xl font-bold ${stat.textColor}`}>{displayValue}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              {/* Line Chart */}
              <Card className="shadow-lg border border-border">
                <CardHeader className="border-b dark:bg-muted/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Evolução de Receita</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Últimos 6 meses</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <ChartSkeleton />
                  ) : !data?.monthlyData || data.monthlyData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-medium">Sem dados de receita</p>
                        <p className="text-sm mt-1">Os dados aparecerão quando houver notas emitidas</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.monthlyData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                          <XAxis dataKey="month" stroke={chartAxis} />
                          <YAxis stroke={chartAxis} />
                          <Tooltip
                            contentStyle={tooltipStyle}
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#7C3AED"
                            strokeWidth={3}
                            fill="url(#colorValue)"
                            dot={{ fill: '#7C3AED', r: 6, strokeWidth: 2, stroke: dotStrokeColor }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Bottom Bar Chart */}
            <Card className="shadow-lg border border-border">
              <CardHeader className="border-b dark:bg-muted/40">
                <CardTitle className="text-xl">Notas Emitidas por Mês</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Quantidade de notas</p>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <ChartSkeleton height="h-64" />
                ) : !data?.monthlyData || data.monthlyData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium">Sem dados mensais</p>
                      <p className="text-sm mt-1">Os dados aparecerão conforme notas forem emitidas</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                        <XAxis dataKey="month" stroke={chartAxis} />
                        <YAxis stroke={chartAxis} />
                        <Tooltip
                          contentStyle={tooltipStyle}
                        />
                        <Bar dataKey="value" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
