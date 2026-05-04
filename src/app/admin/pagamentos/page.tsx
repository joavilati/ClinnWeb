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
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  XCircle,
  Eye,
  MoreVertical,
  AlertTriangle,
} from "lucide-react"
import { adminApi } from '@/lib/adminApi'
import type { AdminPayment } from '@/types/admin'

function mapPaymentStatus(status: string): "Pago" | "Pendente" | "Vencido" {
  const map: Record<string, "Pago" | "Pendente" | "Vencido"> = {
    completed: "Pago",
    pending: "Pendente",
    failed: "Vencido",
  }
  return map[status.toLowerCase()] || "Pendente"
}

function mapLicenseType(tipo: string): string {
  const map: Record<string, string> = {
    monthly: "Mensal",
    annual: "Anual",
    trial: "Trial",
  }
  return map[tipo.toLowerCase()] || tipo
}

function mapPaymentMethod(method: string | null): string {
  if (!method) return "--"
  const map: Record<string, string> = {
    pix: "PIX",
    credit_card: "Cartao de Credito",
  }
  return map[method.toLowerCase()] || method
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return "\u2014"
  return new Date(timestamp).toLocaleDateString("pt-BR")
}

function StatusBadge({ status }: { status: "Pago" | "Pendente" | "Vencido" }) {
  if (status === "Pago") {
    return (
      <Badge className="bg-green-100 text-green-700 border-0 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Pago
      </Badge>
    )
  }
  if (status === "Pendente") {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-0 gap-1">
        <Clock className="h-3 w-3" />
        Pendente
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-700 border-0 gap-1">
      <XCircle className="h-3 w-3" />
      Vencido
    </Badge>
  )
}

export default function PagamentosPage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("todos")
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get<AdminPayment[]>('payments')
      .then(setPayments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const mappedPayments = payments.map((p) => ({
    ...p,
    statusLabel: mapPaymentStatus(p.status),
    planoLabel: mapLicenseType(p.licenseType),
    metodoLabel: mapPaymentMethod(p.method),
    invoiceId: p.id.length > 8 ? p.id.substring(0, 8).toUpperCase() : p.id.toUpperCase(),
  }))

  const overduePayments = mappedPayments.filter((p) => p.statusLabel === "Vencido")
  const overdueTotal = overduePayments.reduce((sum, p) => sum + p.amount, 0)

  const completedPayments = mappedPayments.filter((p) => p.statusLabel === "Pago")
  const receitaTotal = completedPayments.reduce((sum, p) => sum + p.amount, 0)
  const pendentes = mappedPayments.filter((p) => p.statusLabel === "Pendente").length
  const atrasados = overduePayments.length

  const filteredPayments = mappedPayments.filter((p) => {
    const matchesSearch =
      p.empresa.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceId.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filterStatus === "todos" || p.statusLabel.toLowerCase() === filterStatus
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
            <p className="text-sm text-gray-500">
              Gerencie todos os pagamentos e faturas
            </p>
          </div>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
          <Download className="h-4 w-4" />
          Exportar Relatorio
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(receitaTotal)}</p>
                <p className="text-xs text-green-600 font-medium">{completedPayments.length} pagamentos confirmados</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Pagos</p>
                <p className="text-3xl font-bold text-gray-900">{completedPayments.length}</p>
                <p className="text-xs text-blue-600 font-medium">
                  {payments.length > 0 ? Math.round((completedPayments.length / payments.length) * 100) : 0}% do total
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-3xl font-bold text-gray-900">{pendentes}</p>
                <p className="text-xs text-yellow-600 font-medium">Aguardando</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Atrasados</p>
                <p className="text-3xl font-bold text-gray-900">{atrasados}</p>
                <p className="text-xs text-red-600 font-medium">Requer atencao</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert Banner */}
      {overduePayments.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-rose-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">
                  {overduePayments.length} pagamento(s) vencido(s)
                </p>
                <p className="text-sm text-red-600">
                  Valor total em atraso: {formatCurrency(overdueTotal)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Historico de Pagamentos
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar fatura ou empresa..."
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
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                  <option value="vencido">Vencido</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Fatura</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="hover:bg-gray-50/50"
                >
                  <TableCell className="font-mono text-sm font-medium text-gray-900">
                    {payment.invoiceId}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {payment.empresa}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        payment.planoLabel === "Trial"
                          ? "border-blue-200 text-blue-700 bg-blue-50"
                          : payment.planoLabel === "Mensal"
                            ? "border-purple-200 text-purple-700 bg-purple-50"
                            : "border-emerald-200 text-emerald-700 bg-emerald-50"
                      }
                    >
                      {payment.planoLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(payment.createdAt)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(payment.paidAt)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {payment.metodoLabel}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.statusLabel} />
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
