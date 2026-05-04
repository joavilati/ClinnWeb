'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeftRight,
  ArrowUp,
  ArrowDown,
  Target,
  Clock,
  CheckCircle,
} from "lucide-react"
import { adminApi } from "@/lib/adminApi"
import type { AdminDashboard } from "@/types/admin"

// Monthly conversion breakdown is not available from the backend yet - keep as static
const monthlyConversionData = [
  { mes: "Janeiro", trials: 32, convertidosMensal: 5, convertidosAnual: 2, taxa: "21,9%" },
  { mes: "Fevereiro", trials: 28, convertidosMensal: 4, convertidosAnual: 1, taxa: "17,9%" },
  { mes: "Marco", trials: 40, convertidosMensal: 7, convertidosAnual: 3, taxa: "25,0%" },
  { mes: "Abril", trials: 35, convertidosMensal: 6, convertidosAnual: 2, taxa: "22,9%" },
  { mes: "Maio", trials: 38, convertidosMensal: 8, convertidosAnual: 1, taxa: "23,7%" },
  { mes: "Junho", trials: 45, convertidosMensal: 18, convertidosAnual: 5, taxa: "51,1%" },
]

// ---------- Page Component ----------

export default function RelatorioConversaoPage() {
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

  const taxaConversao = dashboard?.taxaConversao ?? 0
  const licencasTrial = dashboard?.licencasTrial ?? 0
  const licencasAtivas = dashboard?.licencasAtivas ?? 0

  // Funnel: trials iniciados = current trials + those who already converted (licencasAtivas - licencasTrial)
  const convertidos = licencasAtivas > licencasTrial ? licencasAtivas - licencasTrial : 0
  const trialsIniciados = licencasTrial + convertidos

  const funnelData = [
    { etapa: "Trials Iniciados", valor: trialsIniciados },
    { etapa: "Trials Ativos", valor: licencasTrial },
    { etapa: "Convertidos", valor: convertidos },
  ]

  const statCards = [
    {
      title: "Taxa Conversao",
      value: `${taxaConversao}%`,
      change: "",
      changeType: "positive" as const,
      detail: "trial para pago",
      icon: Target,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      title: "Licencas Ativas",
      value: String(licencasAtivas),
      change: "",
      changeType: "positive" as const,
      detail: "total ativas",
      icon: CheckCircle,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      title: "Trials Ativos",
      value: String(licencasTrial),
      change: "",
      changeType: "positive" as const,
      detail: "em periodo trial",
      icon: ArrowLeftRight,
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-50 to-green-50",
    },
    {
      title: "Tempo Medio",
      value: "4,2 dias",
      change: "",
      changeType: "positive" as const,
      detail: "para converter",
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
          <ArrowLeftRight className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatorio de Conversao</h1>
          <p className="text-sm text-gray-500">Analise de conversao de trials para planos pagos</p>
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

      {/* Conversion Funnel */}
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <Target className="w-4 h-4 text-white" />
            </div>
            Funil de Conversao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {funnelData.map((item, index) => {
              const maxValue = funnelData[0].valor || 1
              const percentage = ((item.valor / maxValue) * 100).toFixed(1)
              const colors = [
                { bg: "bg-blue-500", light: "bg-blue-100", text: "text-blue-700" },
                { bg: "bg-purple-500", light: "bg-purple-100", text: "text-purple-700" },
                { bg: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-700" },
              ]
              const color = colors[index]

              return (
                <div key={item.etapa} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{item.etapa}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900">{item.valor}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${color.light} ${color.text}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full ${color.bg} rounded-full transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {index < funnelData.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Conversion Table */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Conversao Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Mes</TableHead>
                <TableHead className="font-semibold text-gray-700">Trials</TableHead>
                <TableHead className="font-semibold text-gray-700">Convertidos Mensal</TableHead>
                <TableHead className="font-semibold text-gray-700">Convertidos Anual</TableHead>
                <TableHead className="font-semibold text-gray-700">Taxa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyConversionData.map((row) => (
                <TableRow key={row.mes} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-800">{row.mes}</TableCell>
                  <TableCell className="text-gray-700">{row.trials}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                      {row.convertidosMensal}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      {row.convertidosAnual}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      {row.taxa}
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
