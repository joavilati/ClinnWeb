'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/hooks/useApiClient'
import { useCachedData } from '@/hooks/useCachedData'
import { CACHE_KEYS } from '@/lib/localCache'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'


interface NfseControlData {
  serie: string
  numeroInicial: number
  sequenciaAutomatica: boolean
}

export default function SerieNumeracaoPage() {
  const router = useRouter()
  const { apiFetch } = useApiClient()
  const [serie, setSerie] = useState('001')
  const [numeroInicial, setNumeroInicial] = useState('1')
  const [sequenciaAutomatica, setSequenciaAutomatica] = useState(true)
  const [loading, setLoading] = useState(false)
  const [reloading, setReloading] = useState(false)

  const normalizeNfseControl = useCallback((raw: unknown): NfseControlData => {
    const obj = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {}
    const data = (obj.data && typeof obj.data === 'object') ? obj.data as Record<string, unknown> : obj
    return {
      serie: String(data.serie || '001'),
      numeroInicial: Number(data.numeroInicial) || 1,
      sequenciaAutomatica: data.sequenciaAutomatica !== undefined ? Boolean(data.sequenciaAutomatica) : true,
    }
  }, [])

  const { data: cachedData, reload, updateCache } = useCachedData<NfseControlData>({
    cacheKey: CACHE_KEYS.NFSE_CONTROL,
    apiUrl: '/api/configuracoes/serie-numeracao',
    normalize: normalizeNfseControl,
  })

  useEffect(() => {
    if (cachedData) {
      setSerie(cachedData.serie)
      setNumeroInicial(String(cachedData.numeroInicial))
      setSequenciaAutomatica(cachedData.sequenciaAutomatica)
    }
  }, [cachedData])

  const handleReload = async () => {
    setReloading(true)
    await reload()
    setReloading(false)
    toast.success('Dados atualizados')
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(`/api/configuracoes/serie-numeracao`, {
        method: 'PUT',
        body: JSON.stringify({
          serie,
          numeroInicial: Number(numeroInicial),
          sequenciaAutomatica,
        }),
      })

      if (response.ok) {
        updateCache({ serie, numeroInicial: Number(numeroInicial), sequenciaAutomatica })
        toast.success('Série e numeração configuradas com sucesso!')
        router.push('/configuracoes')
      } else {
        toast.error('Erro ao salvar série e numeração')
      }
    } catch {
      toast.error('Erro ao salvar série e numeração')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/configuracoes">
                <Button
                  variant="ghost"
                  className="-ml-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <button onClick={handleReload} disabled={reloading} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#7C3AED] transition-colors disabled:opacity-50" title="Recarregar" aria-label="Recarregar dados"><RefreshCw className={`w-5 h-5 ${reloading ? 'animate-spin' : ''}`} /></button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Série e Numeração (NFS-e)</h1>
            <p className="text-gray-600 mt-2">Configure a série e sequência das notas fiscais</p>
          </div>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Configuração de Numeração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="serie">Série da NFS-e</Label>
                <Input
                  id="serie"
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  placeholder="001"
                  className="max-w-xs"
                />
                <p className="text-sm text-gray-600">
                  Identifica a série das notas fiscais (geralmente 001)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero-inicial">Número Inicial</Label>
                <Input
                  id="numero-inicial"
                  type="number"
                  value={numeroInicial}
                  onChange={(e) => setNumeroInicial(e.target.value)}
                  placeholder="1"
                  className="max-w-xs"
                />
                <p className="text-sm text-gray-600">
                  Número da próxima nota fiscal a ser emitida
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="sequencia-automatica" className="text-base font-semibold">
                    Sequência Automática
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Incrementar numeração automaticamente a cada nota emitida
                  </p>
                </div>
                <Switch
                  id="sequencia-automatica"
                  checked={sequenciaAutomatica}
                  onCheckedChange={setSequenciaAutomatica}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Informação</h4>
                <p className="text-sm text-blue-800">
                  A numeração das notas fiscais deve ser sequencial e sem quebras. Certifique-se de que o número inicial está correto antes de começar a emitir notas.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/configuracoes" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </Link>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                >
                  {loading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
