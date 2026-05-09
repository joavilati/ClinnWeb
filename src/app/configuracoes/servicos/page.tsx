'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useApiClient } from '@/hooks/useApiClient'
import { useCachedData } from '@/hooks/useCachedData'
import { CACHE_KEYS } from '@/lib/localCache'
import { formatMoney, extractMoneyDigits, moneyDigitsToNumber } from '@/lib/masks'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'


interface ServiceItem {
  id: string
  name: string
  description: string
  code: string
  cnae: string
  value: string
}

function normalizeServiceList(raw: unknown): ServiceItem[] {
  if (!raw || typeof raw !== 'object') return []
  const obj = raw as Record<string, unknown>
  const list: unknown[] = Array.isArray(raw) ? raw : (obj.services as unknown[] ?? obj.data as unknown[] ?? [])
  if (!Array.isArray(list)) return []
  return list.map((item: unknown) => {
    const s = item as Record<string, unknown>
    const data = (s.data && typeof s.data === 'object') ? s.data as Record<string, unknown> : s
    return {
      id: String(s.id || ''),
      name: String(data.name || data.nome || ''),
      description: String(data.description || data.descricao || ''),
      code: String(data.ctribNac || data.cTribNac || data.code || ''),
      cnae: String(data.cnae || ''),
      value: data.defaultValue != null ? `R$ ${Number(data.defaultValue).toFixed(2).replace('.', ',')}` : String(data.value || ''),
    }
  })
}

export default function ServicosPage() {
  const { apiFetch } = useApiClient()
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [loadingSave, setLoadingSave] = useState(false)
  const [reloading, setReloading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    cnae: '',
    value: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateService = (): Record<string, string> => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = 'Nome é obrigatório'
    if (!formData.description.trim()) errs.description = 'Descrição é obrigatória'
    if (!formData.code.replace(/\D/g, '')) errs.code = 'Código de Tributação é obrigatório'
    if (!formData.cnae.replace(/\D/g, '')) errs.cnae = 'CNAE é obrigatório'
    return errs
  }

  useEffect(() => {
    setErrors(prev => {
      if (Object.keys(prev).length === 0) return prev
      const next = { ...prev }
      let changed = false
      if (prev.name && formData.name.trim()) { delete next.name; changed = true }
      if (prev.description && formData.description.trim()) { delete next.description; changed = true }
      if (prev.code && formData.code.replace(/\D/g, '')) { delete next.code; changed = true }
      if (prev.cnae && formData.cnae.replace(/\D/g, '')) { delete next.cnae; changed = true }
      return changed ? next : prev
    })
  }, [formData.name, formData.description, formData.code, formData.cnae])

  const normalizeServices = useCallback((raw: unknown): ServiceItem[] => {
    return normalizeServiceList(raw)
  }, [])

  const { data: services, isLoading: loadingList, reload } = useCachedData<ServiceItem[]>({
    cacheKey: CACHE_KEYS.SERVICES,
    apiUrl: '/api/configuracoes/servicos',
    normalize: normalizeServices,
  })

  const handleOpenModal = (service?: ServiceItem) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        description: service.description,
        code: service.code,
        cnae: service.cnae,
        value: extractMoneyDigits(service.value),
      })
    } else {
      setEditingService(null)
      setFormData({
        name: '',
        description: '',
        code: '',
        cnae: '',
        value: '',
      })
    }
    setErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingService(null)
    setFormData({
      name: '',
      description: '',
      code: '',
      cnae: '',
      value: '',
    })
    setErrors({})
  }

  const handleSave = async () => {
    const errs = validateService()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Preencha os campos obrigatórios')
      return
    }
    setErrors({})

    setLoadingSave(true)
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      cTribNac: formData.code.trim(),
      cnae: formData.cnae.trim(),
      defaultValue: moneyDigitsToNumber(formData.value),
    }
    try {
      if (editingService) {
        const response = await apiFetch(`/api/configuracoes/servicos/${editingService.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          await reload()
          toast.success('Serviço atualizado com sucesso!')
        } else {
          toast.error('Erro ao atualizar serviço')
        }
      } else {
        const response = await apiFetch(`/api/configuracoes/servicos`, {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          await reload()
          toast.success('Serviço cadastrado com sucesso!')
        } else {
          toast.error('Erro ao cadastrar serviço')
        }
      }
      handleCloseModal()
    } catch {
      toast.error('Erro ao salvar serviço')
    } finally {
      setLoadingSave(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await apiFetch(`/api/configuracoes/servicos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await reload()
        toast.success('Serviço removido com sucesso!')
      } else {
        toast.error('Erro ao remover serviço')
      }
    } catch {
      toast.error('Erro ao remover serviço')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/configuracoes">
              <Button
                variant="ghost"
                className="mb-4 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
                <p className="text-muted-foreground mt-2">Gerencie os serviços cadastrados</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={async () => { setReloading(true); await reload(); setReloading(false); toast.success('Dados atualizados') }} disabled={reloading} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-[#7C3AED] transition-colors disabled:opacity-50" title="Recarregar" aria-label="Recarregar dados"><RefreshCw className={`w-5 h-5 ${reloading ? 'animate-spin' : ''}`} /></button>
                <Button
                  onClick={() => handleOpenModal()}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Serviço
                </Button>
              </div>
            </div>
          </div>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Lista de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-background border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nome do Serviço</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Código Tributação</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">CNAE</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Valor Padrão</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingList ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Carregando serviços...
                        </td>
                      </tr>
                    ) : !services || services.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Nenhum serviço cadastrado
                        </td>
                      </tr>
                    ) : (
                      (services || []).map((service) => (
                        <tr key={service.id} className="hover:bg-background transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{service.name}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{service.code}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{service.cnae}</td>
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{service.value}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenModal(service)}
                                className="text-[#7C3AED] hover:text-[#6D28D9] hover:bg-[#F3E8FF]"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(service.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome do Serviço</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Consulta Médica"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição que aparecerá na nota"
                  aria-invalid={!!errors.description}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código de Tributação</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: 0101"
                    aria-invalid={!!errors.code}
                  />
                  {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                </div>
                <div className="space-y-2">
                  <Label>CNAE</Label>
                  <Input
                    value={formData.cnae}
                    onChange={(e) => setFormData({ ...formData, cnae: e.target.value })}
                    placeholder="Ex: 8630-5/01"
                    aria-invalid={!!errors.cnae}
                  />
                  {errors.cnae && <p className="text-sm text-red-500">{errors.cnae}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valor Padrão</Label>
                <Input
                  value={formatMoney(formData.value)}
                  onChange={(e) => setFormData({ ...formData, value: extractMoneyDigits(e.target.value) })}
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loadingSave}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                >
                  {loadingSave
                    ? 'Salvando...'
                    : editingService
                      ? 'Salvar Alterações'
                      : 'Cadastrar Serviço'
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
