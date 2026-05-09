"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Shield,
  Search,
  Filter,
  Plus,
  Eye,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Key,
  AlertCircle,
} from "lucide-react"
import { adminApi } from '@/lib/adminApi'
import type { AdminLicense } from '@/types/admin'

function mapLicenseStatus(status: string): "Ativa" | "Expirada" | "Suspensa" {
  const map: Record<string, "Ativa" | "Expirada" | "Suspensa"> = {
    active: "Ativa",
    expired: "Expirada",
    suspended: "Suspensa",
  }
  return map[status.toLowerCase()] || "Ativa"
}

function mapLicenseType(tipo: string): string {
  const map: Record<string, string> = {
    monthly: "Mensal",
    annual: "Anual",
    trial: "Trial",
    unlimited: "Unlimited",
  }
  return map[tipo.toLowerCase()] || tipo
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return "--"
  return new Date(timestamp).toLocaleDateString("pt-BR")
}

function StatusBadge({ status }: { status: "Ativa" | "Expirada" | "Suspensa" }) {
  if (status === "Ativa") {
    return (
      <Badge className="bg-green-100 text-green-700 border-0 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Ativa
      </Badge>
    )
  }
  if (status === "Expirada") {
    return (
      <Badge className="bg-red-100 text-red-700 border-0 gap-1">
        <XCircle className="h-3 w-3" />
        Expirada
      </Badge>
    )
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-700 border-0 gap-1">
      <AlertCircle className="h-3 w-3" />
      Suspensa
    </Badge>
  )
}

function TipoBadge({ tipo }: { tipo: string }) {
  const styles: Record<string, string> = {
    Trial: "border-blue-200 text-blue-700 bg-blue-50",
    Mensal: "border-purple-200 text-purple-700 bg-purple-50",
    Anual: "border-emerald-200 text-emerald-700 bg-emerald-50",
  }
  return (
    <Badge variant="outline" className={styles[tipo] || "border-gray-200 text-gray-700 bg-gray-50"}>
      {tipo}
    </Badge>
  )
}

function DiasRestantes({ dias, status }: { dias: number | null; status: string }) {
  if (status === "Expirada" || status === "Suspensa") {
    return <span className="text-sm text-gray-400">--</span>
  }
  const d = dias ?? 0
  if (d < 7) {
    return (
      <span className="text-sm font-semibold text-red-600">
        {d} dia{d !== 1 ? "s" : ""}
      </span>
    )
  }
  if (d <= 30) {
    return (
      <span className="text-sm font-semibold text-yellow-600">
        {d} dias
      </span>
    )
  }
  return (
    <span className="text-sm font-semibold text-green-600">{d} dias</span>
  )
}

export default function LicencasPage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("todos")
  const [licenses, setLicenses] = useState<AdminLicense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get<AdminLicense[]>('licenses')
      .then(setLicenses)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const mappedLicenses = licenses.map((l) => ({
    ...l,
    statusLabel: mapLicenseStatus(l.status),
    tipoLabel: mapLicenseType(l.tipo),
  }))

  const totalLicenses = mappedLicenses.length
  const ativas = mappedLicenses.filter((l) => l.statusLabel === "Ativa").length
  const expiradas = mappedLicenses.filter((l) => l.statusLabel === "Expirada").length
  const trialAtivas = mappedLicenses.filter(
    (l) => l.statusLabel === "Ativa" && l.tipo.toLowerCase() === "trial"
  ).length

  const expiringIn7Days = mappedLicenses.filter(
    (l) => l.statusLabel === "Ativa" && l.diasRestantes != null && l.diasRestantes > 0 && l.diasRestantes <= 7
  )

  const filteredLicenses = mappedLicenses.filter((l) => {
    const matchesSearch =
      l.empresa.toLowerCase().includes(search.toLowerCase()) ||
      l.cnpj.includes(search)
    const matchesFilter =
      filterStatus === "todos" || l.statusLabel.toLowerCase() === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Licencas</h1>
            <p className="text-sm text-gray-500">
              Gerencie licencas e acessos das empresas
            </p>
          </div>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
          <Plus className="h-4 w-4" />
          Conceder Licenca
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Licencas</p>
                <p className="text-3xl font-bold text-gray-900">{totalLicenses}</p>
                <p className="text-xs text-gray-500">todas as licencas</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Ativas</p>
                <p className="text-3xl font-bold text-green-600">{ativas}</p>
                <p className="text-xs text-green-600 font-medium">
                  {totalLicenses > 0 ? ((ativas / totalLicenses) * 100).toFixed(1) : 0}% do total
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Expiradas</p>
                <p className="text-3xl font-bold text-red-600">{expiradas}</p>
                <p className="text-xs text-red-600 font-medium">requer ação</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Trial Ativas</p>
                <p className="text-3xl font-bold text-blue-600">{trialAtivas}</p>
                <p className="text-xs text-blue-600 font-medium">oportunidade de conversao</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Alert */}
      {expiringIn7Days.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-yellow-800">
                  {expiringIn7Days.length} licenca(s) expirando nos próximos 7
                  dias
                </p>
                <p className="text-sm text-yellow-600">
                  Entre em contato com os clientes para renovacao
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Licenses Table */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Lista de Licencas
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar empresa ou CNPJ..."
                  className="pl-9 w-full sm:w-[280px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  className="h-9 px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="ativa">Ativa</option>
                  <option value="expirada">Expirada</option>
                  <option value="suspensa">Suspensa</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Expiracao</TableHead>
                <TableHead>Dias Restantes</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.map((license) => (
                <TableRow key={license.emissorId} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium text-gray-900">
                    {license.empresa}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">
                    {license.cnpj}
                  </TableCell>
                  <TableCell>
                    <TipoBadge tipo={license.tipoLabel} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={license.statusLabel} />
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(license.dataInicio)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(license.dataExpiracao)}
                  </TableCell>
                  <TableCell>
                    <DiasRestantes
                      dias={license.diasRestantes}
                      status={license.statusLabel}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver detalhes">
                        <Eye className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Mais opcoes">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
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
