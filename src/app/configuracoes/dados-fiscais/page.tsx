'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Check, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/hooks/useApiClient'
import { useCachedData } from '@/hooks/useCachedData'
import { CACHE_KEYS } from '@/lib/localCache'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'

const regimeOptions = [
  {
    value: 'competencia',
    label: 'Regime de Competência',
    description: 'Tributos são calculados com base na data de emissão da nota',
  },
  {
    value: 'caixa',
    label: 'Regime de Caixa',
    description: 'Tributos são calculados com base na data de pagamento',
  },
  {
    value: 'misto',
    label: 'Regime Misto',
    description: 'Combinação dos regimes de competência e caixa',
  },
]

const issOptions = [
  { value: 'exigivel', label: 'Exigível', description: 'ISS é exigível normalmente' },
  { value: 'não-incidencia', label: 'Não Incidência', description: 'Serviço não está sujeito ao ISS' },
  { value: 'isencao', label: 'Isenção', description: 'Serviço está isento de ISS' },
  { value: 'exportação', label: 'Exportação', description: 'Serviço prestado para o exterior' },
  { value: 'imunidade', label: 'Imunidade', description: 'Imune à tributação do ISS' },
  { value: 'suspensa', label: 'Exigibilidade Suspensa', description: 'Exigibilidade do ISS está suspensa' },
]

interface RadioCardProps {
  value: string
  label: string
  description: string
  selected: boolean
  onSelect: (value: string) => void
}

function RadioCard({ value, label, description, selected, onSelect }: RadioCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? 'border-[#7C3AED] bg-[#FAF5FF] dark:bg-[#7C3AED]/20 shadow-sm'
          : 'border-border hover:border-muted-foreground/40 hover:bg-accent/40'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? 'border-[#7C3AED] bg-[#7C3AED]' : 'border-border'
        }`}>
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${selected ? 'text-[#7C3AED] dark:text-[#C4B5FD]' : 'text-foreground'}`}>{label}</p>
          <p className={`text-sm mt-0.5 ${selected ? 'text-foreground/80' : 'text-muted-foreground'}`}>{description}</p>
        </div>
      </div>
    </button>
  )
}

interface TaxConfigData {
  regimeApuracao: string
  exigibilidadeISS: string
  simplesNacional: boolean
}

export default function DadosFiscaisPage() {
  const router = useRouter()
  const { apiFetch } = useApiClient()
  const [regimeApuracao, setRegimeApuracao] = useState('competencia')
  const [exigibilidadeISS, setExigibilidadeISS] = useState('exigivel')
  const [simplesNacional, setSimplesNacional] = useState(true)
  const [loading, setLoading] = useState(false)
  const [reloading, setReloading] = useState(false)

  const normalizeTaxConfig = useCallback((raw: unknown): TaxConfigData => {
    const obj = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {}
    const data = (obj.data && typeof obj.data === 'object') ? obj.data as Record<string, unknown> : obj
    return {
      regimeApuracao: String(data.regimeApuracao || 'competencia'),
      exigibilidadeISS: String(data.exigibilidadeISS || 'exigivel'),
      simplesNacional: data.simplesNacional !== undefined ? Boolean(data.simplesNacional) : true,
    }
  }, [])

  const { data: cachedData, reload, updateCache } = useCachedData<TaxConfigData>({
    cacheKey: CACHE_KEYS.TAX_CONFIG,
    apiUrl: '/api/configuracoes/dados-fiscais',
    normalize: normalizeTaxConfig,
  })

  useEffect(() => {
    if (cachedData) {
      setRegimeApuracao(cachedData.regimeApuracao)
      setExigibilidadeISS(cachedData.exigibilidadeISS)
      setSimplesNacional(cachedData.simplesNacional)
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
      const response = await apiFetch('/api/configuracoes/dados-fiscais', {
        method: 'PUT',
        body: JSON.stringify({ regimeApuracao, exigibilidadeISS, simplesNacional }),
      })

      if (response.ok) {
        updateCache({ regimeApuracao, exigibilidadeISS, simplesNacional })
        toast.success('Dados fiscais salvos com sucesso!')
        router.push('/configuracoes')
      } else {
        toast.error('Erro ao salvar dados fiscais')
      }
    } catch {
      toast.error('Erro ao salvar dados fiscais')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/configuracoes">
                <Button variant="ghost" className="-ml-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <button onClick={handleReload} disabled={reloading} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-[#7C3AED] transition-colors disabled:opacity-50" title="Recarregar" aria-label="Recarregar dados"><RefreshCw className={`w-5 h-5 ${reloading ? 'animate-spin' : ''}`} /></button>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Dados Fiscais</h1>
            <p className="text-muted-foreground mt-2">Configure as informações fiscais da empresa</p>
          </div>

          <div className="space-y-8">
            {/* Regime de Apuração */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Regime de Apuração de Tributos</CardTitle>
                <p className="text-sm text-muted-foreground">Selecione como os tributos são calculados</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regimeOptions.map((option) => (
                    <RadioCard
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      description={option.description}
                      selected={regimeApuracao === option.value}
                      onSelect={setRegimeApuracao}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Simples Nacional */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="simples-nacional" className="text-base font-semibold">
                      Simples Nacional
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Marque se sua empresa é optante pelo Simples Nacional
                    </p>
                  </div>
                  <Switch
                    id="simples-nacional"
                    checked={simplesNacional}
                    onCheckedChange={setSimplesNacional}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Exigibilidade do ISS */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Exigibilidade do ISS</CardTitle>
                <p className="text-sm text-muted-foreground">Defina a exigibilidade do ISS para os serviços</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {issOptions.map((option) => (
                    <RadioCard
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      description={option.description}
                      selected={exigibilidadeISS === option.value}
                      onSelect={setExigibilidadeISS}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/configuracoes" className="flex-1">
                <Button variant="outline" className="w-full">
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
