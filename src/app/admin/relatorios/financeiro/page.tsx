'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  TrendingUp,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Receipt,
  AlertTriangle,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { adminApi } from "@/lib/adminApi"
import type { AdminDashboard } from "@/types/admin"

// ---------- Static fallback for revenue by plan (not available per-plan from API) ----------

const revenueByPlanData = [
  { plano: "Trial", receita: 0 },
  { plano: "Mensal", receita: 6693 },
  { plano: "Anual", receita: 3197 },
]

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
          {entry.name}: R$ {entry.value.toLocaleString("pt-BR")}
        </p>
      ))}
    </div>
  )
}

// ---------- Helpers ----------

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

// ---------- Page Component ----------

export default function RelatorioFinanceiroPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .get<AdminDashboard>("dashboard")
      .then(setDashboard)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  const receitaMensal = dashboard?.receitaMensal ?? 0
  const totalEmpresasPagas = dashboard
    ? dashboard.licencasAtivas - dashboard.licencasTrial
    : 1
  const ticketMedio = totalEmpresasPagas > 0 ? receitaMensal / totalEmpresasPagas : 0

  // Build monthly comparison from revenueData
  const revenueData = dashboard?.revenueData ?? []
  const monthlyComparisonData = revenueData.map((item, index) => {
    const prev = index > 0 ? revenueData[index - 1].receita : item.receita
    const variacao = prev > 0 ? (((item.receita - prev) / prev) * 100).toFixed(1) : "0"
    return {
      mes: item.month,
      receita: formatCurrency(item.receita),
      variacao: `${Number(variacao) >= 0 ? "+" : ""}${variacao}%`,
      variacaoPositiva: Number(variacao) >= 0,
    }
  })

  const statCards = [
    {
      title: "Receita Total",
      value: formatCurrency(receitaMensal),
      change: "",
      changeType: "positive" as const,
      detail: "receita mensal",
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-50 to-green-50",
    },
    {
      title: "MRR",
      value: formatCurrency(receitaMensal),
      change: "",
      changeType: "positive" as const,
      detail: "receita recorrente",
      icon: TrendingUp,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      title: "Ticket Medio",
      value: formatCurrency(ticketMedio),
      change: "",
      changeType: "positive" as const,
      detail: "por empresa",
      icon: Receipt,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      title: "Inadimplencia",
      value: dashboard ? `${dashboard.licencasSuspensas}` : "0",
      change: "",
      changeType: "negative" as const,
      detail: "licencas suspensas",
      icon: AlertTriangle,
      gradient: "from-red-500 to-rose-500",
      bgGradient: "from-red-50 to-rose-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatorio Financeiro</h1>
          <p className="text-sm text-gray-500">Visao geral das financas da plataforma</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          const isPositive = card.changeType === "positive"
          return (
            <Card
              key={card.title}
              className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-50`} />
              <CardContent className="relative pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    <div className="flex items-center gap-2">
                      {card.change && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {card.change}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{card.detail}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Evolution */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              Evolucao da Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
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
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#gradReceita)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Plan */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              Receita por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByPlanData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="plano" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="receita" name="Receita" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison Table */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Comparativo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Mes</TableHead>
                <TableHead className="font-semibold text-gray-700">Receita</TableHead>
                <TableHead className="font-semibold text-gray-700">Variacao</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyComparisonData.map((row) => (
                <TableRow key={row.mes} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-800">{row.mes}</TableCell>
                  <TableCell className="text-gray-700">{row.receita}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        row.variacaoPositiva ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.variacaoPositiva ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {row.variacao}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
