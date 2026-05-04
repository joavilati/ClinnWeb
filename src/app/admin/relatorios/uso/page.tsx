'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Activity,
  ArrowUp,
  ArrowDown,
  FileText,
  Building2,
  ShieldCheck,
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

// TODO: implementar endpoint de emissao de NFS-e e top empresas - dados estaticos por enquanto
const weeklyEmissionData = [
  { semana: "Sem 1", emissoes: 280 },
  { semana: "Sem 2", emissoes: 310 },
  { semana: "Sem 3", emissoes: 295 },
  { semana: "Sem 4", emissoes: 349 },
]

const topCompaniesData = [
  {
    empresa: "Clinica Saude Total",
    nfseEmitidas: 87,
    clientes: 234,
    servicos: 12,
    ultimoAcesso: "Hoje, 14:32",
  },
  {
    empresa: "Odonto Premium",
    nfseEmitidas: 72,
    clientes: 189,
    servicos: 8,
    ultimoAcesso: "Hoje, 13:15",
  },
  {
    empresa: "Fisio Center",
    nfseEmitidas: 65,
    clientes: 156,
    servicos: 6,
    ultimoAcesso: "Hoje, 12:48",
  },
  {
    empresa: "Estetica Bella Vida",
    nfseEmitidas: 58,
    clientes: 142,
    servicos: 10,
    ultimoAcesso: "Hoje, 11:20",
  },
  {
    empresa: "Nutri Clinica Plus",
    nfseEmitidas: 51,
    clientes: 98,
    servicos: 5,
    ultimoAcesso: "Ontem, 18:45",
  },
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

export default function RelatorioUsoPage() {
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
  const empresasAtivas = dashboard?.empresasAtivas ?? 0

  const statCards = [
    {
      title: "NFS-e Emitidas",
      value: "1.234",
      change: "+18%",
      changeType: "positive" as const,
      detail: "total",
      icon: FileText,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      // TODO: implementar endpoint de contagem total de NFS-e
    },
    {
      title: "Media por Empresa",
      value: "9,7",
      change: "+2,1",
      changeType: "positive" as const,
      detail: "notas/empresa",
      icon: Activity,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      // TODO: implementar endpoint de media de NFS-e por empresa
    },
    {
      title: "Empresas Ativas",
      value: String(empresasAtivas),
      change: "",
      changeType: "positive" as const,
      detail: `de ${totalEmpresas} total`,
      icon: Building2,
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-50 to-green-50",
    },
    {
      title: "Certificados Validos",
      value: "98",
      change: "+2",
      changeType: "positive" as const,
      detail: "certificados A1",
      icon: ShieldCheck,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      // TODO: implementar endpoint de contagem de certificados
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatorio de Uso</h1>
          <p className="text-sm text-gray-500">Monitoramento de atividade e utilizacao da plataforma</p>
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

      {/* NFS-e Emission Chart */}
      {/* TODO: implementar endpoint de emissao de NFS-e semanal */}
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Emissao de NFS-e por Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyEmissionData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="semana" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="emissoes" name="NFS-e Emitidas" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 5 Companies Table */}
      {/* TODO: implementar endpoint de top empresas mais ativas */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Top 5 Empresas Mais Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Empresa</TableHead>
                <TableHead className="font-semibold text-gray-700">NFS-e Emitidas</TableHead>
                <TableHead className="font-semibold text-gray-700">Clientes</TableHead>
                <TableHead className="font-semibold text-gray-700">Servicos</TableHead>
                <TableHead className="font-semibold text-gray-700">Ultimo Acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCompaniesData.map((row, index) => (
                <TableRow key={row.empresa} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                        {index + 1}
                      </span>
                      {row.empresa}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-gray-900">{row.nfseEmitidas}</span>
                  </TableCell>
                  <TableCell className="text-gray-700">{row.clientes}</TableCell>
                  <TableCell className="text-gray-700">{row.servicos}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                      {row.ultimoAcesso}
                    </Badge>
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
