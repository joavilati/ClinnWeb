'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Key,
  Gift,
  Clock,
  FileText,
  Users,
  Wrench,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  CreditCard,
  TrendingUp,
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import type { AdminEmissorDetail } from '@/types/admin'
import { toast } from 'sonner'

const statusLicencaColors: Record<string, string> = {
  Ativa: 'bg-green-100 text-green-700',
  Expirada: 'bg-red-100 text-red-700',
  Trial: 'bg-blue-100 text-blue-700',
  Suspensa: 'bg-yellow-100 text-yellow-700',
}

const statusPagamentoColors: Record<string, string> = {
  Pago: 'bg-green-100 text-green-700',
  Pendente: 'bg-yellow-100 text-yellow-700',
  Falhou: 'bg-red-100 text-red-700',
}

const statusPagamentoIcons: Record<string, React.ReactNode> = {
  Pago: <CheckCircle className="w-3.5 h-3.5" />,
  Pendente: <AlertCircle className="w-3.5 h-3.5" />,
  Falhou: <XCircle className="w-3.5 h-3.5" />,
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

function mapPaymentStatus(status: string): string {
  const map: Record<string, string> = {
    completed: 'Pago',
    pending: 'Pendente',
    failed: 'Falhou',
  }
  return map[status.toLowerCase()] || status
}

function mapPaymentMethod(method: string | null): string {
  if (!method) return '--'
  const map: Record<string, string> = {
    pix: 'PIX',
    credit_card: 'Cartão',
  }
  return map[method.toLowerCase()] || method
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(timestamp: number | null | undefined): string {
  if (!timestamp) return '--'
  return new Date(timestamp).toLocaleDateString('pt-BR')
}

export default function EmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [empresa, setEmpresa] = useState<AdminEmissorDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchEmpresa = () => {
    setLoading(true)
    adminApi.get<AdminEmissorDetail>(`emissores/${id}`)
      .then(setEmpresa)
      .catch(() => toast.error('Erro ao carregar dados da empresa'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchEmpresa()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleActivate = async () => {
    try {
      await adminApi.post(`licenses/${id}/reactivate`)
      toast.success('Licenca ativada com sucesso')
      fetchEmpresa()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao ativar licenca')
    }
  }

  const handleSuspend = async () => {
    try {
      await adminApi.post(`licenses/${id}/suspend`)
      toast.success('Licenca suspensa com sucesso')
      fetchEmpresa()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao suspender licenca')
    }
  }

  const handleExtend = async () => {
    try {
      await adminApi.post(`licenses/${id}/extend`, { days: 30 })
      toast.success('Licenca estendida em 30 dias')
      fetchEmpresa()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao estender licenca')
    }
  }

  const handleGrantCourtesy = async () => {
    try {
      await adminApi.post(`licenses/${id}/grant`, { type: 'MONTHLY' })
      toast.success('Cortesia concedida com sucesso')
      fetchEmpresa()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao conceder cortesia')
    }
  }

  const handleResetPassword = async () => {
    try {
      const result = await adminApi.post<{ newPassword: string }>(`emissores/${id}/reset-password`)
      toast.success(`Senha resetada com sucesso. Nova senha: ${result.newPassword}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao resetar senha')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Empresa não encontrada</p>
      </div>
    )
  }

  const licencaStatusLabel = mapLicenseStatus(empresa.licenca?.status)
  const licencaTipoLabel = mapLicenseType(empresa.licenca?.tipo)

  return (
    <div className="space-y-6">
      {/* Back button + Title */}
      <div className="flex items-center gap-4">
        <Link href="/admin/empresas">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{empresa.nomeFantasia}</h1>
          <p className="text-sm text-gray-500">ID: {id} &middot; {empresa.razaoSocial}</p>
        </div>
      </div>

      {/* Company Info + License - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Informacoes da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Razão Social</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{empresa.razaoSocial}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nome Fantasia</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{empresa.nomeFantasia}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">CNPJ</p>
                <p className="text-sm font-mono text-gray-900 mt-1">{empresa.cnpj}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Inscricao Municipal</p>
                <p className="text-sm font-mono text-gray-900 mt-1">{empresa.inscricaoMunicipal || '--'}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{empresa.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{empresa.telefone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p>{empresa.logradouro}, {empresa.numero}</p>
                  <p>{empresa.bairro} - {empresa.cidade}/{empresa.uf}</p>
                  <p className="text-gray-500">CEP: {empresa.cep}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current License Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              Licenca Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {empresa.licenca ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</p>
                    <Badge variant="outline" className="mt-1">{licencaTipoLabel}</Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        statusLicencaColors[licencaStatusLabel] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {licencaStatusLabel}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Data Início</p>
                    <p className="text-sm text-gray-900 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(empresa.licenca.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Data Expiracao</p>
                    <p className="text-sm text-gray-900 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(empresa.licenca.endDate)}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {empresa.licenca.diasRestantes ?? 0} dias restantes
                    </p>
                    <p className="text-xs text-blue-600">
                      A licenca expira em {formatDate(empresa.licenca.endDate)}
                    </p>
                  </div>
                </div>

                {empresa.licenca.features && empresa.licenca.features.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Features Incluidas</p>
                    <div className="space-y-2">
                      {empresa.licenca.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma licenca encontrada</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleActivate}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 transition-opacity"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Ativar Licenca
            </Button>
            <Button
              onClick={handleSuspend}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:opacity-90 transition-opacity"
            >
              <PauseCircle className="w-4 h-4 mr-2" />
              Suspender Licenca
            </Button>
            <Button
              onClick={handleExtend}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Estender Licenca (+30 dias)
            </Button>
            <Button
              onClick={handleGrantCourtesy}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
            >
              <Gift className="w-4 h-4 mr-2" />
              Conceder Cortesia
            </Button>
            <Button
              onClick={handleResetPassword}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Key className="w-4 h-4 mr-2" />
              Resetar Senha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-500" />
            Historico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresa.pagamentos.map((pagamento) => {
                const payStatusLabel = mapPaymentStatus(pagamento.status)
                return (
                  <TableRow key={pagamento.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-gray-700">
                      {formatDate(pagamento.paidAt || pagamento.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {formatCurrency(pagamento.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{mapPaymentMethod(pagamento.method)}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusPagamentoColors[payStatusLabel] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusPagamentoIcons[payStatusLabel]}
                        {payStatusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">{pagamento.id}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Estatisticas de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{empresa.uso.nfseEmitidas}</p>
                  <p className="text-xs text-gray-500">NFS-e Emitidas</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{empresa.uso.clientesCadastrados}</p>
                  <p className="text-xs text-gray-500">Clientes Cadastrados</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Wrench className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{empresa.uso.servicosCadastrados}</p>
                  <p className="text-xs text-gray-500">Serviços Cadastrados</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {empresa.licenca ? mapLicenseStatus(empresa.licenca.status) : '--'}
                  </p>
                  <p className="text-xs text-gray-500">Licenca</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {empresa.licenca ? `${formatDate(empresa.licenca.startDate)} a ${formatDate(empresa.licenca.endDate)}` : '--'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
