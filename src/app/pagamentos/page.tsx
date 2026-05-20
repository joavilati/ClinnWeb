'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, CheckCircle, CreditCard, HeadphonesIcon, Loader2, Clock, RefreshCw, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useApiClient } from '@/hooks/useApiClient'
import { useCachedData } from '@/hooks/useCachedData'
import { saveLicenseEndDate, saveLicenseStatus } from '@/lib/licenseGuard'
import { normalizeLicense } from '@/lib/normalizers'
import { CACHE_KEYS } from '@/lib/localCache'
import type { License } from '@/types'

const monthlyFeatures = [
  'NFS-e ilimitadas',
  'Assinatura digital',
  'Acesso completo à API',
  'Suporte por email',
]

const annualFeatures = [
  'Tudo do plano mensal',
  'Suporte prioritário',
  '2 meses grátis',
  'Relatórios avançados',
]

function formatLicenseType(type: string): string {
  switch (type.toLowerCase()) {
    case 'free': return 'Grátis'
    case 'trial': return 'Trial (7 dias)'
    case 'monthly': return 'Mensal'
    case 'annual': return 'Anual'
    case 'unlimited': return 'Ilimitada'
    default: return type
  }
}

function formatLicenseStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'active': return 'Ativa'
    case 'expired': return 'Expirada'
    case 'suspended': return 'Suspensa'
    default: return status
  }
}

function PagamentosContent() {
  const { apiFetch } = useApiClient()
  const searchParams = useSearchParams()
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null)
  const [reloading, setReloading] = useState(false)
  const [activatingLicense, setActivatingLicense] = useState(false)

  const { data: license, reload } = useCachedData<License>({
    cacheKey: CACHE_KEYS.LICENSE,
    apiUrl: '/api/license',
    normalize: normalizeLicense,
  })

  // Atualiza cache do licenseGuard sempre que os dados são carregados
  useEffect(() => {
    if (license?.status) {
      saveLicenseStatus(license.status)
      if (license.status.toLowerCase() === 'active' && license.endDate) {
        saveLicenseEndDate(license.endDate)
      }
    }
  }, [license])

  // Detecta retorno do pagamento com sucesso e ativa a licença
  useEffect(() => {
    const pagamento = searchParams.get('pagamento')
    const plano = searchParams.get('plano')
    if (pagamento === 'sucesso' && plano) {
      setActivatingLicense(true)
      const planType = plano.toUpperCase()

      apiFetch('/api/license', {
        method: 'POST',
        body: JSON.stringify({ type: planType }),
      })
        .then(async (res) => {
          if (res.ok) {
            toast.success('Pagamento confirmado! Sua licença foi ativada.')
            await reload()
          } else {
            const err = await res.json().catch(() => ({}))
            toast.error(err.message || 'Pagamento realizado, mas houve um erro ao ativar a licença. Entre em contato com o suporte.')
          }
        })
        .catch(() => {
          toast.error('Erro ao ativar licença. Entre em contato com o suporte.')
        })
        .finally(() => {
          setActivatingLicense(false)
          window.history.replaceState({}, '', '/pagamentos')
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubscribe = async (planType: string) => {
    setSubscribingPlan(planType)
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Erro ao criar pagamento')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao iniciar pagamento'
      toast.error(message)
    } finally {
      setSubscribingPlan(null)
    }
  }

  const currentType = license?.type?.toUpperCase() || 'TRIAL'
  const statusLower = license?.status?.toLowerCase()
  const daysRemaining = license?.endDate ? Math.max(0, Math.ceil((license.endDate - Date.now()) / (1000 * 60 * 60 * 24))) : 0
  const statusColor = statusLower === 'active' ? 'bg-green-500' : statusLower === 'expired' ? 'bg-red-500' : 'bg-amber-500'

  const isFree = currentType === 'FREE'
  const quota = license?.freeNotesQuota ?? 0
  const used = license?.notesUsedThisMonth ?? 0
  const quotaPct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0
  const quotaExhausted = quota > 0 && used >= quota
  const quotaRenewDate = license?.quotaPeriodEnd
    ? new Date(license.quotaPeriodEnd).toLocaleDateString('pt-BR')
    : null

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Planos</h1>
            <button onClick={async () => { setReloading(true); await reload(); setReloading(false); toast.success('Dados atualizados') }} disabled={reloading} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-[#7C3AED] transition-colors disabled:opacity-50" title="Recarregar" aria-label="Recarregar dados"><RefreshCw className={`w-5 h-5 ${reloading ? 'animate-spin' : ''}`} /></button>
          </div>

          {/* Ativando licença após pagamento */}
          {activatingLicense && (
            <Card className="border-none shadow-lg mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <p className="text-white font-semibold">Ativando sua licença...</p>
                </div>
              </div>
            </Card>
          )}

          {/* Current License Card */}
          {license && (
            <Card className="border-none shadow-lg mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Licença atual</p>
                    <p className="text-white text-xl font-bold">{formatLicenseType(currentType)}</p>
                  </div>
                  <div className={`${statusColor} px-3 py-1 rounded-lg`}>
                    <span className="text-white text-xs font-bold">{formatLicenseStatus(license.status)}</span>
                  </div>
                </div>
                {daysRemaining > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 text-white/90 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      {daysRemaining > 7 ? `Expira em ${daysRemaining} dias` : `${daysRemaining} dias restantes`}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Free Quota Usage Card */}
          {license && isFree && (
            <Card className="border-none shadow-lg mb-8 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Notas grátis este mês</p>
                    <p className="text-xs text-muted-foreground">
                      {used} de {quota} notas grátis usadas este mês
                    </p>
                  </div>
                </div>

                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${quotaExhausted ? 'bg-red-500' : 'bg-[#7C3AED]'}`}
                    style={{ width: `${quotaPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3">
                  {quotaRenewDate ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Renova em {quotaRenewDate}</span>
                    </div>
                  ) : <span />}
                  {quotaExhausted && (
                    <span className="text-xs font-semibold text-red-600">
                      Cota esgotada
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans Title */}
          <h2 className="text-xl font-bold text-foreground mb-6">Escolha seu plano</h2>

          {/* Plan Cards - Equal Height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Plan */}
            <Card className={`relative border-2 border-border shadow-md flex flex-col`}>
              <CardContent className="p-6 flex flex-col flex-1">
                <p className="text-lg font-bold text-foreground mb-3">Plano Mensal</p>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-foreground">R$ 99,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>

                <div className="border-t border-border my-5" />

                <ul className="space-y-3 flex-1">
                  {monthlyFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  className="w-full mt-6 h-11 font-semibold border-border"
                  onClick={() => handleSubscribe('MONTHLY')}
                  disabled={subscribingPlan === 'MONTHLY' || currentType === 'MONTHLY'}
                >
                  {subscribingPlan === 'MONTHLY' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecionando...</>
                  ) : currentType === 'MONTHLY' ? 'Plano Atual' : 'Assinar plano'}
                </Button>
              </CardContent>
            </Card>

            {/* Annual Plan */}
            <Card className={`relative border-2 border-[#7C3AED] shadow-lg flex flex-col`}>
              {/* Recommended badge */}
              <div className="absolute top-3 right-3 bg-[#7C3AED] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                Recomendado
              </div>

              <CardContent className="p-6 flex flex-col flex-1">
                <p className="text-lg font-bold text-foreground mb-3">Plano Anual</p>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-[#7C3AED]">R$ 999,90</span>
                  <span className="text-muted-foreground">/ano</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🔥</span>
                  <span className="text-sm text-green-600 font-semibold">Economize R$ 198,90</span>
                </div>

                <div className="border-t border-border my-5" />

                <ul className="space-y-3 flex-1">
                  {annualFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                      <span className="text-sm text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full mt-6 h-11 font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                  onClick={() => handleSubscribe('ANNUAL')}
                  disabled={subscribingPlan === 'ANNUAL' || currentType === 'ANNUAL'}
                >
                  {subscribingPlan === 'ANNUAL' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecionando...</>
                  ) : currentType === 'ANNUAL' ? 'Plano Atual' : 'Assinar plano'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <p className="font-bold text-sm text-foreground mb-1">Sem compromisso</p>
                <p className="text-xs text-muted-foreground">Cancele a qualquer momento sem multas ou taxas adicionais</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <p className="font-bold text-sm text-foreground mb-1">Pagamento seguro</p>
                <p className="text-xs text-muted-foreground">Transações protegidas com criptografia de ponta a ponta</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mb-3">
                  <HeadphonesIcon className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <p className="font-bold text-sm text-foreground mb-1">Suporte dedicado</p>
                <p className="text-xs text-muted-foreground">Equipe técnica disponível para ajudar quando precisar</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function PagamentosPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Planos</h1>
            </div>
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    }>
      <PagamentosContent />
    </Suspense>
  )
}
