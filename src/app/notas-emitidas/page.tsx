'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/hooks/useApiClient'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Search, MoreVertical, Eye, Copy, XCircle, FileText, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useCachedData } from '@/hooks/useCachedData'
import { normalizeNotes } from '@/lib/normalizers'
import { CACHE_KEYS, removeCache } from '@/lib/localCache'
import { isLicenseActive } from '@/lib/licenseGuard'
import { LicenseExpiredModal } from '@/components/LicenseExpiredModal'
import type { NfseNote, NoteStatus } from '@/types'

const statusConfig: Record<NoteStatus, { label: string; className: string }> = {
  emitida: { label: 'Emitida', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  cancelada: { label: 'Cancelada', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR')
  } catch {
    return dateStr
  }
}

// Skeleton components
function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
      <td className="px-6 py-4 text-right"><div className="h-5 w-5 bg-gray-200 rounded ml-auto" /></td>
    </tr>
  )
}

export default function NotasEmitidasPage() {
  const { apiFetch } = useApiClient()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelMotivo, setCancelMotivo] = useState('')
  const [cancelNoteId, setCancelNoteId] = useState<string | null>(null)
  const [showLicenseModal, setShowLicenseModal] = useState(false)
  const [reloading, setReloading] = useState(false)

  const { data: allNotes, error, isLoading, reload } = useCachedData<NfseNote[]>({
    cacheKey: CACHE_KEYS.NOTES,
    apiUrl: '/api/notes',
    normalize: normalizeNotes,
  })

  // Filtro client-side
  const notes = useMemo(() => {
    if (!allNotes) return []
    return allNotes.filter((note) => {
      // Filtro de busca
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchClient = note.clientName?.toLowerCase().includes(term)
        const matchNumber = note.numeroNota?.toLowerCase().includes(term)
        if (!matchClient && !matchNumber) return false
      }
      // Filtro de mês/ano pela data de criação
      if (selectedMonth || selectedYear) {
        try {
          const date = new Date(note.createdAt)
          if (selectedYear && date.getFullYear().toString() !== selectedYear) return false
          if (selectedMonth && String(date.getMonth() + 1).padStart(2, '0') !== selectedMonth) return false
        } catch {
          return false
        }
      }
      return true
    })
  }, [allNotes, searchTerm, selectedMonth, selectedYear])

  const openCancelModal = (noteId: string) => {
    if (!isLicenseActive()) {
      setShowLicenseModal(true)
      return
    }
    setCancelNoteId(noteId)
    setCancelMotivo('')
    setCancelModalOpen(true)
  }

  const closeCancelModal = () => {
    if (cancellingId) return
    setCancelModalOpen(false)
    setCancelNoteId(null)
    setCancelMotivo('')
  }

  const handleConfirmCancel = async () => {
    if (!cancelNoteId || cancellingId) return
    if (!cancelMotivo.trim()) {
      toast.error('Informe o motivo do cancelamento')
      return
    }
    setCancellingId(cancelNoteId)
    try {
      const res = await apiFetch('/api/nfse/cancel', {
        method: 'POST',
        body: JSON.stringify({ noteId: cancelNoteId, motivo: cancelMotivo.trim() }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Falha ao cancelar nota')
      }
      toast.success('Nota cancelada com sucesso')
      closeCancelModal()
      removeCache(CACHE_KEYS.DASHBOARD)
      await reload()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar nota'
      toast.error(message)
    } finally {
      setCancellingId(null)
    }
  }

  const handleDuplicate = (note: NfseNote) => {
    if (!isLicenseActive()) {
      setShowLicenseModal(true)
      return
    }
    const params = new URLSearchParams({
      duplicate: 'true',
      clientName: note.clientName || '',
      clientDocument: note.clientDocument || '',
      serviceId: note.serviceId || '',
      serviceValue: note.valorServico?.toString() || '',
    })
    router.push(`/nova-nota?${params.toString()}`)
  }

  const handleView = (note: NfseNote) => {
    router.push(`/notas-emitidas/${note.id}`)
  }

  return (
    <DashboardLayout>
      <LicenseExpiredModal open={showLicenseModal} onClose={() => setShowLicenseModal(false)} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/10 to-transparent rounded-3xl -z-10"></div>
            <div className="py-6">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">Notas Emitidas</h1>
                <button onClick={async () => { setReloading(true); await reload(); setReloading(false); toast.success('Dados atualizados') }} disabled={reloading} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#7C3AED] transition-colors disabled:opacity-50" title="Recarregar"><RefreshCw className={`w-5 h-5 ${reloading ? 'animate-spin' : ''}`} /></button>
              </div>
              <p className="text-gray-600">Gerencie e acompanhe todas as suas notas fiscais</p>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              Não foi possível carregar as notas. Tente novamente mais tarde.
            </div>
          )}

          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="text-xl">Histórico de Notas</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Filters */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente ou número da nota..."
                    className="pl-10 h-12 border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40 h-12 border-gray-200">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32 h-12 border-gray-200">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nota #</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Data</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Serviço</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Valor</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Situação</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                    ) : !notes || notes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center text-gray-500">
                            <FileText className="w-12 h-12 mb-3 text-gray-300" />
                            <p className="font-medium text-lg">Nenhuma nota encontrada</p>
                            <p className="text-sm mt-1">
                              {searchTerm || selectedMonth
                                ? 'Tente ajustar os filtros de busca'
                                : 'Comece emitindo sua primeira nota fiscal'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      notes.map((note) => {
                        const status = statusConfig[note.status] || statusConfig.pendente
                        return (
                          <tr
                            key={note.id}
                            className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-semibold text-[#7C3AED]">
                              {note.numeroNota}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(note.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {note.clientName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {note.serviceDescription}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">
                              {formatCurrency(note.valorServico)}
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={status.className}>{status.label}</Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                                  <MoreVertical className="w-5 h-5 text-gray-600" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleView(note)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Visualizar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicate(note)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicar
                                  </DropdownMenuItem>
                                  {note.status !== 'cancelada' && (
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => openCancelModal(note.id)}
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Cancelar
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmação de Cancelamento */}
      <Dialog open={cancelModalOpen} onOpenChange={(open) => { if (!open) closeCancelModal() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle>Cancelar Nota Fiscal</DialogTitle>
                <DialogDescription className="mt-1">
                  Esta ação não pode ser desfeita. A nota fiscal será cancelada permanentemente.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-2">
            <label htmlFor="cancel-motivo" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo do cancelamento <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cancel-motivo"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] focus:outline-none resize-none placeholder:text-gray-400"
              placeholder="Informe o motivo do cancelamento da nota fiscal..."
              value={cancelMotivo}
              onChange={(e) => setCancelMotivo(e.target.value)}
              disabled={!!cancellingId}
            />
          </div>

          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeCancelModal}
              disabled={!!cancellingId}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={!!cancellingId || !cancelMotivo.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancellingId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Confirmar Cancelamento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
