'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Check, User, FileText, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useApiClient } from '@/hooks/useApiClient'
import { useCachedData } from '@/hooks/useCachedData'
import type { Client, Service, CreateClientRequest } from '@/types'
import { normalizeClients, normalizeServices } from '@/lib/normalizers'
import { CACHE_KEYS, removeCache } from '@/lib/localCache'
import { isLicenseActive } from '@/lib/licenseGuard'
import { LicenseExpiredModal } from '@/components/LicenseExpiredModal'
import { formatMoney, extractMoneyDigits, moneyDigitsToNumber, numberToMoneyDigits, formatPercent, percentDigitsToNumber } from '@/lib/masks'

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const avatarColors = [
  'from-[#7C3AED] to-[#6D28D9]', // purple
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-teal-500 to-teal-600',
]

function getAvatarColor(index: number): string {
  return avatarColors[index % avatarColors.length]
}

export default function NovaNotaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { apiFetch } = useApiClient()

  // ---------- Cached data ----------
  const {
    data: clients,
    isLoading: loadingClients,
    reload: reloadClients,
    updateCache: updateClientsCache,
  } = useCachedData<Client[]>({
    cacheKey: CACHE_KEYS.CLIENTS,
    apiUrl: '/api/clients',
    normalize: normalizeClients,
  })

  const {
    data: services,
    isLoading: loadingServices,
    reload: reloadServices,
  } = useCachedData<Service[]>({
    cacheKey: CACHE_KEYS.SERVICES,
    apiUrl: '/api/services',
    normalize: normalizeServices,
  })

  // ---------- License check ----------
  const [showLicenseModal, setShowLicenseModal] = useState(false)

  useEffect(() => {
    if (!isLicenseActive()) {
      setShowLicenseModal(true)
    }
  }, [])

  // ---------- State ----------
  const [reloadingClients, setReloadingClients] = useState(false)
  const [reloadingServices, setReloadingServices] = useState(false)
  const [step, setStep] = useState<'clients' | 'service' | 'review'>('clients')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedClientIndex, setSelectedClientIndex] = useState<number>(0)
  const [selectedService, setSelectedService] = useState('')
  const [serviceValue, setServiceValue] = useState('')
  const [issRetido, setIssRetido] = useState(false)
  const [responsavelRetencao, setResponsavelRetencao] = useState('TOMADOR')
  const [aliquotaIss, setAliquotaIss] = useState('')
  const [valorTotalRetido, setValorTotalRetido] = useState('')
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [sendCopy, setSendCopy] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [emitting, setEmitting] = useState(false)
  const [savingClient, setSavingClient] = useState(false)
  const [emittedNoteNumber, setEmittedNoteNumber] = useState('')

  const [newClientData, setNewClientData] = useState<CreateClientRequest>({
    razaoSocial: '',
    documentType: 'CPF',
    document: '',
    email: '',
    phone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    estado: '',
    municipio: '',
  })

  // ---------- Duplicate handling ----------
  const isDuplicate = searchParams.get('duplicate') === 'true'
  const duplicateHandled = useRef(false)

  useEffect(() => {
    if (!isDuplicate || duplicateHandled.current) return
    if (!clients || clients.length === 0) return
    if (!services || services.length === 0) return
    duplicateHandled.current = true

    const clientDocument = searchParams.get('clientDocument') || ''
    const clientName = searchParams.get('clientName') || ''
    const paramServiceId = searchParams.get('serviceId') || ''
    const paramServiceValue = searchParams.get('serviceValue') || ''

    // Find matching client by cpfCnpj, fallback to companyName
    let clientIndex = clients.findIndex((c) => c.cpfCnpj === clientDocument)
    if (clientIndex === -1 && clientName) {
      clientIndex = clients.findIndex((c) => c.companyName === clientName)
    }
    if (clientIndex !== -1) {
      const client = clients[clientIndex]
      setSelectedClient(client)
      setSelectedClientIndex(clientIndex)
    }

    // Pre-fill service value (convert number string like "200" to money digits like "20000")
    if (paramServiceValue) {
      const numValue = parseFloat(paramServiceValue)
      if (!isNaN(numValue)) {
        setServiceValue(numberToMoneyDigits(numValue))
      }
    }

    // Try to match service by id
    if (paramServiceId) {
      const matchedService = services.find((s) => s.id === paramServiceId)
      if (matchedService) {
        setSelectedService(matchedService.id)
      }
    }

    // Jump to service step
    setStep('service')
  }, [isDuplicate, clients, services, searchParams])

  // ---------- Derived ----------
  const filteredClients = useMemo(
    () =>
      (clients || []).filter(
        (c) =>
          c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.cpfCnpj.includes(searchTerm)
      ),
    [clients, searchTerm]
  )

  const selectedServiceData = useMemo(
    () => (services || []).find((s) => s.id === selectedService),
    [services, selectedService]
  )

  const numericValue = moneyDigitsToNumber(serviceValue)
  const numericAliquota = percentDigitsToNumber(aliquotaIss)
  const numericValorRetido = moneyDigitsToNumber(valorTotalRetido)
  const calculatedIss = issRetido ? (numericValue * (numericAliquota / 100)).toFixed(2) : '0.00'
  const totalValue = numericValue.toFixed(2)
  const netValue = issRetido ? (numericValue - numericValorRetido).toFixed(2) : totalValue

  // ---------- Handlers ----------
  const handleClientSelect = (client: Client, index: number) => {
    if (!isLicenseActive()) {
      setShowLicenseModal(true)
      return
    }
    setSelectedClient(client)
    setSelectedClientIndex(index)
    setStep('service')
  }

  const handleContinue = () => {
    if (!selectedService || !serviceValue) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setStep('review')
  }

  const handleConfirmEmit = async () => {
    if (!selectedClient || !selectedServiceData) return
    // Checa licença antes de emitir
    if (!isLicenseActive()) {
      setShowLicenseModal(true)
      return
    }
    setEmitting(true)
    try {
      const res = await apiFetch('/api/nfse/emitir', {
        method: 'POST',
        body: JSON.stringify({
          clientId: selectedClient.id,
          serviceId: selectedServiceData.id,
          valorServico: numericValue,
          issRetidoNaFonte: issRetido,
          responsavelRetencao: issRetido ? responsavelRetencao : undefined,
          aliquotaIss: issRetido ? numericAliquota : undefined,
          valorTotalRetido: issRetido ? numericValorRetido : undefined,
          sendEmailCopy: sendCopy,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Erro ao emitir nota')
      }

      const data = await res.json()
      setEmittedNoteNumber(data?.numeroNota || '')
      setShowSuccessModal(true)
      // Invalidar caches que dependem de notas
      removeCache(CACHE_KEYS.NOTES)
      removeCache(CACHE_KEYS.DASHBOARD)
      toast.success('Nota fiscal emitida com sucesso!')
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || 'Erro ao emitir nota fiscal')
    } finally {
      setEmitting(false)
    }
  }

  const handleSaveNewClient = async () => {
    if (!newClientData.razaoSocial || !newClientData.document) {
      toast.error('Preencha o nome e documento do cliente')
      return
    }
    setSavingClient(true)
    try {
      const res = await apiFetch('/api/clients', {
        method: 'POST',
        body: JSON.stringify(newClientData),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Erro ao cadastrar cliente')
      }

      toast.success('Cliente cadastrado com sucesso!')
      setShowNewClientModal(false)
      setNewClientData({
        razaoSocial: '',
        documentType: 'CPF',
        document: '',
        email: '',
        phone: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        estado: '',
        municipio: '',
      })
      // Reload clients cache after creating new client
      await reloadClients()
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || 'Erro ao cadastrar cliente')
    } finally {
      setSavingClient(false)
    }
  }

  const resetWizard = () => {
    setShowSuccessModal(false)
    setStep('clients')
    setSelectedClient(null)
    setSelectedService('')
    setServiceValue('')
    setSendCopy(false)
    setIssRetido(false)
    setResponsavelRetencao('TOMADOR')
    setAliquotaIss('')
    setValorTotalRetido('')
    setEmittedNoteNumber('')
  }

  const licenseModal = <LicenseExpiredModal open={showLicenseModal} onClose={() => setShowLicenseModal(false)} />

  // ====================================================
  // STEP 1 - CLIENT SELECTION
  // ====================================================
  if (step === 'clients') {
    return (
      <DashboardLayout>
        {licenseModal}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/10 to-transparent rounded-3xl -z-10"></div>
              <div className="py-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Nova Nota Fiscal</h1>
                <p className="text-gray-600">Selecione o cliente para iniciar a emissão</p>
              </div>
            </div>

            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Selecionar Cliente</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Escolha ou cadastre um novo cliente
                    </p>
                  </div>
                  <button onClick={async () => { setReloadingClients(true); await reloadClients(); setReloadingClients(false); toast.success('Clientes atualizados') }} disabled={reloadingClients} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#7C3AED] transition-colors disabled:opacity-50" title="Recarregar clientes"><RefreshCw className={`w-5 h-5 ${reloadingClients ? 'animate-spin' : ''}`} /></button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou documento..."
                      className="pl-10 h-12 border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => setShowNewClientModal(true)}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] text-white h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Cliente
                  </Button>
                </div>

                {loadingClients ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
                    <span className="ml-3 text-gray-600">Carregando clientes...</span>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Nenhum cliente encontrado</p>
                    <p className="text-sm mt-1">Cadastre um novo cliente para continuar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredClients.map((client, index) => (
                      <div
                        key={client.id}
                        onClick={() => handleClientSelect(client, index)}
                        className="p-5 border-2 border-gray-100 rounded-xl hover:border-[#7C3AED] hover:bg-gradient-to-r hover:from-[#FAF5FF] hover:to-white cursor-pointer transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(index)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                              {client.companyName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-[#7C3AED] transition-colors">
                                {client.companyName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {client.documentType}: {client.cpfCnpj}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* New Client Modal */}
          <Dialog open={showNewClientModal} onOpenChange={setShowNewClientModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
              {/* Header */}
              <div className="px-8 pt-8 pb-4">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900">Novo Cliente</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Preencha os dados do cliente para cadastrá-lo no sistema
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="px-8 pb-8 space-y-6">
                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Dados Pessoais</h3>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">Razão Social / Nome Completo</Label>
                    <Input
                      value={newClientData.razaoSocial}
                      onChange={(e) =>
                        setNewClientData({ ...newClientData, razaoSocial: e.target.value })
                      }
                      placeholder="Digite o nome completo ou razão social"
                      className="h-11 bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">Tipo de Documento</Label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setNewClientData({ ...newClientData, documentType: 'CPF' })}
                        className={`flex-1 h-11 rounded-lg border-2 font-medium text-sm transition-all ${
                          newClientData.documentType === 'CPF'
                            ? 'border-[#7C3AED] bg-[#FAF5FF] text-[#7C3AED]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        CPF - Pessoa Física
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewClientData({ ...newClientData, documentType: 'CNPJ' })}
                        className={`flex-1 h-11 rounded-lg border-2 font-medium text-sm transition-all ${
                          newClientData.documentType === 'CNPJ'
                            ? 'border-[#7C3AED] bg-[#FAF5FF] text-[#7C3AED]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        CNPJ - Pessoa Jurídica
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-gray-700">{newClientData.documentType}</Label>
                      <Input
                        value={newClientData.document}
                        onChange={(e) =>
                          setNewClientData({ ...newClientData, document: e.target.value })
                        }
                        placeholder={
                          newClientData.documentType === 'CPF'
                            ? '000.000.000-00'
                            : '00.000.000/0000-00'
                        }
                        className="h-11 bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-gray-700">Email</Label>
                      <Input
                        type="email"
                        value={newClientData.email}
                        onChange={(e) =>
                          setNewClientData({ ...newClientData, email: e.target.value })
                        }
                        placeholder="email@exemplo.com"
                        className="h-11 bg-white border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">Telefone</Label>
                    <Input
                      value={newClientData.phone}
                      onChange={(e) =>
                        setNewClientData({ ...newClientData, phone: e.target.value })
                      }
                      placeholder="(00) 00000-0000"
                      className="h-11 bg-white border-gray-300 max-w-xs"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Endereço</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-gray-700">CEP</Label>
                      <Input
                        value={newClientData.cep}
                        onChange={(e) =>
                          setNewClientData({ ...newClientData, cep: e.target.value })
                        }
                        placeholder="00000-000"
                        className="h-11 bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-sm text-gray-700">Logradouro</Label>
                      <Input
                        value={newClientData.logradouro}
                        onChange={(e) =>
                          setNewClientData({ ...newClientData, logradouro: e.target.value })
                        }
                        placeholder="Rua, Avenida..."
                        className="h-11 bg-white border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-gray-700">Número</Label>
                      <Input
                        value={newClientData.numero}
                        onChange={(e) =>
                          setNewClientData({ ...newClientData, numero: e.target.value })
                        }
                        placeholder="123"
                        className="h-11 bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-sm text-gray-700">Complemento</Label>
                      <Input
                        value={newClientData.complemento}
                        onChange={(e) =>
                          setNewClientData({ ...newClientData, complemento: e.target.value })
                        }
                        placeholder="Apto, Sala..."
                        className="h-11 bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-gray-700">Bairro</Label>
                      <Input
                        value={newClientData.bairro}
                        onChange={(e) =>
                          setNewClientData({ ...newClientData, bairro: e.target.value })
                        }
                        placeholder="Nome do bairro"
                        className="h-11 bg-white border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-gray-700">Estado</Label>
                      <Select
                        value={newClientData.estado}
                        onValueChange={(value) =>
                          setNewClientData({ ...newClientData, estado: value })
                        }
                      >
                        <SelectTrigger className="h-11 bg-white border-gray-300">
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {estados.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-gray-700">Município</Label>
                      <Input
                        value={newClientData.municipio}
                        onChange={(e) =>
                          setNewClientData({ ...newClientData, municipio: e.target.value })
                        }
                        placeholder="Nome da cidade"
                        className="h-11 bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewClientModal(false)}
                    className="flex-1 h-11"
                    disabled={savingClient}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveNewClient}
                    className="flex-1 h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                    disabled={savingClient}
                  >
                    {savingClient ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Cliente'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    )
  }

  // ====================================================
  // STEP 2 - SERVICE SELECTION
  // ====================================================
  if (step === 'service') {
    return (
      <DashboardLayout>
        {licenseModal}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white flex items-center justify-center font-bold shadow-lg">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-[#7C3AED]">Cliente</span>
                </div>
                <div className="w-20 h-1 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]"></div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white flex items-center justify-center font-bold shadow-lg">
                    2
                  </div>
                  <span className="text-sm font-medium text-[#7C3AED]">Serviço</span>
                </div>
                <div className="w-20 h-1 bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center font-bold">
                    3
                  </div>
                  <span className="text-sm font-medium text-gray-400">Revisão</span>
                </div>
              </div>
            </div>

            {/* Client Info Card (collapsible) */}
            {selectedClient ? (
              <Card className="border-none shadow-md mb-6">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(selectedClientIndex)} flex items-center justify-center text-white font-bold shadow`}>
                        {selectedClient.companyName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{selectedClient.companyName}</p>
                        <p className="text-sm text-gray-500">{selectedClient.cpfCnpj}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep('clients')}
                      className="text-[#7C3AED] border-[#7C3AED] hover:bg-[#7C3AED] hover:text-white"
                    >
                      Alterar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-md mb-6 border-l-4 border-l-amber-400">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Cliente não encontrado. Selecione outro cliente.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep('clients')}
                      className="text-[#7C3AED] border-[#7C3AED] hover:bg-[#7C3AED] hover:text-white"
                    >
                      Selecionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Selection - Radio list */}
            <Card className="border-none shadow-md mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-gray-900">Serviço</h3>
                  <button onClick={async () => { setReloadingServices(true); await reloadServices(); setReloadingServices(false); toast.success('Serviços atualizados') }} disabled={reloadingServices} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#7C3AED] transition-colors disabled:opacity-50" title="Recarregar serviços"><RefreshCw className={`w-4 h-4 ${reloadingServices ? 'animate-spin' : ''}`} /></button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Selecione o serviço prestado</p>

                {loadingServices ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
                    <span className="ml-3 text-gray-500 text-sm">Carregando serviços...</span>
                  </div>
                ) : !services || services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium text-sm">Nenhum serviço cadastrado</p>
                    <p className="text-xs mt-1">Cadastre serviços em Configurações &gt; Serviços</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(services || []).map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setSelectedService(service.id)}
                        className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          selectedService === service.id
                            ? 'border-[#7C3AED] bg-[#FAF5FF]'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedService === service.id
                            ? 'border-[#7C3AED] bg-[#7C3AED]'
                            : 'border-gray-300'
                        }`}>
                          {selectedService === service.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${selectedService === service.id ? 'text-[#7C3AED]' : 'text-gray-900'}`}>
                            {service.name}
                          </p>
                          {service.description && (
                            <p className="text-sm text-gray-500 truncate">{service.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {service.cnae}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Value */}
            <Card className="border-none shadow-md mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Valor do Serviço</h3>
                <div className="max-w-sm">
                  <Input
                    value={formatMoney(serviceValue)}
                    onChange={(e) => setServiceValue(extractMoneyDigits(e.target.value))}
                    placeholder="R$ 0,00"
                    className="h-14 text-xl font-bold bg-white border-gray-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* ISS Retido na Fonte */}
            <Card className="border-none shadow-md mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">ISS Retido na Fonte?</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Ative se o ISS será retido pelo tomador</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={issRetido}
                      onChange={(e) => setIssRetido(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C3AED]"></div>
                  </label>
                </div>

                {issRetido && (
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-5">
                    {/* Responsável pela Retenção */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Responsável pela Retenção</Label>
                      <Select value={responsavelRetencao} onValueChange={setResponsavelRetencao}>
                        <SelectTrigger className="h-11 bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TOMADOR">Tomador do Serviço</SelectItem>
                          <SelectItem value="INTERMEDIARIO">Intermediário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Alíquota ISS */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Alíquota ISS (%)</Label>
                      <Input
                        value={formatPercent(aliquotaIss)}
                        onChange={(e) => setAliquotaIss(extractMoneyDigits(e.target.value))}
                        placeholder="0,00%"
                        className="h-11 bg-white border-gray-300 max-w-xs"
                      />
                    </div>

                    {/* Valor Total Retido */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Valor Total Retido</Label>
                      <Input
                        value={formatMoney(valorTotalRetido)}
                        onChange={(e) => setValorTotalRetido(extractMoneyDigits(e.target.value))}
                        placeholder="R$ 0,00"
                        className="h-11 bg-white border-gray-300 max-w-xs"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep('clients')}
                className="flex-1 h-12 border-gray-300 hover:bg-gray-50 font-semibold"
              >
                Voltar
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedService || !serviceValue}
                className="flex-1 h-12 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar para Revisão
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ====================================================
  // STEP 3 - REVIEW
  // ====================================================
  if (step === 'review') {
    return (
      <DashboardLayout>
        {licenseModal}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white flex items-center justify-center font-bold shadow-lg">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-[#7C3AED]">Cliente</span>
                </div>
                <div className="w-20 h-1 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]"></div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white flex items-center justify-center font-bold shadow-lg">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-[#7C3AED]">Serviço</span>
                </div>
                <div className="w-20 h-1 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]"></div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white flex items-center justify-center font-bold shadow-lg animate-pulse">
                    3
                  </div>
                  <span className="text-sm font-medium text-[#7C3AED]">Revisão</span>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/10 to-transparent rounded-3xl -z-10"></div>
              <div className="py-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Revisão da Nota Fiscal
                </h1>
                <p className="text-gray-600">
                  Confira todos os dados antes de emitir a NFS-e
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Client Info */}
                <Card className="border-none shadow-xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      Dados do Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                          {selectedClient?.companyName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Nome/Razão Social
                          </p>
                          <p className="font-bold text-gray-900 text-xl mb-2">
                            {selectedClient?.companyName}
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                Documento
                              </p>
                              <p className="font-medium text-gray-900">
                                {selectedClient?.documentType}: {selectedClient?.cpfCnpj}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                Email
                              </p>
                              <p className="font-medium text-gray-900">
                                {selectedClient?.email || 'Não informado'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {selectedClient?.address && (
                        <div className="pt-4 border-t">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                            Endereço Completo
                          </p>
                          <p className="font-medium text-gray-900">
                            {[
                              selectedClient.address.logradouro,
                              selectedClient.address.numero,
                              selectedClient.address.bairro,
                              selectedClient.address.municipio,
                              selectedClient.address.estado,
                            ]
                              .filter(Boolean)
                              .join(', ') || 'Não informado'}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Service Info */}
                <Card className="border-none shadow-xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      Dados do Serviço
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                          Serviço Prestado
                        </p>
                        <p className="font-bold text-gray-900 text-lg mb-2">
                          {selectedServiceData?.name}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Código</p>
                            <p className="font-semibold text-gray-900">
                              {selectedServiceData?.cTribNac}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">CNAE</p>
                            <p className="font-semibold text-gray-900">
                              {selectedServiceData?.cnae}
                            </p>
                          </div>
                        </div>
                      </div>

                      {issRetido && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                              ISS Retido
                            </p>
                            <p className="font-semibold text-gray-900">Sim</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                              Responsável
                            </p>
                            <p className="font-semibold text-gray-900">
                              {responsavelRetencao === 'TOMADOR' ? 'Tomador' : 'Intermediário'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                              Alíquota ISS
                            </p>
                            <p className="font-semibold text-gray-900">{formatPercent(aliquotaIss) || '0%'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                              Valor Retido
                            </p>
                            <p className="font-semibold text-gray-900">{formatMoney(valorTotalRetido) || 'R$ 0,00'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Send Copy Option */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          id="send-copy"
                          checked={sendCopy}
                          onChange={(e) => setSendCopy(e.target.checked)}
                          className="w-5 h-5 text-[#7C3AED] rounded focus:ring-[#7C3AED] cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <Label
                          htmlFor="send-copy"
                          className="cursor-pointer font-bold text-gray-900 text-base mb-1 block"
                        >
                          Enviar cópia por email
                        </Label>
                        <p className="text-sm text-gray-700">
                          Uma cópia da NFS-e será enviada automaticamente para{' '}
                          <span className="font-semibold">
                            {selectedClient?.email || 'o email do cliente'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Summary */}
              <div className="space-y-6">
                {/* Value Summary */}
                <Card className="border-none shadow-xl overflow-hidden sticky top-8">
                  <div className="h-2 bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9]"></div>
                  <CardHeader className="bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white">
                    <CardTitle className="text-xl flex items-center justify-between">
                      <span>Resumo Financeiro</span>
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <span className="text-lg font-bold">$</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b-2 border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Valor Bruto
                          </p>
                          <p className="font-bold text-gray-900 text-lg">
                            {formatMoney(serviceValue) || 'R$ 0,00'}
                          </p>
                        </div>
                      </div>

                      {issRetido && (
                        <div className="bg-red-50 p-4 rounded-xl border-2 border-red-100">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs text-red-600 uppercase tracking-wide font-semibold">
                              ISS Retido
                            </p>
                            <p className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                              {formatPercent(aliquotaIss) || '0%'}
                            </p>
                          </div>
                          <p className="font-bold text-red-600 text-lg">
                            - {formatMoney(valorTotalRetido) || 'R$ 0,00'}
                          </p>
                        </div>
                      )}

                      <div className="bg-gradient-to-br from-[#7C3AED]/10 to-[#6D28D9]/5 p-5 rounded-xl border-2 border-[#7C3AED]/20">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-2 font-semibold">
                          Valor Líquido
                        </p>
                        <p className="text-3xl font-bold text-[#7C3AED]">
                          {numericValue > 0 ? (parseFloat(netValue)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Valor a receber após impostos
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3 border-t-2 border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setStep('service')}
                        className="w-full h-12 border-2 border-gray-300 hover:bg-gray-50 font-semibold"
                      >
                        Editar Dados
                      </Button>
                      <Button
                        onClick={handleConfirmEmit}
                        disabled={emitting}
                        className="w-full h-14 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] shadow-lg hover:shadow-xl transition-all duration-200 text-white font-bold text-base"
                      >
                        {emitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Emitindo...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Confirmar e Emitir NFS-e
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Box */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <CardContent className="p-5">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white text-xl font-bold">ℹ</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-2 text-base">
                          Atenção
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Após a emissão, a nota fiscal não poderá ser editada.
                          Certifique-se de que todas as informações estão corretas antes
                          de prosseguir.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Success Modal */}
          <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
            <DialogContent className="max-w-md text-center">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  Nota Emitida com Sucesso!
                </DialogTitle>
                <DialogDescription className="sr-only">
                  A nota fiscal foi emitida com sucesso e está pronta para visualização
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-6">
                <div className="w-20 h-20 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6">
                  <Check className="w-10 h-10 text-[#7C3AED]" />
                </div>
                <p className="text-gray-600 mb-6">
                  {emittedNoteNumber
                    ? `NFS-e N. ${emittedNoteNumber} foi gerada com sucesso`
                    : 'NFS-e foi gerada com sucesso'}
                </p>
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={resetWizard}
                    className="flex-1"
                  >
                    Voltar ao Início
                  </Button>
                  <Button
                    className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                    onClick={() => router.push('/notas-emitidas')}
                  >
                    Visualizar NFS-e
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    )
  }

  return null
}
