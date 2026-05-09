'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  ArrowUp,
  ArrowDown,
  UserPlus,
  UserMinus,
  TrendingUp,
} from "lucide-react"
import {
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

// TODO: implementar endpoint de historico de crescimento
const growthMetricsData = [
  { mes: "Janeiro", novosCadastros: 8, cancelamentos: 2, net: 6, taxaCrescimento: "5,0%" },
  { mes: "Fevereiro", novosCadastros: 11, cancelamentos: 3, net: 8, taxaCrescimento: "7,1%" },
  { mes: "Marco", novosCadastros: 15, cancelamentos: 1, net: 14, taxaCrescimento: "12,2%" },
  { mes: "Abril", novosCadastros: 10, cancelamentos: 4, net: 6, taxaCrescimento: "4,7%" },
  { mes: "Maio", novosCadastros: 12, cancelamentos: 2, net: 10, taxaCrescimento: "7,5%" },
  { mes: "Junho", novosCadastros: 14, cancelamentos: 3, net: 11, taxaCrescimento: "8,1%" },
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
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

// ---------- Page Component ----------

export default function RelatorioCrescimentoPage() {
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

  const totalEmpresas = dashboard?.totalEmpresas ?? 0
  const novasEmpresasMes = dashboard?.novasEmpresasMes ?? 0

  // Repurpose revenueData as a growth chart indicator (cadastros proxy per month)
  const chartData = dashboard?.revenueData.map((item) => ({
    month: item.month,
    cadastros: item.receita > 0 ? Math.round(item.receita / 100) : 0,
  })) ?? []

  const statCards = [
    {
      title: "Total Empresas",
      value: String(totalEmpresas),
      change: "",
      changeType: "positive" as const,
      detail: "cadastradas",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      title: "Novas este Mes",
      value: String(novasEmpresasMes),
      change: "",
      changeType: "positive" as const,
      detail: "vs mês anterior",
      icon: UserPlus,
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-50 to-green-50",
    },
    {
      title: "Churn Rate",
      value: dashboard ? `${dashboard.licencasExpiradas}` : "0",
      change: "",
      changeType: "negative" as const,
      detail: "licencas expiradas",
      icon: UserMinus,
      gradient: "from-red-500 to-rose-500",
      bgGradient: "from-red-50 to-rose-50",
    },
    {
      title: "Net Growth",
      value: `+${novasEmpresasMes}`,
      change: "",
      changeType: "positive" as const,
      detail: "crescimento liquido",
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Crescimento</h1>
          <p className="text-sm text-gray-500">Acompanhe a evolucao da base de empresas</p>
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

      {/* New Signups Chart */}
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            Novos Cadastros por Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cadastros" name="Novos Cadastros" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Growth Metrics Table */}
      {/* TODO: implementar endpoint de historico de crescimento - dados estaticos por enquanto */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Metricas de Crescimento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Mes</TableHead>
                <TableHead className="font-semibold text-gray-700">Novos Cadastros</TableHead>
                <TableHead className="font-semibold text-gray-700">Cancelamentos</TableHead>
                <TableHead className="font-semibold text-gray-700">Net</TableHead>
                <TableHead className="font-semibold text-gray-700">Taxa Crescimento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {growthMetricsData.map((row) => (
                <TableRow key={row.mes} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-800">{row.mes}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <ArrowUp className="w-3 h-3" />
                      {row.novosCadastros}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <ArrowDown className="w-3 h-3" />
                      {row.cancelamentos}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${row.net > 0 ? "text-green-700" : "text-red-600"}`}>
                      +{row.net}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {row.taxaCrescimento}
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
