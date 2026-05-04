'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Building2,
  Download,
  Search,
  Filter,
  Eye,
  MoreVertical,
  TrendingUp,
  CreditCard,
  Users,
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import type { AdminEmissor } from '@/types/admin'

const statusColors: Record<string, string> = {
  Ativa: 'bg-green-100 text-green-700',
  Expirada: 'bg-red-100 text-red-700',
  Trial: 'bg-blue-100 text-blue-700',
  Suspensa: 'bg-yellow-100 text-yellow-700',
  'Sem licenca': 'bg-gray-100 text-gray-700',
}

function mapLicenseStatus(status: string | undefined | null): string {
  if (!status) return 'Sem licenca'
  const map: Record<string, string> = {
    active: 'Ativa',
    expired: 'Expirada',
    suspended: 'Suspensa',
    trial: 'Trial',
  }
  return map[status.toLowerCase()] || status
}

function mapLicenseType(tipo: string | undefined | null): string {
  if (!tipo) return '--'
  const map: Record<string, string> = {
    monthly: 'Mensal',
    annual: 'Anual',
    trial: 'Trial',
  }
  return map[tipo.toLowerCase()] || tipo
}

function getValorMensal(tipo: string | undefined | null): string {
  if (!tipo) return 'R$ 0,00'
  const lower = tipo.toLowerCase()
  if (lower === 'trial') return 'R$ 0,00'
  if (lower === 'monthly') return 'R$ 99,90'
  if (lower === 'annual') return 'R$ 83,33'
  return 'R$ 0,00'
}

function getValorMensalNum(tipo: string | undefined | null): number {
  if (!tipo) return 0
  const lower = tipo.toLowerCase()
  if (lower === 'trial') return 0
  if (lower === 'monthly') return 99.90
  if (lower === 'annual') return 83.33
  return 0
}

export default function EmpresasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [empresas, setEmpresas] = useState<AdminEmissor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get<AdminEmissor[]>('emissores')
      .then(setEmpresas)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredEmpresas = empresas.filter(
    (empresa) =>
      empresa.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.cnpj.includes(searchTerm) ||
      empresa.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalEmpresas = empresas.length
  const ativas = empresas.filter((e) => e.licenca?.status?.toLowerCase() === 'active').length
  const receitaMensal = empresas.reduce((sum, e) => sum + getValorMensalNum(e.licenca?.tipo), 0)

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
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
            <p className="text-sm text-gray-500">Gerencie todas as empresas cadastradas</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition-opacity">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Empresas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalEmpresas}</p>
                <p className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {ativas} ativas
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Planos Ativos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{ativas}</p>
                <p className="text-sm text-gray-500 mt-1">Trial, Mensal, Anual</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 shadow-md">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Receita Mensal</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitaMensal)}
                </p>
                <p className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  estimativa mensal
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 shadow-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Lista de Empresas
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar empresa..."
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" title="Filtrar">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" title="Exportar">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status Licenca</TableHead>
                <TableHead className="text-right">NFS-e Emitidas</TableHead>
                <TableHead className="text-right">Valor Mensal</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmpresas.map((empresa) => {
                const statusLabel = mapLicenseStatus(empresa.licenca?.status)
                const planoLabel = mapLicenseType(empresa.licenca?.tipo)
                return (
                  <TableRow key={empresa.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{empresa.nomeFantasia}</p>
                        <p className="text-xs text-gray-500">{empresa.razaoSocial}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 font-mono text-sm">
                      {empresa.cnpj}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{planoLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[statusLabel] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-gray-700 font-medium">
                      {empresa.nfseEmitidas.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right text-gray-700 font-medium">
                      {getValorMensal(empresa.licenca?.tipo)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(empresa.dataCadastro).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/empresas/${empresa.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver detalhes">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Mais opcoes">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
