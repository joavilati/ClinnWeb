'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Building2,
  Shield,
  DollarSign,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { adminApi } from '@/lib/adminApi'
import type { AdminDashboard } from '@/types/admin'

const PLAN_COLORS: Record<string, string> = {
  Trial: "#3b82f6",
  Mensal: "#8b5cf6",
  Anual: "#22c55e",
}
const DEFAULT_COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444"]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// ---------- Custom Tooltip ----------

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      style={{
        backgroundColor: "white",
        border: "none",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        padding: "12px 16px",
      }}
    >
      <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" && entry.name?.toLowerCase().includes("receit") ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}

// ---------- Page Component ----------

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get<AdminDashboard>('dashboard')
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Erro ao carregar dados do dashboard.</p>
      </div>
    )
  }

  const kpiCards = [
    {
      title: "Empresas Ativas",
      value: String(data.empresasAtivas),
      change: data.novasEmpresasMes > 0 ? `+${data.novasEmpresasMes}` : String(data.novasEmpresasMes),
      changeType: data.novasEmpresasMes >= 0 ? ("positive" as const) : ("negative" as const),
      detail: `${data.totalEmpresas} total`,
      icon: Building2,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      title: "Licenças Ativas",
      value: String(data.licencasAtivas),
      change: data.licencasTrial > 0 ? `${data.licencasTrial} trial` : "0 trial",
      changeType: "positive" as const,
      detail: `${data.licencasExpiradas} expiradas`,
      icon: Shield,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      title: "Receita Mensal (MRR)",
      value: formatCurrency(data.receitaMensal),
      change: "",
      changeType: "positive" as const,
      detail: "",
      icon: DollarSign,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
    },
    {
      title: "Taxa Conversão Trial→Pago",
      value: `${data.taxaConversao}%`,
      change: "",
      changeType: "positive" as const,
      detail: "",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-50 to-green-50",
    },
  ]

  const planDistributionWithColors = data.planDistribution.map((plan, idx) => ({
    ...plan,
    color: PLAN_COLORS[plan.name] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
  }))

  return (
    <div className="space-y-6">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          const isPositive = kpi.changeType === "positive"
          return (
            <Card
              key={kpi.title}
              className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${kpi.bgGradient} opacity-50`}
              />
              <CardContent className="relative pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      {kpi.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {kpi.value}
                    </p>
                    <div className="flex items-center gap-2">
                      {kpi.change && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isPositive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                          {kpi.change}
                        </span>
                      )}
                      {kpi.detail && (
                        <span className="text-xs text-gray-500">
                          {kpi.detail}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${kpi.gradient} shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Chart + Plan Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Evolution */}
        <Card className="xl:col-span-2 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              Evolução da Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenueData}>
                <defs>
                  <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="receita"
                  name="Receita"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#gradReceita)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <PieChartIcon className="w-4 h-4 text-white" />
              </div>
              Distribuição por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={planDistributionWithColors}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {planDistributionWithColors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {planDistributionWithColors.map((plan) => (
                <div key={plan.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: plan.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {plan.name}{" "}
                    <span className="font-semibold text-gray-800">
                      ({plan.value})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
